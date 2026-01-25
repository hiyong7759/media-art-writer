/**
 * Style Analyzer
 * Generates dynamic CSS variables based on artist theme and prompt mood.
 */

function analyzeAndGenerateStyle(artist, prompt) {
    // 1. Determine key mood from prompt (Simple keyword matching)
    const moodKeywords = {
        'serene': ['peaceful', 'calm', 'soft', 'ethereal', 'quiet'],
        'electric': ['neon', 'cyber', 'vibrant', 'energy', 'digital'],
        'mysterious': ['dark', 'shadow', 'deep', 'secret', 'fog'],
        'dynamic': ['movement', 'flow', 'rhythm', 'fast', 'dance']
    };

    let dominantMood = artist.styleHints.dominantMood || 'serene';

    // Check prompt for mood overrides
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
        if (keywords.some(k => prompt.toLowerCase().includes(k))) {
            dominantMood = mood;
            break;
        }
    }

    // 2. Select Font based on mood
    const moodFonts = {
        'serene': "'Outfit', sans-serif",
        'contemplative': "'Inter', sans-serif",
        'electric': "'JetBrains Mono', monospace",
        'mysterious': "'Outfit', sans-serif",
        'dynamic': "'Inter', sans-serif"
    };

    const selectedFont = moodFonts[dominantMood] || moodFonts['serene'];

    // 3. Generate CSS Variables Object
    const styleData = {
        '--dynamic-font': selectedFont,
        '--dynamic-mood': dominantMood,
        '--dynamic-primary': artist.styleHints.colorPalette[0],
        '--dynamic-secondary': artist.styleHints.colorPalette[1],
        '--dynamic-tertiary': artist.styleHints.colorPalette[2],
        '--dynamic-quaternary': artist.styleHints.colorPalette[3]
    };

    return styleData;
}

module.exports = { analyzeAndGenerateStyle };
