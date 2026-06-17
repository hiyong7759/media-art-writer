const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEFAULT_PATHS = ['data/artworks', 'data/history.json'];

function parseArgs(argv) {
  const args = {
    run: false,
    json: false,
    remote: 'origin',
    branch: 'main',
    message: null,
    allowCode: false,
    paths: [...DEFAULT_PATHS]
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--run') args.run = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--allow-code') args.allowCode = true;
    else if (arg === '--remote') args.remote = argv[++i];
    else if (arg.startsWith('--remote=')) args.remote = arg.slice('--remote='.length);
    else if (arg === '--branch') args.branch = argv[++i];
    else if (arg.startsWith('--branch=')) args.branch = arg.slice('--branch='.length);
    else if (arg === '--message' || arg === '-m') args.message = argv[++i];
    else if (arg.startsWith('--message=')) args.message = arg.slice('--message='.length);
    else if (arg === '--path') args.paths.push(argv[++i]);
    else if (arg.startsWith('--path=')) args.paths.push(arg.slice('--path='.length));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function runGit(args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return {
    cmd: 'git',
    args,
    status: result.status,
    stdout: result.stdout.trimEnd(),
    stderr: result.stderr.trimEnd()
  };
}

function statusLines() {
  const result = runGit(['status', '--porcelain']);
  if (result.status !== 0) throw new Error(result.stderr || 'git status failed');
  return result.stdout ? result.stdout.split(/\n/) : [];
}

function pathFromStatusLine(line) {
  const raw = line.slice(3).trim();
  const renameIndex = raw.indexOf(' -> ');
  return renameIndex >= 0 ? raw.slice(renameIndex + 4) : raw;
}

function isAllowedPath(file, allowedPaths) {
  return allowedPaths.some(item => file === item || file.startsWith(`${item}/`));
}

function collectJsonFiles(relPath, files = []) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) return files;
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(fullPath)) {
      collectJsonFiles(path.join(relPath, name), files);
    }
  } else if (stat.isFile() && relPath.startsWith('data/artworks/') && relPath.endsWith('.json')) {
    files.push(relPath);
  }
  return files;
}

function failedArtworkFiles(changedPaths) {
  const files = new Set();
  for (const item of changedPaths) {
    for (const file of collectJsonFiles(item)) files.add(file);
  }

  return [...files].filter(file => {
    try {
      const artwork = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
      return artwork?.generation?.image?.status === 'failed';
    } catch {
      return true;
    }
  }).sort();
}

function buildPlan(args) {
  const lines = statusLines();
  const changedPaths = lines.map(pathFromStatusLine);
  const disallowed = changedPaths.filter(file => !isAllowedPath(file, args.paths));
  const failedArtworks = failedArtworkFiles(changedPaths);
  const message = args.message || `art: update generated artworks ${new Date().toISOString().slice(0, 10)}`;

  return {
    dryRun: !args.run,
    remote: args.remote,
    branch: args.branch,
    paths: args.paths,
    message,
    changedPaths,
    disallowed,
    failedArtworks,
    commands: [
      ['add', ...args.paths],
      ['diff', '--cached', '--quiet'],
      ['commit', '-m', message],
      ['pull', '--rebase', args.remote, args.branch],
      ['push', args.remote, `HEAD:${args.branch}`]
    ]
  };
}

function execute(args) {
  const plan = buildPlan(args);
  if (plan.disallowed.length > 0 && !args.allowCode) {
    plan.ok = false;
    plan.error = 'disallowed_dirty_paths';
    return plan;
  }
  if (plan.failedArtworks.length > 0) {
    plan.ok = false;
    plan.error = 'failed_artwork_outputs';
    return plan;
  }

  if (!args.run) {
    plan.ok = true;
    return plan;
  }

  plan.results = [];
  for (const command of plan.commands) {
    const result = runGit(command);
    plan.results.push(result);

    if (command[0] === 'diff' && result.status === 1) continue;
    if (command[0] === 'diff' && result.status === 0) {
      plan.ok = true;
      plan.skipped = 'no_staged_changes';
      return plan;
    }
    if (result.status !== 0) {
      plan.ok = false;
      plan.error = `git_${command[0]}_failed`;
      return plan;
    }
  }

  plan.ok = true;
  return plan;
}

function printHuman(result) {
  console.log(`Publish data ${result.dryRun ? '(dry-run)' : '(run)'}`);
  if (result.error) console.log(`Blocked: ${result.error}`);
  if (result.disallowed?.length) {
    console.log('Dirty paths outside publish scope:');
    for (const file of result.disallowed) console.log(`- ${file}`);
  }
  if (result.failedArtworks?.length) {
    console.log('Failed artwork outputs:');
    for (const file of result.failedArtworks) console.log(`- ${file}`);
  }
  console.log('Changed paths:');
  for (const file of result.changedPaths) console.log(`- ${file}`);
  console.log('Commands:');
  for (const command of result.commands) console.log(`- git ${command.join(' ')}`);
  if (result.results) {
    console.log('Results:');
    for (const item of result.results) {
      console.log(`- git ${item.args.join(' ')} => ${item.status}`);
      if (item.stdout) console.log(item.stdout);
      if (item.stderr) console.error(item.stderr);
    }
  }
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = execute(args);
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else printHuman(result);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(`publish-data: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  parseArgs,
  buildPlan,
  execute
};