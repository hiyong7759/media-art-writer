const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function parseArgs(argv) {
  const args = {
    action: argv[0] || 'status',
    slot: null,
    kind: 'backfill',
    branch: null,
    base: 'origin/main',
    worktreesDir: path.resolve(ROOT, '..', 'media-art-worktrees'),
    run: false,
    json: false
  };

  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--run') args.run = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--slot') args.slot = argv[++i];
    else if (arg.startsWith('--slot=')) args.slot = arg.slice('--slot='.length);
    else if (arg === '--kind') args.kind = argv[++i];
    else if (arg.startsWith('--kind=')) args.kind = arg.slice('--kind='.length);
    else if (arg === '--branch') args.branch = argv[++i];
    else if (arg.startsWith('--branch=')) args.branch = arg.slice('--branch='.length);
    else if (arg === '--base') args.base = argv[++i];
    else if (arg.startsWith('--base=')) args.base = arg.slice('--base='.length);
    else if (arg === '--worktrees-dir') args.worktreesDir = path.resolve(argv[++i]);
    else if (arg.startsWith('--worktrees-dir=')) args.worktreesDir = path.resolve(arg.slice('--worktrees-dir='.length));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!['status', 'prepare', 'remove'].includes(args.action)) {
    throw new Error('Action must be status, prepare, or remove.');
  }
  if ((args.action === 'prepare' || args.action === 'remove') && !args.slot) {
    throw new Error('Pass --slot for prepare/remove.');
  }
  if (!['daily', 'backfill'].includes(args.kind)) {
    throw new Error('--kind must be daily or backfill.');
  }
  if (!args.branch && args.slot) args.branch = `n100/${args.kind}/${args.slot}`;
  return args;
}

function command(cmd, args, cwd = ROOT) {
  return { cmd, args, cwd };
}

function runCommand(item) {
  const result = spawnSync(item.cmd, item.args, {
    cwd: item.cwd,
    encoding: 'utf8'
  });
  return {
    ...item,
    status: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim()
  };
}

function getStatus() {
  return runCommand(command('git', ['status', '--porcelain']));
}

function getWorktreeList() {
  return runCommand(command('git', ['worktree', 'list']));
}

function buildPlan(args) {
  const worktreePath = args.slot ? path.join(args.worktreesDir, args.slot) : null;
  const plan = {
    action: args.action,
    dryRun: !args.run,
    slot: args.slot,
    kind: args.kind,
    branch: args.branch,
    base: args.base,
    worktreePath,
    commands: []
  };

  if (args.action === 'status') {
    plan.commands.push(command('git', ['worktree', 'list']));
  } else if (args.action === 'prepare') {
    plan.commands.push(command('git', ['fetch', 'origin', 'main']));
    plan.commands.push(command('git', ['worktree', 'add', '-B', args.branch, worktreePath, args.base]));
  } else if (args.action === 'remove') {
    plan.commands.push(command('git', ['worktree', 'remove', worktreePath]));
  }

  return plan;
}

function execute(args) {
  const plan = buildPlan(args);

  if (args.action === 'prepare') {
    const status = getStatus();
    plan.preflight = { gitStatus: status };
    if (status.status !== 0) {
      plan.ok = false;
      plan.error = 'git_status_failed';
      return plan;
    }
    if (status.stdout) {
      plan.warning = 'control_checkout_dirty';
      if (args.run) {
        plan.ok = false;
        plan.error = 'control_checkout_dirty';
        return plan;
      }
    }
  }

  if (!args.run) {
    plan.ok = true;
    return plan;
  }

  if (args.action === 'prepare') fs.mkdirSync(args.worktreesDir, { recursive: true });
  plan.results = plan.commands.map(runCommand);
  plan.ok = plan.results.every(result => result.status === 0);
  if (args.action === 'status') plan.worktrees = getWorktreeList();
  return plan;
}

function printHuman(result) {
  console.log(`Worktree manager ${result.dryRun ? '(dry-run)' : '(run)'}`);
  console.log(`Action: ${result.action}`);
  if (result.slot) console.log(`Slot: ${result.slot}`);
  if (result.branch) console.log(`Branch: ${result.branch}`);
  if (result.worktreePath) console.log(`Path: ${result.worktreePath}`);
  if (result.error) console.log(`Blocked: ${result.error}`);
  if (result.preflight?.gitStatus?.stdout) {
    console.log('Dirty control checkout:');
    console.log(result.preflight.gitStatus.stdout);
  }
  console.log('Commands:');
  for (const item of result.commands) {
    console.log(`- (${item.cwd}) ${item.cmd} ${item.args.join(' ')}`);
  }
  if (result.results) {
    console.log('Results:');
    for (const item of result.results) {
      console.log(`- ${item.cmd} ${item.args.join(' ')} => ${item.status}`);
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
    console.error(`worktree-manager: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  parseArgs,
  buildPlan,
  execute
};
