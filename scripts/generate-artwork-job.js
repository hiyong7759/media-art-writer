const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const { runCodex } = require('./codex-runner');
const { analyzeAndGenerateStyle } = require('./style-analyzer');
const { validatePrompt } = require('./validate-prompt');

const ROOT = path.join(__dirname, '..');
const ARTISTS_FILE = path.join(ROOT, 'data/artists.json');
const HISTORY_FILE = path.join(ROOT, 'data/history.json');
const ARTWORKS_DIR = path.join(ROOT, 'data/artworks');

function parseArgs(argv) {
  const args = {
    artist: null,
    date: null,
    task: 'both',
    run: false,
    force: false,
    updateHistory: true,
    workdir: ROOT,
    stateDir: path.join(os.tmpdir(), 'media-art-codex-jobs'),
    codexModel: null,
    codexSandbox: 'workspace-write',
    timeoutMs: 30 * 60 * 1000,
    attempts: 3,
    imageAttempts: 1,
    json: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--run') args.run = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--update-history') args.updateHistory = true;
    else if (arg === '--no-update-history') args.updateHistory = false;
    else if (arg === '--json') args.json = true;
    else if (arg === '--artist') args.artist = argv[++i];
    else if (arg.startsWith('--artist=')) args.artist = arg.slice('--artist='.length);
    else if (arg === '--date') args.date = argv[++i];
    else if (arg.startsWith('--date=')) args.date = arg.slice('--date='.length);
    else if (arg === '--task') args.task = argv[++i];
    else if (arg.startsWith('--task=')) args.task = arg.slice('--task='.length);
    else if (arg === '--workdir') args.workdir = argv[++i];
    else if (arg.startsWith('--workdir=')) args.workdir = arg.slice('--workdir='.length);
    else if (arg === '--state-dir') args.stateDir = argv[++i];
    else if (arg.startsWith('--state-dir=')) args.stateDir = arg.slice('--state-dir='.length);
    else if (arg === '--codex-model') args.codexModel = argv[++i];
    else if (arg.startsWith('--codex-model=')) args.codexModel = arg.slice('--codex-model='.length);
    else if (arg === '--codex-sandbox') args.codexSandbox = argv[++i];
    else if (arg.startsWith('--codex-sandbox=')) args.codexSandbox = arg.slice('--codex-sandbox='.length);
    else if (arg === '--timeout-ms') args.timeoutMs = Number(argv[++i]);
    else if (arg.startsWith('--timeout-ms=')) args.timeoutMs = Number(arg.slice('--timeout-ms='.length));
    else if (arg === '--attempts') args.attempts = Number(argv[++i]);
    else if (arg.startsWith('--attempts=')) args.attempts = Number(arg.slice('--attempts='.length));
    else if (arg === '--image-attempts') args.imageAttempts = Number(argv[++i]);
    else if (arg.startsWith('--image-attempts=')) args.imageAttempts = Number(arg.slice('--image-attempts='.length));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!['text', 'image', 'both'].includes(args.task)) {
    throw new Error('--task must be text, image, or both.');
  }
  if (!args.artist) throw new Error('Pass --artist.');
  if (!args.date || !/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
    throw new Error('Pass --date YYYY-MM-DD.');
  }
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error('--timeout-ms must be a positive number.');
  }
  if (!Number.isFinite(args.attempts) || args.attempts <= 0) {
    throw new Error('--attempts must be a positive number.');
  }
  if (!Number.isFinite(args.imageAttempts) || args.imageAttempts <= 0) {
    throw new Error('--image-attempts must be a positive number.');
  }

  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function cleanJsonString(value) {
  return String(value || '')
    .replace(/```json\n?/g, '')
    .replace(/```/g, '')
    .trim();
}

function parseGeneratedJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(cleanJsonString(raw));
}

function kstNow() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .replace('Z', '+09:00');
}

