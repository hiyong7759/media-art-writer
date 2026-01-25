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
    
    Is this prompt safe for general public display? 
    ALLOW: Abstract art, dark fantasy, surrealism, complex textures, cosmic horror (concept).
    BLOCK: Explicit gore, hate speech, sexual violence, real-world violence.
    Reply with only "SAFE" or "UNSAFE".
  `;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts: [{ text: safetyPrompt }] }]
        });
        if (response.includes("SAFE")) {
            return true;
        } else {
            console.warn(`Safety Check Failed for prompt: "${prompt.substring(0, 50)}..." -> Response: ${response}`);
            return false;
        }
    } catch (error) {
        console.error("Safety check error:", error);
        return false; // Fail safe on error
    }
}

module.exports = { validateContent };
