const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-3-flash-preview";

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenAI({ apiKey: API_KEY, apiVersion: "v1alpha" });
} else {
    console.warn("Warning: GEMINI_API_KEY is not set. Using fallback prompts.");
}

const { validateContent } = require('./safety-check');
const { analyzeAndGenerateStyle } = require('./style-analyzer');
const HISTORY_FILE = path.join(__dirname, '../data/history.json');

// Helper: Load or Build History
function loadOrBuildHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }

    console.log("Building history index from existing artworks...");
    const history = {};
    const artworksDir = path.join(__dirname, '../data/artworks');

    if (fs.existsSync(artworksDir)) {
        const dates = fs.readdirSync(artworksDir);
        for (const date of dates) {
            const dateDir = path.join(artworksDir, date);
            if (fs.statSync(dateDir).isDirectory()) {
                const files = fs.readdirSync(dateDir).filter(f => f.endsWith('.json'));
                for (const file of files) {
                    try {
                        const content = JSON.parse(fs.readFileSync(path.join(dateDir, file), 'utf8'));
                        const artistId = content.artistId;
                        if (!history[artistId]) history[artistId] = {};
                        history[artistId][date] = content.prompt;
                    } catch (e) {
                        console.error(`Error reading ${date}/${file}:`, e.message);
                    }
                }
            }
        }
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    return history;
}

// Helper: Update History
function updateHistory(artistId, date, prompt) {
    let history = {};
    if (fs.existsSync(HISTORY_FILE)) {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }

    if (!history[artistId]) history[artistId] = {};
    history[artistId][date] = prompt;

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

async function generateBatchArtworks(artists, date, history) {
    console.log(`Starting Batch Generation for ${artists.length} artists...`);

    // Prepare Batch Context
    const artistContexts = artists.map(artist => {
        const pastPromptsObj = history[artist.id] || {};
        const pastPrompts = Object.entries(pastPromptsObj)
            .filter(([d, _]) => d !== date)
            .map(([_, p]) => p)
            .slice(-10); // Last 10 works

        return {
            id: artist.id,
            name: artist.name,
            theme: artist.theme,
            philosophy: artist.description,
            baseStyle: artist.promptBase,
            colors: artist.styleHints.colorPalette.join(', '),
            pastPrompts: pastPrompts
        };
    });

    // High-Fidelity Prompt Engineering
    const systemPrompt = `
      You are an expert Art Director and Prompt Engineer for a high-end digital art exhibition.
      Your task is to generate **production-ready**, **highly detailed** image generation prompts for ${artists.length} distinct artists.

      ## Global Quality Standards (Must apply to ALL prompts):
      - **Render Quality**: Unreal Engine 5, Octane Render, 8k resolution, hyper-realistic, sharp focus, raytracing.
      - **Lighting**: Volumetric lighting, cinematic lighting, dramatic shadows, global illumination.
      - **Texture**: Detailed textures, subsurface scattering (if applicable), intricate details.
      - **Composition**: Golden ratio, rule of thirds, dynamic perspective, depth of field.
      
      ## Instructions:
      1. **Uniqueness**: For each artist, check their 'pastPrompts'. Generate something COMPLETELY NEW in terms of composition and subject matter while keeping their 'Theme' and 'BaseStyle'.
      2. **Specificity**: Avoid vague terms like "abstract art". Be specific: "shattering glass shards suspended in mid-air", "liquid chrome flowing over obsidian rocks".
      3. **Structure**: 
         - Subject Description (Unique for today)
         - Artist's Visual Style (BaseStyle + Colors)
         - Technical Specs (Lighting, Render, Quality)
      
      ## Input Data:
      ${JSON.stringify(artistContexts, null, 2)}

      ## Output Format:
      Return a **JSON Object** where keys are 'artistId' and values are the generated prompt strings.
      Example: { "aura-7": "Detailed prompt...", "kuro-x": "Detailed prompt..." }
    `;

    try {
        console.log("Sending batch request to Gemini...");
        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            config: { responseMimeType: "application/json" },
            contents: [{ parts: [{ text: systemPrompt }] }]
        });

        // New SDK response checking
        const responseText = result.text;
        if (!responseText) throw new Error("No text in response");

        const generatedPrompts = JSON.parse(responseText);

        console.log("Batch generation successful. Processing results...");

        for (const artist of artists) {
            let prompt = generatedPrompts[artist.id];

            if (!prompt) {
                console.error(`No prompt generated for ${artist.name}. Using fallback.`);
                prompt = artist.promptBase;
            } else {
                // Safety Check
                const isSafe = await validateContent(prompt);
                if (!isSafe) {
                    console.warn(`[${artist.name}] Safety check failed. Using fallback.`);
                    prompt = artist.promptBase;
                }
            }

            console.log(`[${artist.name}] Prompt: ${prompt.substring(0, 50)}...`);

            // Generate Style Analysis
            const styleData = analyzeAndGenerateStyle(artist, prompt);

            // Create Metadata
            const artworkData = {
                date: date,
                artistId: artist.id,
                title: "Daily Creation",
                prompt: prompt,
                style: styleData,
                generatedAt: new Date().toISOString()
            };

            // Save Metadata
            const outputFile = path.join(__dirname, `../data/artworks/${date}/${artist.id}.json`);
            const dir = path.dirname(outputFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(outputFile, JSON.stringify(artworkData, null, 2));
            console.log(`[${artist.name}] Saved to ${outputFile}`);

            // Update History
            updateHistory(artist.id, date, prompt);
        }

    } catch (error) {
        console.error("Batch generation failed:", error);
        process.exit(1);
    }
}

