const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const IMAGE_API_KEY = process.env.GEMINI_IMAGE_API_KEY || API_KEY;
const MODEL_NAME = "gemini-3-flash-preview";
const IMAGE_MODEL_NAME = "gemini-2.5-flash-image";

let genAI = null;
let imageGenAI = null;

if (API_KEY) {
    genAI = new GoogleGenAI(API_KEY);
    console.log("Text API initialized.");
}

if (IMAGE_API_KEY) {
    imageGenAI = new GoogleGenAI(IMAGE_API_KEY);
    console.log(`Image API initialized${IMAGE_API_KEY !== API_KEY ? " with separate key" : ""}.`);
}

if (!API_KEY && !IMAGE_API_KEY) {
    console.warn("Warning: No API keys set. Using fallback mode.");
}

const { analyzeAndGenerateStyle } = require('./style-analyzer');
const HISTORY_FILE = path.join(__dirname, '../data/history.json');

// Helper: Sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Markdown Json Cleaner
function cleanJsonString(str) {
    return str.replace(/```json\n?|```/g, "").trim();
}

// Helper: Load or Build History
function loadOrBuildHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
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
                    } catch (e) { }
                }
            }
        }
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    return history;
}

function updateHistory(artistId, date, prompt) {
    let history = fs.existsSync(HISTORY_FILE) ? JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')) : {};
    if (!history[artistId]) history[artistId] = {};
    history[artistId][date] = prompt;
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function getBigrams(text) {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    const bigrams = new Set();
    for (let i = 0; i < words.length - 1; i++) bigrams.add(`${words[i]} ${words[i + 1]}`);
    return bigrams;
}

function getSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    const s1 = getBigrams(text1), s2 = getBigrams(text2);
    if (s1.size === 0 || s2.size === 0) return 0;
    let intersection = 0;
    for (const item of s1) if (s2.has(item)) intersection++;
    return (2.0 * intersection) / (s1.size + s2.size);
}

function isDuplicate(newPrompt, historyObj) {
    if (!historyObj) return false;
    const THRESHOLD = 0.8;
    for (const pastPrompt of Object.values(historyObj)) {
        if (getSimilarity(newPrompt, pastPrompt) >= THRESHOLD) return true;
    }
    return false;
}

async function generateBatchArtworks(artists, date, history) {
    console.log(`Starting Batch Generation for ${artists.length} artists...`);
    const artistContexts = artists.map(artist => ({
        id: artist.id,
        name: artist.name,
        theme: artist.theme,
        philosophy: (typeof artist.description === 'object') ? artist.description.en : artist.description,
        baseStyle: artist.promptBase,
        colors: artist.styleHints.colorPalette.join(', '),
        pastPrompts: Object.values(history[artist.id] || {}).slice(-10)
    }));

    const systemPrompt = `expert Art Director. generate highly detailed image prompts for ${artists.length} artists. Return JSON Object { artistId: { prompt, title_en, title_ko, description_en, description_ko } }. \n Input: ${JSON.stringify(artistContexts)}`;

    let retryCount = 0;
    while (retryCount <= 3) {
        try {
            console.log(`Sending batch request (Attempt ${retryCount + 1})...`);
            const result = await genAI.models.generateContent({
                model: MODEL_NAME,
                contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
                config: { responseMimeType: "application/json" }
            });

            let responseText = "";
            if (result && result.candidates && result.candidates[0].content.parts) {
                responseText = result.candidates[0].content.parts[0].text || "";
            }
            if (!responseText) throw new Error("No text");

            const generatedPrompts = JSON.parse(cleanJsonString(responseText));
            console.log("Batch successful.");

            for (const artist of artists) {
                let data = generatedPrompts[artist.id];
                if (!data || isDuplicate(data.prompt, history[artist.id])) {
                    await generateArtworkForArtist(artist, date, history);
                } else {
                    const imageBuffer = await generateImage(artist, data.prompt);
                    saveArtworkData(artist, date, data.prompt, data, imageBuffer);
                    updateHistory(artist.id, date, data.prompt);
                }
            }
            return;
        } catch (error) {
            console.error(`Batch failed: ${error.message}`);
            await sleep(Math.pow(2, retryCount) * 2000);
            retryCount++;
        }
    }
}

async function generateImage(artist, imagePrompt) {
    if (!imageGenAI) return null;
    let retryCount = 0;
    while (retryCount <= 2) {
        try {
            console.log(`[${artist.name}] Generating image...`);
            const result = await imageGenAI.models.generateContent({
                model: IMAGE_MODEL_NAME,
                contents: imagePrompt,
            });
            if (result && result.candidates && result.candidates[0].content.parts) {
                for (const part of result.candidates[0].content.parts) {
                    if (part.inlineData) return Buffer.from(part.inlineData.data, 'base64');
                }
            }
            throw new Error("No image data");
        } catch (error) {
            console.error(`[${artist.name}] Image fail (Attempt ${retryCount + 1}): ${error.message}`);
            await sleep(2000);
            retryCount++;
        }
    }
    return null;
}

function saveArtworkData(artist, date, prompt, data, imageBuffer = null) {
    const styleData = analyzeAndGenerateStyle(artist, prompt);
    const artworkData = {
        date, artistId: artist.id,
        title: { ko: data?.title_ko || "오늘의 작품", en: data?.title_en || "Daily Creation" },
        description: { ko: data?.description_ko || "설명이 없습니다", en: data?.description_en || "No description" },
        prompt, style: styleData,
        generatedAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().replace('Z', '+09:00')
    };
    const outputFile = path.join(__dirname, `../data/artworks/${date}/${artist.id}.json`);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(artworkData, null, 2));
    if (imageBuffer) fs.writeFileSync(outputFile.replace('.json', '.png'), imageBuffer);
    console.log(`[${artist.name}] Saved.`);
}

async function generateArtworkForArtist(artist, date, history, retryCount = 0) {
    if (retryCount > 2) return;
    console.log(`[${artist.name}] Individual generation...`);
    try {
        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: [{ role: "user", parts: [{ text: `Generate JSON { prompt, title_en, title_ko, description_en, description_ko } for ${artist.name}. Theme: ${artist.theme}` }] }],
            config: { responseMimeType: "application/json" }
        });
        let responseText = result.candidates[0].content.parts[0].text;
        const data = JSON.parse(cleanJsonString(responseText));
        if (isDuplicate(data.prompt, history[artist.id])) return generateArtworkForArtist(artist, date, history, retryCount + 1);
        const imageBuffer = await generateImage(artist, data.prompt);
        saveArtworkData(artist, date, data.prompt, data, imageBuffer);
        updateHistory(artist.id, date, data.prompt);
    } catch (err) {
        console.error(`[${artist.name}] Fail: ${err.message}`);
    }
}

async function main() {
    try {
        const artistsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/artists.json'), 'utf8'));
        const targetArtistId = process.argv[2] || 'all';
        const targetDate = process.argv[3] || new Intl.DateTimeFormat('fr-CA', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date());
        let targetArtists = targetArtistId === 'all' ? artistsData.artists : artistsData.artists.filter(a => a.id === targetArtistId);

        // TODO: 테스트용 - 첫 번째 작가만 생성 (나중에 제거)
        targetArtists = targetArtists.slice(0, 1);
        console.log(`[TEST MODE] Only processing: ${targetArtists[0]?.name || 'none'}`);

        if (genAI) {
            const history = loadOrBuildHistory();
            await generateBatchArtworks(targetArtists, targetDate, history);
        }
    } catch (error) {
        console.error("Fatal:", error);
    }
}

main();
