const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function parseArgs(argv) {
  const args = {
    cwd: process.cwd(),
    prompt: null,
    promptFile: null,
    output: null,
    outputSchema: null,
    model: null,
    sandbox: 'workspace-write',
    timeoutMs: 30 * 60 * 1000,
    logFile: null,
    jsonEvents: false,
    ephemeral: true,
    config: [],
    images: [],
    run: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--run') args.run = true;
    else if (arg === '--no-ephemeral') args.ephemeral = false;
    else if (arg === '--json-events') args.jsonEvents = true;
    else if (arg === '--cwd' || arg === '-C') args.cwd = argv[++i];
    else if (arg.startsWith('--cwd=')) args.cwd = arg.slice('--cwd='.length);
    else if (arg === '--prompt') args.prompt = argv[++i];
    else if (arg.startsWith('--prompt=')) args.prompt = arg.slice('--prompt='.length);
    else if (arg === '--prompt-file') args.promptFile = argv[++i];
    else if (arg.startsWith('--prompt-file=')) args.promptFile = arg.slice('--prompt-file='.length);
    else if (arg === '--output' || arg === '-o') args.output = argv[++i];
    else if (arg.startsWith('--output=')) args.output = arg.slice('--output='.length);
    else if (arg === '--output-schema') args.outputSchema = argv[++i];
    else if (arg.startsWith('--output-schema=')) args.outputSchema = arg.slice('--output-schema='.length);
    else if (arg === '--model' || arg === '-m') args.model = argv[++i];
    else if (arg.startsWith('--model=')) args.model = arg.slice('--model='.length);
    else if (arg === '--sandbox') args.sandbox = argv[++i];
    else if (arg.startsWith('--sandbox=')) args.sandbox = arg.slice('--sandbox='.length);
    else if (arg === '--timeout-ms') args.timeoutMs = Number(argv[++i]);
    else if (arg.startsWith('--timeout-ms=')) args.timeoutMs = Number(arg.slice('--timeout-ms='.length));
    else if (arg === '--log-file') args.logFile = argv[++i];
    else if (arg.startsWith('--log-file=')) args.logFile = arg.slice('--log-file='.length);
    else if (arg === '--config' || arg === '-c') args.config.push(argv[++i]);
    else if (arg.startsWith('--config=')) args.config.push(arg.slice('--config='.length));
    else if (arg === '--image' || arg === '-i') args.images.push(argv[++i]);
    else if (arg.startsWith('--image=')) args.images.push(arg.slice('--image='.length));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function readPrompt(options) {
  if (options.promptFile) return fs.readFileSync(options.promptFile, 'utf8');
  if (options.prompt) return options.prompt;
  throw new Error('Pass --prompt or --prompt-file.');
}

function buildCodexArgs(options, prompt) {
  const args = ['exec'];
  if (options.ephemeral !== false) args.push('--ephemeral');
  args.push('-C', options.cwd);
  args.push('--sandbox', options.sandbox);

  if (options.model) args.push('--model', options.model);
  if (options.output) args.push('-o', options.output);
  if (options.outputSchema) args.push('--output-schema', options.outputSchema);
  if (options.jsonEvents) args.push('--json');
  for (const value of options.config || []) args.push('-c', value);
  for (const image of options.images || []) args.push('--image', image);
  args.push(prompt);
  return args;
}

function writeLog(file, payload) {
  if (!file) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
}

function runCodex(options) {
  const prompt = readPrompt(options);
  const codexArgs = buildCodexArgs(options, prompt);
  const command = { bin: 'codex', args: codexArgs };

  if (!options.run) {
    return Promise.resolve({
      dryRun: true,
      command,
      cwd: options.cwd,
      output: options.output || null,
      outputSchema: options.outputSchema || null
    });
  }

  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    const child = spawn('codex', codexArgs, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, options.timeoutMs);

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    child.on('error', error => {
      clearTimeout(timer);
      const result = {
        dryRun: false,
        ok: false,
        command,
        cwd: options.cwd,
        startedAt,
        finishedAt: new Date().toISOString(),
        error: error.message,
        stdout,
        stderr
      };
      writeLog(options.logFile, result);
      resolve(result);
    });
    child.on('close', code => {
      clearTimeout(timer);
      const result = {
        dryRun: false,
        ok: code === 0 && !timedOut,
        code,
        timedOut,
        command,
        cwd: options.cwd,
        startedAt,
        finishedAt: new Date().toISOString(),
        stdout,
        stderr,
        output: options.output || null
      };
      writeLog(options.logFile, result);
      resolve(result);
    });
  });
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await runCodex(options);
    console.log(JSON.stringify(result, null, 2));
    if (result.ok === false) process.exitCode = 1;
  } catch (error) {
    console.error(`codex-runner: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  parseArgs,
  buildCodexArgs,
  runCodex
};
