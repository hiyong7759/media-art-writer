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

        // Handle description object (fallback to string if legacy)
        const descEn = (typeof artist.description === 'object') ? artist.description.en : artist.description;

        return {
            id: artist.id,
            name: artist.name,
            theme: artist.theme,
            philosophy: descEn,
            baseStyle: artist.promptBase,
            colors: artist.styleHints.colorPalette.join(', '),
            pastPrompts: pastPrompts
        };
    });

    // High-Fidelity Prompt Engineering
    const systemPrompt = `
      You are an expert Art Director and Prompt Engineer for a high-end digital art exhibition.
      Your task is to generate **production-ready**, **highly detailed** image generation prompts and metadata for ${artists.length} distinct artists.

      ## Global Quality Standards (Must apply to ALL prompts):
      - **Render Quality**: Unreal Engine 5, Octane Render, 8k resolution, hyper-realistic, sharp focus, raytracing.
      - **Lighting**: Volumetric lighting, cinematic lighting, dramatic shadows, global illumination.
      - **Texture**: Detailed textures, subsurface scattering (if applicable), intricate details.
      - **Complexity**: NEVER use simple descriptions. Always describe complex interactions of light, form, and texture.
      - **Specific Focus**:
        - AQUA-5: Focus on fluid simulation, caustic patterns, bubbles, and deep-sea translucency.
        - PRISM-2: Focus on spectral dispersion, refractive indices, crystal facets, and light splitting.
        - TERRA-1: Focus on erosion patterns, geological strata, sedimentary layers, and raw organic textures.
        - VOID-3: Focus on nebulous gas clouds, star clusters, event horizons, and cosmic scale.
      
      ## Instructions:
      1. **Uniqueness**: Review 'pastPrompts'. Generate something COMPLETELY NEW in terms of composition and subject matter while keeping their 'Theme' and 'BaseStyle'.
      2. **Structure**: 
         - Subject Description (Unique for today)
         - Artist's Visual Style (BaseStyle + Colors)
         - Technical Specs (Lighting, Render, Quality)
      3. **Metadata**: Create a poetic Title and Description in both English and Korean.

      ## Input Data:
      ${JSON.stringify(artistContexts, null, 2)}

      ## Output Format:
      Return a **JSON Object** where keys are 'artistId' and values are objects containing:
      - 'prompt': The detailed English art prompt.
      - 'title_en': Title in English.
      - 'title_ko': Title in Korean.
      - 'description_en': Short poetic description in English (1-2 sentences).
      - 'description_ko': Short poetic description in Korean (1-2 sentences).
      
      Example: 
      { 
        "aura-7": { 
            "prompt": "...", 
            "title_en": "Whisper of the Deep", 
            "title_ko": "심해의 속삭임",
            "description_en": "...", 
            "description_ko": "..."
        } 
      }
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

        // Check for duplicates and collect failures
        const failedArtists = [];
        const validResults = {};

        for (const artist of artists) {
            let data = generatedPrompts[artist.id];
            let prompt = data ? data.prompt : "";

            // Check duplicate against FULL history
            const pastHistory = history[artist.id];
            if (isDuplicate(prompt, pastHistory)) {
                console.log(`[${artist.name}] Generated prompt is too similar to past work. Queuing for retry.`);
                failedArtists.push(artist);
            } else if (!prompt) {
                console.log(`[${artist.name}] No prompt generated. Queuing for retry/fallback.`);
                failedArtists.push(artist);
            } else {
                validResults[artist.id] = { prompt: prompt, data: data };
            }
        }

        // 1. Process Valid Results
        for (const artist of artists) {
            if (failedArtists.includes(artist)) continue;

            const { prompt, data } = validResults[artist.id];
            await saveArtworkData(artist, date, prompt, data);
            updateHistory(artist.id, date, prompt);
        }

        // 2. Process Failed (Retry Individually)
        if (failedArtists.length > 0) {
            console.log(`Retrying ${failedArtists.length} artists individually...`);
            for (const artist of failedArtists) {
                await generateArtworkForArtist(artist, date, history);
            }
        }

    } catch (error) {
        console.error("Batch generation failed:", error);
        process.exit(1);
    }
}

// Helper: Common Save Logic
function saveArtworkData(artist, date, prompt, data) {
    // Generate Style Analysis
    const styleData = analyzeAndGenerateStyle(artist, prompt);

    // Fallback metadata if missing
    if (!data) {
        data = {
            title_en: "Daily Creation",
            title_ko: "오늘의 작품",
            description_en: "No description available",
            description_ko: "설명이 없습니다"
        };
    }

    // Create Metadata
    const artworkData = {
        date: date,
        artistId: artist.id,
        title: {
            ko: data.title_ko || "오늘의 작품",
            en: data.title_en || "Daily Creation"
        },
        description: {
            ko: data.description_ko || "설명이 없습니다",
            en: data.description_en || "No description available"
        },
        prompt: prompt,
        style: styleData,
        generatedAt: new Date().toISOString()
    };

    // Save Metadata File
    const outputFile = path.join(__dirname, `../data/artworks/${date}/${artist.id}.json`);
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(artworkData, null, 2));
    console.log(`[${artist.name}] Metadata saved to ${outputFile}`);
}

async function generateArtworkForArtist(artist, date, history, retryCount = 0) {
    if (retryCount > 3) {
        console.warn(`[${artist.name}] Max retries reached. Using fallback.`);
        const fallbackPrompt = artist.promptBase;
        // Even fallback should act as valid generation result
        saveArtworkData(artist, date, fallbackPrompt, null);
        updateHistory(artist.id, date, fallbackPrompt);
        return;
    }

    console.log(`[${artist.name}] Generating artwork (Attempt ${retryCount + 1})...`);

    let generatedPrompt = "";
    let generatedData = null;

    if (genAI) {
        try {
            // Individual Prompt Engineering
            const pastPromptsObj = history[artist.id] || {};
            const pastPrompts = Object.values(pastPromptsObj).slice(-10);

            const promptReq = `
                You are an expert Art Director. Generate a NEW, UNIQUE art prompt for artist '${artist.name}'.
                
                Artist Theme: ${artist.theme}
                Base Style: ${artist.promptBase}
                Past Works: ${JSON.stringify(pastPrompts)}
                
                CRITICAL INSTRUCTION:
                The new prompt MUST be significantly different from Past Works.
                
                Return JSON format:
                {
                    "prompt": "Detailed prompt string...",
                    "title_en": "Title",
                    "title_ko": "Title Korean",
                    "description_en": "Description",
                    "description_ko": "Description Korean"
                }
            `;

            const result = await genAI.models.generateContent({
                model: MODEL_NAME,
                config: { responseMimeType: "application/json" },
                contents: [{ parts: [{ text: promptReq }] }]
            });

            const responseText = result.text;
            if (!responseText) throw new Error("Empty response");

            generatedData = JSON.parse(responseText);
            generatedPrompt = generatedData.prompt;

            // DUPLICATE CHECK
            if (isDuplicate(generatedPrompt, history[artist.id])) {
                console.warn(`[${artist.name}] Duplicate detected on attempt ${retryCount + 1}. Retrying...`);
                await generateArtworkForArtist(artist, date, history, retryCount + 1);
                return;
            }

        } catch (err) {
            console.error(`[${artist.name}] AI Generation failed: ${err.message}.`);
            // If error is not fatal, maybe retry? For now, fallback if critical or count as retry
            // Here we retry to hope for transient error fix or duplicate skip
            if (retryCount < 3) {
                await generateArtworkForArtist(artist, date, history, retryCount + 1);
                return;
            }
        }
    }

    // Fallback if AI failed completely or no key (handled inside loop/condition usually, but here for safety)
    if (!generatedPrompt) {
        console.log(`[${artist.name}] Using fallback prompt.`);
        generatedPrompt = artist.promptBase;
    }

    saveArtworkData(artist, date, generatedPrompt, generatedData);
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
