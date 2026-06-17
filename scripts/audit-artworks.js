const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARTISTS_FILE = path.join(ROOT, 'data/artists.json');
const HISTORY_FILE = path.join(ROOT, 'data/history.json');
const ARTWORKS_DIR = path.join(ROOT, 'data/artworks');

function parseArgs(argv) {
  const args = {
    from: null,
    to: null,
    artist: 'all',
    json: false,
    writeManifest: null
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') args.json = true;
    else if (arg === '--from') args.from = argv[++i];
    else if (arg.startsWith('--from=')) args.from = arg.slice('--from='.length);
    else if (arg === '--to') args.to = argv[++i];
    else if (arg.startsWith('--to=')) args.to = arg.slice('--to='.length);
    else if (arg === '--artist') args.artist = argv[++i];
    else if (arg.startsWith('--artist=')) args.artist = arg.slice('--artist='.length);
    else if (arg === '--write-manifest') args.writeManifest = argv[++i];
    else if (arg.startsWith('--write-manifest=')) args.writeManifest = arg.slice('--write-manifest='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function nextDay(date) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function dateRange(from, to) {
  const dates = [];
  for (let date = from; date <= to; date = nextDay(date)) dates.push(date);
  return dates;
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

function historyDates(history) {
  const dates = new Set();
  for (const byDate of Object.values(history)) {
    if (!byDate || typeof byDate !== 'object') continue;
    for (const date of Object.keys(byDate)) {
      if (isDate(date)) dates.add(date);
    }
  }
  return [...dates].sort();
}

function shaExists(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

function audit(args) {
  const artistsData = readJson(ARTISTS_FILE);
  const allArtists = artistsData.artists.map(artist => artist.id);
  const artists = args.artist === 'all'
    ? allArtists
    : allArtists.filter(id => id === args.artist);

  if (artists.length === 0) {
    throw new Error(`Unknown artist: ${args.artist}`);
  }

  const history = fs.existsSync(HISTORY_FILE) ? readJson(HISTORY_FILE) : {};
  const knownDates = [...new Set([...existingArtworkDates(), ...historyDates(history)])].sort();
  const from = args.from || knownDates[0];
  const to = args.to || knownDates[knownDates.length - 1];

  if (!from || !to) {
    throw new Error('No artwork dates found. Pass --from and --to explicitly.');
  }
  if (!isDate(from) || !isDate(to)) {
    throw new Error('--from and --to must use YYYY-MM-DD.');
  }
  if (from > to) {
    throw new Error('--from must be before or equal to --to.');
  }

  const tasks = {
    missingJson: [],
    invalidJson: [],
    emptyPrompt: [],
    missingPng: [],
    historyOnly: [],
    fileOnly: [],
    needsProvenance: []
  };

  let jsonPresent = 0;
  let pngPresent = 0;

  for (const date of dateRange(from, to)) {
    for (const artistId of artists) {
      const base = path.join(ARTWORKS_DIR, date, artistId);
      const jsonFile = `${base}.json`;
      const pngFile = `${base}.png`;
      const relBase = `data/artworks/${date}/${artistId}`;
      const historyPrompt = history[artistId]?.[date];

      let artwork = null;
      if (!shaExists(jsonFile)) {
        tasks.missingJson.push({ date, artistId, path: `${relBase}.json` });
        if (historyPrompt) tasks.historyOnly.push({ date, artistId, path: `${relBase}.json` });
      } else {
        jsonPresent++;
        try {
          artwork = readJson(jsonFile);
          if (!artwork.prompt) tasks.emptyPrompt.push({ date, artistId, path: `${relBase}.json` });
          if (!historyPrompt) tasks.fileOnly.push({ date, artistId, path: `${relBase}.json` });
          if (!artwork.generation) tasks.needsProvenance.push({ date, artistId, path: `${relBase}.json` });
        } catch (error) {
          tasks.invalidJson.push({ date, artistId, path: `${relBase}.json`, error: error.message });
        }
      }

      if (shaExists(pngFile)) {
        pngPresent++;
      } else {
        tasks.missingPng.push({ date, artistId, path: `${relBase}.png`, hasJson: Boolean(artwork) });
      }
    }
  }

  const expected = dateRange(from, to).length * artists.length;
  const summary = {
    from,
    to,
    artists: artists.length,
    expected,
    jsonPresent,
    pngPresent,
    missingJson: tasks.missingJson.length,
    invalidJson: tasks.invalidJson.length,
    emptyPrompt: tasks.emptyPrompt.length,
    missingPng: tasks.missingPng.length,
    historyOnly: tasks.historyOnly.length,
    fileOnly: tasks.fileOnly.length,
    needsProvenance: tasks.needsProvenance.length
  };

  return { summary, tasks };
}

function printHuman(result) {
  const s = result.summary;
  console.log('Artwork audit');
  console.log(`Range: ${s.from}..${s.to}`);
  console.log(`Artists: ${s.artists}`);
  console.log(`Expected: ${s.expected}`);
  console.log(`JSON present: ${s.jsonPresent}`);
  console.log(`PNG present: ${s.pngPresent}`);
  console.log(`Missing JSON: ${s.missingJson}`);
  console.log(`Invalid JSON: ${s.invalidJson}`);
  console.log(`Empty prompt: ${s.emptyPrompt}`);
  console.log(`Missing PNG: ${s.missingPng}`);
  console.log(`History only: ${s.historyOnly}`);
  console.log(`File only: ${s.fileOnly}`);
  console.log(`Needs provenance: ${s.needsProvenance}`);
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = audit(args);

    if (args.writeManifest) {
      fs.mkdirSync(path.dirname(args.writeManifest), { recursive: true });
      fs.writeFileSync(args.writeManifest, `${JSON.stringify(result, null, 2)}\n`);
    }

    if (args.json) console.log(JSON.stringify(result, null, 2));
    else printHuman(result);
  } catch (error) {
    console.error(`audit-artworks: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { audit, parseArgs };
