const fs = require('fs');
const os = require('os');
const path = require('path');

const { audit } = require('./audit-artworks');
const { runJob } = require('./generate-artwork-job');

const ROOT = path.join(__dirname, '..');
const ARTISTS_FILE = path.join(ROOT, 'data/artists.json');
const DEFAULT_FROM = '2026-04-01';

function parseArgs(argv) {
  const hasMode = argv[0] && !argv[0].startsWith('-');
  const args = {
    mode: hasMode ? argv[0] : 'backfill',
    from: null,
    to: null,
    date: null,
    artist: 'all',
    task: 'auto',
    limit: null,
    run: false,
    force: false,
    updateHistory: true,
    stopOnFailure: false,
    record: true,
    stateDir: path.join(ROOT, '.n100-worker'),
    codexModel: null,
    codexSandbox: 'workspace-write',
    timeoutMs: 30 * 60 * 1000,
    attempts: 3,
    imageAttempts: 1,
    json: false
  };

  for (let i = hasMode ? 1 : 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--run') args.run = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--stop-on-failure') args.stopOnFailure = true;
    else if (arg === '--no-record') args.record = false;
    else if (arg === '--update-history') args.updateHistory = true;
    else if (arg === '--no-update-history') args.updateHistory = false;
    else if (arg === '--from') args.from = argv[++i];
    else if (arg.startsWith('--from=')) args.from = arg.slice('--from='.length);
    else if (arg === '--to') args.to = argv[++i];
    else if (arg.startsWith('--to=')) args.to = arg.slice('--to='.length);
    else if (arg === '--date') args.date = argv[++i];
    else if (arg.startsWith('--date=')) args.date = arg.slice('--date='.length);
    else if (arg === '--artist') args.artist = argv[++i];
    else if (arg.startsWith('--artist=')) args.artist = arg.slice('--artist='.length);
    else if (arg === '--task') args.task = argv[++i];
    else if (arg.startsWith('--task=')) args.task = arg.slice('--task='.length);
    else if (arg === '--limit' || arg === '--max-jobs') args.limit = Number(argv[++i]);
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.slice('--limit='.length));
    else if (arg.startsWith('--max-jobs=')) args.limit = Number(arg.slice('--max-jobs='.length));
    else if (arg === '--state-dir') args.stateDir = path.resolve(argv[++i]);
    else if (arg.startsWith('--state-dir=')) args.stateDir = path.resolve(arg.slice('--state-dir='.length));
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

  if (!['daily', 'backfill'].includes(args.mode)) throw new Error('Mode must be daily or backfill.');
  if (!['auto', 'text', 'image', 'both'].includes(args.task)) throw new Error('--task must be auto, text, image, or both.');
  if (args.limit !== null && (!Number.isFinite(args.limit) || args.limit < 0)) throw new Error('--limit must be a non-negative number.');
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) throw new Error('--timeout-ms must be positive.');
  if (!Number.isFinite(args.attempts) || args.attempts <= 0) throw new Error('--attempts must be positive.');
  if (!Number.isFinite(args.imageAttempts) || args.imageAttempts <= 0) throw new Error('--image-attempts must be positive.');

  return args;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadArtists(artist) {
  const artists = readJson(ARTISTS_FILE).artists.map(item => item.id);
  if (artist === 'all') return artists;
  if (!artists.includes(artist)) throw new Error(`Unknown artist: ${artist}`);
  return [artist];
}

function jobKey(job) {
  return `${job.date}/${job.artist}/${job.task}`;
}

function sortJobs(jobs) {
  return jobs.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare) return dateCompare;
    const artistCompare = a.artist.localeCompare(b.artist);
    if (artistCompare) return artistCompare;
    return a.task.localeCompare(b.task);
  });
}

function pushUnique(jobs, seen, job) {
  const key = jobKey(job);
  if (seen.has(key)) return;
  seen.add(key);
  jobs.push(job);
}

function buildDailyJobs(args) {
  const date = args.date || args.to || todayIso();
  const task = args.task === 'auto' ? 'both' : args.task;
  return loadArtists(args.artist).map(artist => ({ mode: 'daily', date, artist, task }));
}

