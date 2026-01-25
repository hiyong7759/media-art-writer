const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-pro";

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("Warning: GEMINI_API_KEY is not set. Using fallback prompts.");
}

const { validateContent } = require('./safety-check');
const { analyzeAndGenerateStyle } = require('./style-analyzer');

async function generateArtworkForArtist(artist, date) {
    console.log(`[${artist.name}] Generating artwork...`);

    let generatedPrompt = "";

    if (genAI) {
        try {
            // 1. Generate detailed prompt with AI
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            const promptReq = `
              Artist: ${artist.name} (${artist.theme})
              Description: ${artist.description}
              Style: ${artist.promptBase}
              
              Create a prompt for a generative, non-representational abstract artwork.
              Focus on colors, shapes, movement, and feelings.
            `;

            const result = await model.generateContent(promptReq);
            generatedPrompt = result.response.text().trim();
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

    // 5. Save Prompt Text (For Manual Image Generation)
    const promptFile = path.join(__dirname, `../data/prompts/${date}/${artist.id}.txt`);
    const promptDir = path.dirname(promptFile);
    if (!fs.existsSync(promptDir)) {
        fs.mkdirSync(promptDir, { recursive: true });
    }
    fs.writeFileSync(promptFile, generatedPrompt);
    console.log(`[${artist.name}] Prompt saved to ${promptFile}`);

    // 6. Save Metadata File
    const outputFile = path.join(__dirname, `../data/artworks/${date}/${artist.id}.json`);
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(artworkData, null, 2));
    console.log(`[${artist.name}] Metadata saved to ${outputFile}`);
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

        for (const artist of targetArtists) {
            try {
                await generateArtworkForArtist(artist, targetDate);
            } catch (err) {
                console.error(`Failed to generate for ${artist.name}:`, err.message);
                // Continue to next artist even if one fails
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
        process.exit(1);
    }
}

main();
