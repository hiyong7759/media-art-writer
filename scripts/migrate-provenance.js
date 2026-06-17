const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const ARTISTS_FILE = path.join(ROOT, 'data/artists.json');
const ARTWORKS_DIR = path.join(ROOT, 'data/artworks');
const LEGACY_CUTOFF = '2026-03-31';

function parseArgs(argv) {
  const args = {
    from: null,
    to: null,
    artist: 'all',
    write: false,
    json: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--write') args.write = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--from') args.from = argv[++i];
    else if (arg.startsWith('--from=')) args.from = arg.slice('--from='.length);
    else if (arg === '--to') args.to = argv[++i];
    else if (arg.startsWith('--to=')) args.to = arg.slice('--to='.length);
    else if (arg === '--artist') args.artist = argv[++i];
    else if (arg.startsWith('--artist=')) args.artist = arg.slice('--artist='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function existingArtworkDates() {
  if (!fs.existsSync(ARTWORKS_DIR)) return [];
  return fs.readdirSync(ARTWORKS_DIR)
    .filter(name => isDate(name) && fs.statSync(path.join(ARTWORKS_DIR, name)).isDirectory())
    .sort();
}

function sha256(file) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function imageInfo(pngFile, relPng) {
  if (!fs.existsSync(pngFile)) {
    return {
      status: 'missing',
      path: relPng
    };
  }

  const stat = fs.statSync(pngFile);
  return {
    status: 'generated',
    path: relPng,
    sha256: sha256(pngFile),
    bytes: stat.size
  };
}

function generationFor(artwork, pngFile, relPng) {
  const isLegacy = artwork.date <= LEGACY_CUTOFF;
  const image = imageInfo(pngFile, relPng);

  if (isLegacy) {
    return {
      schemaVersion: 1,
      pipeline: 'github-actions-gemini-legacy',
      text: {
        status: 'generated',
        tool: 'github-actions',
        modelDisplay: 'Gemini 2.5 Flash',
        modelId: 'gemini-2.5-flash'
      },
      image: {
        ...image,
        tool: 'github-actions',
        modelDisplay: 'Gemini 2.5 Flash Image',
        modelId: 'gemini-2.5-flash-image'
      },
      provenance: {
        label: 'Gemini 2.5 Flash / Gemini 2.5 Flash Image',
        policy: 'date-cutoff',
        cutoff: '2026-04-01'
      }
    };
  }

  return {
    schemaVersion: 1,
    pipeline: 'n100-codex-worker',
    text: {
      status: 'generated',
      tool: 'codex-cli',
      modelDisplay: 'ChatGPT/Codex',
      modelId: 'codex-cli'
    },
    image: {
      ...image,
      tool: 'codex-cli',
      modelDisplay: 'GPT Image 2',
      modelId: 'gpt-image-2'
    },
    provenance: {
      label: 'ChatGPT/Codex text + GPT Image 2 image',
      policy: 'date-cutoff',
      cutoff: '2026-04-01'
    }
  };
}

function migrate(args) {
  const artistsData = readJson(ARTISTS_FILE);
  const allArtists = artistsData.artists.map(artist => artist.id);
  const artists = args.artist === 'all'
    ? allArtists
    : allArtists.filter(id => id === args.artist);

  if (artists.length === 0) {
    throw new Error(`Unknown artist: ${args.artist}`);
  }

  const dates = existingArtworkDates()
    .filter(date => (!args.from || date >= args.from) && (!args.to || date <= args.to));

  const result = {
    mode: args.write ? 'write' : 'dry-run',
    scanned: 0,
    changed: 0,
    skippedExisting: 0,
    invalidJson: [],
    changedFiles: []
  };

  for (const date of dates) {
    for (const artistId of artists) {
      const jsonFile = path.join(ARTWORKS_DIR, date, `${artistId}.json`);
      const pngFile = path.join(ARTWORKS_DIR, date, `${artistId}.png`);
      const relJson = `data/artworks/${date}/${artistId}.json`;
      const relPng = `data/artworks/${date}/${artistId}.png`;

      if (!fs.existsSync(jsonFile)) continue;
      result.scanned++;

      let artwork;
      try {
        artwork = readJson(jsonFile);
      } catch (error) {
        result.invalidJson.push({ path: relJson, error: error.message });
        continue;
      }

      if (artwork.generation) {
        result.skippedExisting++;
        continue;
      }

      artwork.generation = generationFor(artwork, pngFile, relPng);
      result.changed++;
      result.changedFiles.push(relJson);

      if (args.write) {
        fs.writeFileSync(jsonFile, `${JSON.stringify(artwork, null, 2)}\n`);
      }
    }
  }

  return result;
}

function printHuman(result) {
  console.log(`Provenance migration (${result.mode})`);
  console.log(`Scanned JSON: ${result.scanned}`);
  console.log(`Would change: ${result.changed}`);
  console.log(`Skipped existing generation: ${result.skippedExisting}`);
  console.log(`Invalid JSON: ${result.invalidJson.length}`);
  if (result.changedFiles.length > 0) {
    console.log('Sample changed files:');
    for (const file of result.changedFiles.slice(0, 10)) console.log(`- ${file}`);
  }
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = migrate(args);
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else printHuman(result);
  } catch (error) {
    console.error(`migrate-provenance: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { migrate, generationFor };