function buildBackfillJobs(args) {
  const from = args.from || DEFAULT_FROM;
  const to = args.to || args.date || todayIso();
  const result = audit({ from, to, artist: args.artist, json: false, writeManifest: null });
  const jobs = [];
  const seen = new Set();

  for (const item of result.tasks.missingJson) {
    pushUnique(jobs, seen, { mode: 'backfill', date: item.date, artist: item.artistId, task: args.task === 'auto' ? 'both' : args.task });
  }

  for (const item of result.tasks.missingPng) {
    if (args.task !== 'auto') {
      pushUnique(jobs, seen, { mode: 'backfill', date: item.date, artist: item.artistId, task: args.task });
    } else if (item.hasJson) {
      pushUnique(jobs, seen, { mode: 'backfill', date: item.date, artist: item.artistId, task: 'image' });
    } else {
      pushUnique(jobs, seen, { mode: 'backfill', date: item.date, artist: item.artistId, task: 'both' });
    }
  }

  return { audit: result.summary, jobs: sortJobs(jobs) };
}

function selectJobs(args) {
  const planned = args.mode === 'daily'
    ? { audit: null, jobs: sortJobs(buildDailyJobs(args)) }
    : buildBackfillJobs(args);

  const defaultLimit = args.mode === 'daily' ? planned.jobs.length : 1;
  const limit = args.limit === null ? defaultLimit : args.limit;
  return {
    ...planned,
    selected: limit === 0 ? [] : planned.jobs.slice(0, limit),
    limit
  };
}

function appendJsonl(file, payload) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(payload)}\n`);
}

function makeJobOptions(args, job) {
  return {
    artist: job.artist,
    date: job.date,
    task: job.task,
    run: args.run,
    force: args.force,
    updateHistory: args.updateHistory,
    workdir: ROOT,
    stateDir: path.join(args.stateDir, 'jobs'),
    codexModel: args.codexModel,
    codexSandbox: args.codexSandbox,
    timeoutMs: args.timeoutMs,
    attempts: args.attempts,
    imageAttempts: args.imageAttempts,
    json: false
  };
}

async function execute(args) {
  const workerRunId = `${args.mode}-${Date.now()}-${process.pid}`;
  const startedAt = new Date().toISOString();
  const plan = selectJobs(args);
  const result = {
    workerRunId,
    dryRun: !args.run,
    mode: args.mode,
    from: args.from || null,
    to: args.to || null,
    date: args.date || null,
    artist: args.artist,
    task: args.task,
    limit: plan.limit,
    audit: plan.audit,
    plannedJobs: plan.jobs.length,
    selectedJobs: plan.selected.length,
    stateDir: args.stateDir,
    jobs: plan.selected.map(job => ({ ...job })),
    results: [],
    startedAt
  };

  if (!args.run) return result;

  const recordFile = path.join(args.stateDir, 'runs.jsonl');
  for (const job of plan.selected) {
    const record = {
      workerRunId,
      mode: args.mode,
      job,
      startedAt: new Date().toISOString()
    };

    try {
      const jobResult = await runJob(makeJobOptions(args, job));
      record.status = 'ok';
      record.finishedAt = new Date().toISOString();
      record.result = jobResult;
      result.results.push(record);
    } catch (error) {
      record.status = 'failed';
      record.finishedAt = new Date().toISOString();
      record.error = error.message;
      result.results.push(record);
      if (args.record) appendJsonl(recordFile, record);
      if (args.stopOnFailure) break;
      continue;
    }

    if (args.record) appendJsonl(recordFile, record);
  }

  result.finishedAt = new Date().toISOString();
  result.ok = result.results.every(item => item.status === 'ok');
  return result;
}

function printHuman(result) {
  console.log(`Worker ${result.dryRun ? '(dry-run)' : '(run)'}`);
  console.log(`Run ID: ${result.workerRunId}`);
  console.log(`Mode: ${result.mode}`);
  console.log(`Artist: ${result.artist}`);
  console.log(`Task: ${result.task}`);
  if (result.audit) {
    console.log(`Audit: missing JSON ${result.audit.missingJson}, missing PNG ${result.audit.missingPng}`);
  }
  console.log(`Jobs: ${result.selectedJobs}/${result.plannedJobs}`);
  console.log(`State: ${result.stateDir}`);
  for (const job of result.jobs) {
    console.log(`- ${job.date}/${job.artist}: ${job.task}`);
  }
  for (const item of result.results || []) {
    console.log(`- ${item.job.date}/${item.job.artist}: ${item.status}${item.error ? ` (${item.error})` : ''}`);
  }
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = await execute(args);
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else printHuman(result);
    if (result.ok === false) process.exitCode = 1;
  } catch (error) {
    console.error(`worker-runner: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  parseArgs,
  selectJobs,
  execute
};