function sha256(file) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function findCodexSessionFile(stderr) {
  const match = String(stderr || '').match(/session id:\s*([0-9a-f-]+)/i);
  if (!match) return null;

  const sessionId = match[1];
  const sessionsDir = path.join(os.homedir(), '.codex', 'sessions');
  if (!fs.existsSync(sessionsDir)) return null;

  const stack = [sessionsDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile() && entry.name.includes(sessionId) && entry.name.endsWith('.jsonl')) {
        return fullPath;
      }
    }
  }

  return null;
}

function collectBase64Pngs(value, hits = []) {
  if (typeof value === 'string') {
    const dataUrlMatch = value.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
    if (dataUrlMatch && dataUrlMatch[1].length > 1000) hits.push(dataUrlMatch[1]);
    else if (value.startsWith('iVBORw0KGgo') && value.length > 1000) hits.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectBase64Pngs(item, hits);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectBase64Pngs(item, hits);
  }
  return hits;
}

function recoverPngFromCodexSession(stderr, pngFile) {
  const sessionFile = findCodexSessionFile(stderr);
  if (!sessionFile) return null;

  const hits = [];
  for (const line of fs.readFileSync(sessionFile, 'utf8').split(/\n/)) {
    if (!line.trim()) continue;
    try {
      collectBase64Pngs(JSON.parse(line), hits);
    } catch {
      // Ignore partial or non-JSON lines in Codex session logs.
    }
  }

  if (hits.length === 0) return null;

  const buffer = Buffer.from(hits[hits.length - 1], 'base64');
  if (buffer.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;

  fs.mkdirSync(path.dirname(pngFile), { recursive: true });
  fs.writeFileSync(pngFile, buffer);
  return 'codex-session-jsonl';
}

function loadContext(artistId) {
  const artists = readJson(ARTISTS_FILE).artists;
  const artist = artists.find(item => item.id === artistId);
  if (!artist) throw new Error(`Unknown artist: ${artistId}`);
  const history = fs.existsSync(HISTORY_FILE) ? readJson(HISTORY_FILE) : {};
  return { artist, history };
}

function ensureJobDir(options) {
  const runId = `${options.date}-${options.artist}-${Date.now()}`;
  const dir = path.join(options.stateDir, runId);
  fs.mkdirSync(dir, { recursive: true });
  return { runId, dir };
}

function artworkPaths(options) {
  const dir = path.join(ARTWORKS_DIR, options.date);
  return {
    dir,
    jsonFile: path.join(dir, `${options.artist}.json`),
    pngFile: path.join(dir, `${options.artist}.png`),
    relJson: `data/artworks/${options.date}/${options.artist}.json`,
    relPng: `data/artworks/${options.date}/${options.artist}.png`
  };
}

function textSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['prompt', 'title_en', 'title_ko', 'description_en', 'description_ko'],
    properties: {
      prompt: { type: 'string', minLength: 40 },
      title_en: { type: 'string', minLength: 1 },
      title_ko: { type: 'string', minLength: 1 },
      description_en: { type: 'string', minLength: 1 },
      description_ko: { type: 'string', minLength: 1 }
    }
  };
}

function buildTextPrompt(artist, date, history, previousFailure = null) {
  const pastPrompts = Object.entries(history[artist.id] || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-25)
    .map(([pastDate, prompt]) => ({ date: pastDate, prompt }));

  return [
    'You are generating one daily artwork metadata JSON for this repository.',
    'Return only JSON matching the provided schema. No markdown.',
    '',
    'Hard rules:',
    '- The prompt must strongly match the artist concept, theme, promptBase, and styleHints.',
    '- The prompt must avoid repeating existing prompts. Do not reuse scene structure, subject, or phrasing from history.',
    '- The prompt must be detailed enough for image generation.',
    '- Do not mention model names, policies, file paths, or implementation details in the artwork text.',
    '',
    `Target date: ${date}`,
    `Artist: ${JSON.stringify(artist, null, 2)}`,
    `Recent prompt history: ${JSON.stringify(pastPrompts, null, 2)}`,
    previousFailure ? `Previous validation failure to fix: ${JSON.stringify(previousFailure, null, 2)}` : '',
    '',
    'Required JSON shape:',
    '{ "prompt": string, "title_en": string, "title_ko": string, "description_en": string, "description_ko": string }'
  ].filter(Boolean).join('\n');
}

