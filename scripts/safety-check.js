const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
// Initialize with new SDK
const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY, apiVersion: "v1alpha" }) : null;

async function validateContent(prompt) {
    if (!genAI) {
        console.warn("Warning: GEMINI_API_KEY not set. Skipping safety check.");
        return true; // Fail open for local dev without keys
    }

    const safetyPrompt = `
    Analyze the following art prompt for safety. 
    It will be displayed in a public space.
    
    Prompt: "${prompt}"
    
    Is this prompt safe for all ages (G-rated)? 
    It should not contain violence, gore, sexual content, hate speech, or disturbing imagery.
    Reply with only "SAFE" or "UNSAFE".
  `;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{ parts: [{ text: safetyPrompt }] }]
        });
        const response = result.text ? result.text.trim().toUpperCase() : "UNSAFE";

        if (response === "SAFE") {
            return true;
        } else {
            console.warn(`Safety Check Failed: ${response}`);
            return false;
        }
    } catch (error) {
        console.error("Safety check error:", error);
        return false; // Fail safe on error
    }
}

module.exports = { validateContent };
