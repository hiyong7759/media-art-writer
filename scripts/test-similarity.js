// const { getBigrams, getSimilarity } = require('./generate-utils'); // Removed non-existent module

// 테스트용 유사도 함수 (generate.js에 있는 것과 동일)
function getBigramsTest(text) {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    const bigrams = new Set();
    for (let i = 0; i < words.length - 1; i++) {
        bigrams.add(`${words[i]} ${words[i + 1]}`);
    }
    return bigrams;
}

function getSimilarityTest(text1, text2) {
    if (!text1 || !text2) return 0;
    const s1 = getBigramsTest(text1);
    const s2 = getBigramsTest(text2);

    if (s1.size === 0 || s2.size === 0) return 0;

    let intersection = 0;
    for (const item of s1) {
        if (s2.has(item)) intersection++;
    }

    return (2.0 * intersection) / (s1.size + s2.size);
}

// 테스트 케이스
const testCases = [
    {
        a: "Hello world this is a test",
        b: "Hello world this is a test",
        desc: "완전 일치"
    },
    {
        a: "The quick brown fox jumps over the lazy dog",
        b: "The quick brown fox jumps over the sleeping dog",
        desc: "단어 하나 변경"
    },
    {
        a: "Deep blue ocean with glowing jellyfish",
        b: "Glowing jellyfish in the deep blue ocean",
        desc: "순서 변경 (단어 구성 높음, 연결 끊김)"
    },
    {
        a: "Geometric shapes with black and white patterns",
        b: "Red and blue circles floating in space",
        desc: "완전 불일치"
    }
];

console.log("=== Similarity Test Results ===");
testCases.forEach((tc, idx) => {
    const score = getSimilarityTest(tc.a, tc.b);
    console.log(`\nCase ${idx + 1}: ${tc.desc}`);
    console.log(`A: "${tc.a}"`);
    console.log(`B: "${tc.b}"`);
    console.log(`Score: ${(score * 100).toFixed(2)}%`);
    console.log(`Verdict: ${score >= 0.8 ? "DUPLICATE" : "PASS"}`);
});