function buildImagePrompt(artwork, pngFile) {
  return [
    '$imagegen',
    '',
    'Generate a high-quality 16:9 media-art background image from the artwork prompt below.',
    `Save the final PNG exactly at: ${pngFile}`,
    'Do not modify any other repository files.',
    'Do not add text, captions, logos, watermarks, UI, frames, or signatures inside the image.',
    '',
    `Artist ID: ${artwork.artistId}`,
    `Date: ${artwork.date}`,
    `Title: ${JSON.stringify(artwork.title)}`,
    `Description: ${JSON.stringify(artwork.description)}`,
    `Prompt: ${artwork.prompt}`
  ].join('\n');
}

function generationText(runId, attempts) {
  return {
    status: 'generated',
    tool: 'codex-cli',
    modelDisplay: 'ChatGPT/Codex',
    modelId: 'codex-cli',
    attempts,
    runId,
    generatedAt: kstNow()
  };
}

function generationImage(runId, pngFile, relPng, attempts) {
  const stat = fs.statSync(pngFile);
  return {
    status: 'generated',
    tool: 'codex-cli',
    modelDisplay: 'GPT Image 2',
    modelId: 'gpt-image-2',
    path: relPng,
    sha256: sha256(pngFile),
    bytes: stat.size,
    attempts,
    runId,
    generatedAt: kstNow()
  };
}

function missingImage(relPng) {
  return {
    status: 'missing',
    tool: 'codex-cli',
    modelDisplay: 'GPT Image 2',
    modelId: 'gpt-image-2',
    path: relPng
  };
}

function failedImage(relPng, error, attempts, extra = {}) {
  return {
    status: 'failed',
    tool: 'codex-cli',
    modelDisplay: 'GPT Image 2',
    modelId: 'gpt-image-2',
    path: relPng,
    attempts,
    lastError: String(error).slice(0, 500),
    lastAttemptAt: kstNow(),
    ...extra
  };
}

function isImagePlacementBlocked(result) {
  const text = `${result?.stdout || ''}\n${result?.stderr || ''}`.toLowerCase();
  return text.includes('bwrap: loopback: failed rtm_newaddr')
    || text.includes('could not save')
    || text.includes('could not place')
    || text.includes('could not verify or complete')
    || text.includes('png placement step could not run');
}

function saveArtwork({ artist, date, data, paths, runId, attempts }) {
  const prompt = data.prompt.trim();
  const artwork = {
    date,
    artistId: artist.id,
    title: {
      ko: data.title_ko || '오늘의 작품',
      en: data.title_en || 'Daily Creation'
    },
    description: {
      ko: data.description_ko || '설명이 없습니다',
      en: data.description_en || 'No description'
    },
    prompt,
    style: analyzeAndGenerateStyle(artist, prompt),
    generatedAt: kstNow(),
    generation: {
      schemaVersion: 1,
      pipeline: 'n100-codex-worker',
      text: generationText(runId, attempts),
      image: fs.existsSync(paths.pngFile)
        ? generationImage(runId, paths.pngFile, paths.relPng, 0)
        : missingImage(paths.relPng),
      provenance: {
        label: 'ChatGPT/Codex text + GPT Image 2 image',
        policy: 'date-cutoff',
        cutoff: '2026-04-01'
      }
    }
  };

  fs.mkdirSync(paths.dir, { recursive: true });
  fs.writeFileSync(paths.jsonFile, `${JSON.stringify(artwork, null, 2)}\n`);
  return artwork;
}

function updateHistory(artistId, date, prompt) {
  const history = fs.existsSync(HISTORY_FILE) ? readJson(HISTORY_FILE) : {};
  if (!history[artistId]) history[artistId] = {};
  history[artistId][date] = prompt;
  history[artistId] = Object.fromEntries(
    Object.entries(history[artistId]).sort(([a], [b]) => a.localeCompare(b))
  );
  fs.writeFileSync(HISTORY_FILE, `${JSON.stringify(history, null, 2)}\n`);
}

