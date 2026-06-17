const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARTISTS_FILE = path.join(ROOT, 'data/artists.json');
const HISTORY_FILE = path.join(ROOT, 'data/history.json');
const SIMILARITY_THRESHOLD = 0.8;

const STOP_WORDS = new Set([
  'and', 'the', 'with', 'for', 'from', 'into', 'that', 'this', 'your',
  'their', 'about', 'through', 'style', 'theme', 'colors', 'color',
  'light', 'shapes', 'forms'
]);

function parseArgs(argv) {
  const args = {
    artist: null,
    date: null,
    prompt: null,
    promptFile: null,
    json: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') args.json = true;
    else if (arg === '--artist') args.artist = argv[++i];
    else if (arg.startsWith('--artist=')) args.artist = arg.slice('--artist='.length);
    else if (arg === '--date') args.date = argv[++i];
    else if (arg.startsWith('--date=')) args.date = arg.slice('--date='.length);
    else if (arg === '--prompt') args.prompt = argv[++i];
    else if (arg.startsWith('--prompt=')) args.prompt = arg.slice('--prompt='.length);
    else if (arg === '--prompt-file') args.promptFile = argv[++i];
    else if (arg.startsWith('--prompt-file=')) args.promptFile = arg.slice('--prompt-file='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/#[0-9a-f]{3,8}/gi, ' ')
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length >= 4 && !STOP_WORDS.has(word));
}

function getBigrams(text) {
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const bigrams = new Set();
  for (let i = 0; i < words.length - 1; i++) bigrams.add(`${words[i]} ${words[i + 1]}`);
  return bigrams;
}

function getSimilarity(text1, text2) {
  const a = getBigrams(text1);
  const b = getBigrams(text2);
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  return (2 * intersection) / (a.size + b.size);
}

function conceptTerms(artist) {
  const description = typeof artist.description === 'object'
    ? Object.values(artist.description).join(' ')
    : artist.description;
  const source = [
    artist.id,
    artist.name,
    artist.theme,
    artist.promptBase,
    description,
    artist.styleHints?.dominantMood
  ].join(' ');
  return [...new Set(tokenize(source))];
}

function validatePrompt({ artist, date, prompt, history }) {
  const terms = conceptTerms(artist);
  const promptText = String(prompt || '').trim();
  const promptTokens = new Set(tokenize(promptText));
  const matchedConceptTerms = terms.filter(term => promptTokens.has(term));

  let maxSimilarity = 0;
  let mostSimilarDate = null;
  const artistHistory = history[artist.id] || {};

  for (const [historyDate, pastPrompt] of Object.entries(artistHistory)) {
    if (date && historyDate === date) continue;
    const similarity = getSimilarity(promptText, pastPrompt);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilarDate = historyDate;
    }
  }

  const failures = [];
  if (!promptText) failures.push('empty_prompt');
  if (maxSimilarity >= SIMILARITY_THRESHOLD) failures.push('too_similar_to_history');
  if (matchedConceptTerms.length < 2) failures.push('weak_artist_concept_match');

  return {
    ok: failures.length === 0,
    failures,
    artistId: artist.id,
    date,
    maxSimilarity,
    mostSimilarDate,
    similarityThreshold: SIMILARITY_THRESHOLD,
    matchedConceptTerms,
    conceptTermSample: terms.slice(0, 20)
  };
}

function loadPrompt(args) {
  if (args.promptFile) {
    const raw = fs.readFileSync(args.promptFile, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.prompt === 'string') return parsed.prompt;
    } catch {
      // Plain text prompt files are also supported.
    }
    return raw;
  }
  if (args.prompt) return args.prompt;
  throw new Error('Pass --prompt or --prompt-file.');
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (!args.artist) throw new Error('Pass --artist.');

    const artists = readJson(ARTISTS_FILE).artists;
    const artist = artists.find(item => item.id === args.artist);
    if (!artist) throw new Error(`Unknown artist: ${args.artist}`);

    const history = fs.existsSync(HISTORY_FILE) ? readJson(HISTORY_FILE) : {};
    const result = validatePrompt({
      artist,
      date: args.date,
      prompt: loadPrompt(args),
      history
    });

    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Prompt validation: ${result.ok ? 'ok' : 'failed'}`);
      console.log(`Artist: ${result.artistId}`);
      console.log(`Max similarity: ${result.maxSimilarity.toFixed(3)}${result.mostSimilarDate ? ` (${result.mostSimilarDate})` : ''}`);
      console.log(`Matched concept terms: ${result.matchedConceptTerms.join(', ') || '-'}`);
      if (result.failures.length > 0) console.log(`Failures: ${result.failures.join(', ')}`);
    }

    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(`validate-prompt: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  getSimilarity,
  validatePrompt,
  conceptTerms
};
