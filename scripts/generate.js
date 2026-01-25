const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-pro"; // Or "gemini-1.5-flash" depending on availability

if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const { validateContent } = require('./safety-check');
const { analyzeAndGenerateStyle } = require('./style-analyzer');

async function generateArtworkForArtist(artist, date) {
    console.log(`[${artist.name}] Generating artwork...`);

    // 1. Generate detailed prompt
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const promptReq = `
      Artist: ${artist.name} (${artist.theme})
      Description: ${artist.description}
      Style: ${artist.promptBase}
      
      Create a prompt for a generative, non-representational abstract artwork.
      Focus on colors, shapes, movement, and feelings.
    `;

    const result = await model.generateContent(promptReq);
    const generatedPrompt = result.response.text().trim();
    console.log(`[${artist.name}] Generated Prompt: ${generatedPrompt}`);

    // 2. Safety Check
    const isSafe = await validateContent(generatedPrompt);
    if (!isSafe) {
        throw new Error(`[${artist.name}] Safety check failed.`);
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
        const targetArtistId = process.argv[2];
        const targetDate = process.argv[3] || new Date().toISOString().split('T')[0];

        let targetArtists = artistsData.artists;

        if (targetArtistId && targetArtistId !== 'all') {
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