async function generateText(options, context, paths, job) {
  if (fs.existsSync(paths.jsonFile) && !options.force) {
    const existing = readJson(paths.jsonFile);
    const historyUpdated = Boolean(options.run && options.updateHistory && existing.prompt);
    if (historyUpdated) updateHistory(context.artist.id, options.date, existing.prompt);
    return {
      status: 'skipped',
      task: 'text',
      reason: 'json_exists',
      path: paths.relJson,
      historyUpdated
    };
  }

  let previousFailure = null;
  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    const promptFile = path.join(job.dir, `text-attempt-${attempt}.prompt.txt`);
    const outputFile = path.join(job.dir, `text-attempt-${attempt}.json`);
    const schemaFile = path.join(job.dir, 'text-schema.json');
    const logFile = path.join(job.dir, `text-attempt-${attempt}.log.json`);
    fs.writeFileSync(promptFile, buildTextPrompt(context.artist, options.date, context.history, previousFailure));
    fs.writeFileSync(schemaFile, `${JSON.stringify(textSchema(), null, 2)}\n`);

    const result = await runCodex({
      cwd: options.workdir,
      promptFile,
      output: outputFile,
      outputSchema: schemaFile,
      model: options.codexModel,
      sandbox: options.codexSandbox,
      timeoutMs: options.timeoutMs,
      logFile,
      run: options.run
    });

    if (!options.run) {
      return {
        status: 'dry-run',
        task: 'text',
        attempt,
        codex: result,
        promptFile,
        outputFile,
        schemaFile
      };
    }

    if (!result.ok) {
      previousFailure = { reason: 'codex_failed', result };
      continue;
    }

    let data;
    try {
      data = parseGeneratedJson(outputFile);
    } catch (error) {
      previousFailure = { reason: 'invalid_json', error: error.message };
      continue;
    }

    const validation = validatePrompt({
      artist: context.artist,
      date: options.date,
      prompt: data.prompt,
      history: context.history
    });

    if (!validation.ok) {
      previousFailure = { reason: 'prompt_validation_failed', validation };
      continue;
    }

    const artwork = saveArtwork({
      artist: context.artist,
      date: options.date,
      data,
      paths,
      runId: job.runId,
      attempts: attempt
    });

    if (options.updateHistory) updateHistory(context.artist.id, options.date, artwork.prompt);

    return {
      status: 'generated',
      task: 'text',
      attempt,
      path: paths.relJson,
      validation
    };
  }

  throw new Error(`Text generation failed after ${options.attempts} attempts: ${JSON.stringify(previousFailure)}`);
}