async function generateArtworkForArtist(artist, date, history) {
    console.log(`[${artist.name}] Generating artwork...`);

    let generatedPrompt = "";

    if (genAI) {
        try {
            // 1. Generate detailed prompt with AI
            // New SDK call
            const result = await genAI.models.generateContent({
                model: MODEL_NAME,
                contents: [{ parts: [{ text: promptReq }] }]
            });

            generatedPrompt = result.text ? result.text.trim() : "";
            if (!generatedPrompt) throw new Error("Empty response from AI");

            console.log(`[${artist.name}] Generated Prompt (AI): ${generatedPrompt}`);

            // 2. Safety Check (Only if AI was used)
            const isSafe = await validateContent(generatedPrompt);
            if (!isSafe) {
                console.warn(`[${artist.name}] Safety check failed for AI prompt. Using fallback.`);
                generatedPrompt = artist.promptBase;
            }
        } catch (err) {
            console.error(`[${artist.name}] AI Generation failed: ${err.message}. Using fallback.`);
            generatedPrompt = artist.promptBase;
        }
    } else {
        // Fallback if no API key
        console.log(`[${artist.name}] Using fallback prompt (No API Key).`);
        generatedPrompt = artist.promptBase;
    }

    // 3. Style Analysis
    const styleData = analyzeAndGenerateStyle(artist, generatedPrompt);

    // 4. Create Metadata
    const artworkData = {
        date: date,
        artistId: artist.id,
        title: "Daily Creation",
        prompt: generatedPrompt,
        style: styleData,
        generatedAt: new Date().toISOString()
    };

    // 5. Save Metadata File (Prompts are now only stored here, not as separate txt files)
    const outputFile = path.join(__dirname, `../data/artworks/${date}/${artist.id}.json`);
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(artworkData, null, 2));
    console.log(`[${artist.name}] Metadata saved to ${outputFile}`);

    // 6. Update History
    updateHistory(artist.id, date, generatedPrompt);
}

async function main() {
    try {
        const artistsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/artists.json'), 'utf8'));

        // Parse arguments for manual regeneration
        // Usage: node generate.js [artistId] [date]
        // Handle empty string arguments from GH Actions
        const arg2 = process.argv[2];
        const arg3 = process.argv[3];

        const targetArtistId = (arg2 && arg2.trim() !== '') ? arg2 : 'all';

        // Calculate KST Date (UTC+9)
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(Date.now() + kstOffset);
        const todayKST = kstDate.toISOString().split('T')[0];

        const targetDate = (arg3 && arg3.trim() !== '') ? arg3 : todayKST;

        let targetArtists = artistsData.artists;

        if (targetArtistId !== 'all') {
            targetArtists = targetArtists.filter(a => a.id === targetArtistId);
            if (targetArtists.length === 0) {
                console.error(`Artist ID '${targetArtistId}' not found.`);
                process.exit(1);
            }
        }

        console.log(`Starting generation for ${targetArtists.length} artist(s) on ${targetDate}...`);

        if (genAI) {
            // Batch Mode
            const history = loadOrBuildHistory();
            await generateBatchArtworks(targetArtists, targetDate, history);
        } else {
            // Local/No-API Mode (Fallback)
            console.log("No API Key. Running in fallback mode...");
            for (const artist of targetArtists) {
                console.log(`[${artist.name}] Fallback (No AI)`);
                const prompt = artist.promptBase;
                // (Simplified fallback save logic would go here, omitting for batch refactor clarity)
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
        process.exit(1);
    }
}

main();
