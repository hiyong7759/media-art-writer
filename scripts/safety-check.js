const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function validateContent(prompt) {
    if (!API_KEY) {
        console.warn("Warning: GEMINI_API_KEY not set. Skipping safety check.");
        return true; // Fail open for local dev without keys
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const safetyPrompt = `
    Analyze the following art prompt for safety. 
    It will be displayed in a public space.
    
    Prompt: "${prompt}"
    
    Is this prompt safe for all ages (G-rated)? 
    It should not contain violence, gore, sexual content, hate speech, or disturbing imagery.
    Reply with only "SAFE" or "UNSAFE".
  `;

    try {
        const result = await model.generateContent(safetyPrompt);
        const response = result.response.text().trim().toUpperCase();

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