async function generateImage(options, paths, job) {
  if (fs.existsSync(paths.pngFile) && !options.force) {
    return { status: 'skipped', task: 'image', reason: 'png_exists', path: paths.relPng };
  }
  if (!fs.existsSync(paths.jsonFile)) {
    if (!options.run && options.task === "both") {
      return {
        status: "dry-run",
        task: "image",
        reason: "json_would_be_generated_first",
        path: paths.relPng
      };
    }
    throw new Error(`Cannot generate image without JSON: ${paths.relJson}`);
  }

  const artwork = readJson(paths.jsonFile);
  if (!artwork.prompt) throw new Error(`Artwork JSON has no prompt: ${paths.relJson}`);

  let lastError = null;
  let lastAttempt = 0;
  const maxImageAttempts = options.imageAttempts || 1;
  for (let attempt = 1; attempt <= maxImageAttempts; attempt++) {
    lastAttempt = attempt;
    const promptFile = path.join(job.dir, `image-attempt-${attempt}.prompt.txt`);
    const outputFile = path.join(job.dir, `image-attempt-${attempt}.last-message.txt`);
    const logFile = path.join(job.dir, `image-attempt-${attempt}.log.json`);
    fs.writeFileSync(promptFile, buildImagePrompt(artwork, paths.pngFile));

    const result = await runCodex({
      cwd: options.workdir,
      promptFile,
      output: outputFile,
      model: options.codexModel,
      sandbox: options.codexSandbox,
      timeoutMs: options.timeoutMs,
      logFile,
      run: options.run
    });

    if (!options.run) {
      return {
        status: 'dry-run',
        task: 'image',
        attempt,
        codex: result,
        promptFile,
        outputFile
      };
    }

    if (!result.ok) {
      lastError = 'codex_failed';
      artwork.generation = artwork.generation || { schemaVersion: 1, pipeline: 'n100-codex-worker' };
      artwork.generation.image = failedImage(paths.relPng, lastError, attempt);
      fs.writeFileSync(paths.jsonFile, `${JSON.stringify(artwork, null, 2)}\n`);
      continue;
    }

    let recoveredFrom = null;
    if (!fs.existsSync(paths.pngFile)) {
      recoveredFrom = recoverPngFromCodexSession(result.stderr, paths.pngFile);
    }

    if (!fs.existsSync(paths.pngFile)) {
      const placementBlocked = isImagePlacementBlocked(result);
      lastError = placementBlocked ? 'image_generated_but_not_saved' : 'png_not_created';
      artwork.generation = artwork.generation || { schemaVersion: 1, pipeline: 'n100-codex-worker' };
      artwork.generation.image = failedImage(paths.relPng, lastError, attempt, {
        retryable: !placementBlocked,
        note: placementBlocked ? 'Codex reported image generation completed, but local PNG placement failed.' : undefined
      });
      fs.writeFileSync(paths.jsonFile, `${JSON.stringify(artwork, null, 2)}\n`);
      if (placementBlocked) break;
      continue;
    }

    artwork.generation = artwork.generation || { schemaVersion: 1, pipeline: 'n100-codex-worker' };
    artwork.generation.image = generationImage(job.runId, paths.pngFile, paths.relPng, attempt);
    if (recoveredFrom) artwork.generation.image.recoveredFrom = recoveredFrom;
    artwork.generation.provenance = artwork.generation.provenance || {
      label: 'ChatGPT/Codex text + GPT Image 2 image',
      policy: 'date-cutoff',
      cutoff: '2026-04-01'
    };
    fs.writeFileSync(paths.jsonFile, `${JSON.stringify(artwork, null, 2)}\n`);

    return {
      status: 'generated',
      task: 'image',
      attempt,
      path: paths.relPng,
      bytes: artwork.generation.image.bytes,
      sha256: artwork.generation.image.sha256
    };
  }

  throw new Error(`Image generation failed after ${lastAttempt || maxImageAttempts} attempts for ${paths.relPng}: ${lastError}`);
}

async function runJob(options) {
  const context = loadContext(options.artist);
  const paths = artworkPaths(options);
  const job = ensureJobDir(options);
  const result = {
    runId: job.runId,
    dryRun: !options.run,
    artist: options.artist,
    date: options.date,
    task: options.task,
    stateDir: job.dir,
    outputs: {
      json: paths.relJson,
      png: paths.relPng
    },
    steps: []
  };

  if (options.task === 'text' || options.task === 'both') {
    result.steps.push(await generateText(options, context, paths, job));
  }
  if (options.task === 'image' || options.task === 'both') {
    result.steps.push(await generateImage(options, paths, job));
  }

  return result;
}

function printHuman(result) {
  console.log(`Artwork job ${result.dryRun ? '(dry-run)' : '(run)'}`);
  console.log(`Run ID: ${result.runId}`);
  console.log(`Target: ${result.date}/${result.artist}`);
  console.log(`Task: ${result.task}`);
  console.log(`State: ${result.stateDir}`);
  console.log(`JSON: ${result.outputs.json}`);
  console.log(`PNG: ${result.outputs.png}`);
  for (const step of result.steps) {
    console.log(`- ${step.task}: ${step.status}${step.reason ? ` (${step.reason})` : ''}`);
  }
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await runJob(options);
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else printHuman(result);
  } catch (error) {
    console.error(`generate-artwork-job: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  parseArgs,
  runJob,
  buildTextPrompt,
  buildImagePrompt
};
