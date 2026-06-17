const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

function readPrompt(options) {
  if (options.promptFile) return fs.readFileSync(options.promptFile, 'utf8');
  if (options.prompt) return options.prompt;
  throw new Error('Pass prompt or promptFile.');
}

function writeLog(file, payload) {
  if (!file) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
}

function compact(value) {
  return JSON.parse(JSON.stringify(value, (_, item) => item === undefined ? undefined : item));
}

function runCodexAppServer(options) {
  const prompt = readPrompt(options);
  const command = { bin: 'codex', args: ['app-server', '--stdio'] };

  if (!options.run) {
    return Promise.resolve({
      dryRun: true,
      command,
      cwd: options.cwd,
      appServer: true
    });
  }

  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    const child = spawn('codex', command.args, {
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const rl = readline.createInterface({ input: child.stdout });
    let stdout = '';
    let stderr = '';
    let nextId = 1;
    let initializeId = null;
    let threadStartId = null;
    let turnStartId = null;
    let threadId = null;
    let turnCompleted = false;
    let timedOut = false;
    let resolved = false;
    const events = [];

    const finish = (extra = {}) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      if (!child.killed) child.kill('SIGTERM');
      const result = {
        dryRun: false,
        ok: Boolean(turnCompleted) && !timedOut && !extra.error,
        timedOut,
        command,
        cwd: options.cwd,
        startedAt,
        finishedAt: new Date().toISOString(),
        threadId,
        stdout,
        stderr,
        events,
        ...extra
      };
      writeLog(options.logFile, result);
      resolve(result);
    };

    const send = (message) => {
      child.stdin.write(`${JSON.stringify(compact(message))}\n`);
    };

    const startThread = () => {
      threadStartId = nextId++;
      send({
        method: 'thread/start',
        id: threadStartId,
        params: {
          model: options.model || undefined,
          cwd: options.cwd,
          sandbox: options.sandbox || 'workspace-write',
          approvalPolicy: 'never',
          ephemeral: true,
          developerInstructions: 'You are a non-interactive image generation worker. Return image generation events; do not ask follow-up questions.'
        }
      });
    };

    const startTurn = () => {
      turnStartId = nextId++;
      send({
        method: 'turn/start',
        id: turnStartId,
        params: {
          threadId,
          cwd: options.cwd,
          approvalPolicy: 'never',
          model: options.model || undefined,
          input: [{ type: 'text', text: prompt }]
        }
      });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      finish({ error: 'timeout' });
    }, options.timeoutMs || 30 * 60 * 1000);

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      finish({ error: error.message });
    });

    child.on('close', code => {
      if (!resolved) finish({ code, error: turnCompleted ? null : 'app_server_closed' });
    });

    rl.on('line', line => {
      stdout += `${line}\n`;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        return;
      }
      events.push(message);

      if (message.id === initializeId) {
        if (message.error) return finish({ error: message.error.message || 'initialize_failed' });
        send({ method: 'initialized', params: {} });
        startThread();
        return;
      }

      if (message.id === threadStartId) {
        if (message.error) return finish({ error: message.error.message || 'thread_start_failed' });
        threadId = message.result?.thread?.id || message.result?.threadId || message.result?.id;
        if (!threadId) return finish({ error: 'missing_thread_id' });
        startTurn();
        return;
      }

      if (message.id === turnStartId && message.error) {
        return finish({ error: message.error.message || 'turn_start_failed' });
      }

      if (message.method === 'turn/completed') {
        turnCompleted = true;
        return finish();
      }
      if (message.method === 'turn/failed') {
        return finish({ error: message.params?.error || 'turn_failed' });
      }
      if (message.method === 'error') {
        return finish({ error: message.params?.message || 'server_error' });
      }
    });

    initializeId = nextId++;
    send({
      method: 'initialize',
      id: initializeId,
      params: {
        clientInfo: {
          name: 'media_art_writer_worker',
          title: 'Media Art Writer Worker',
          version: '0.1.0'
        },
        capabilities: {
          experimentalApi: true
        }
      }
    });
  });
}

module.exports = { runCodexAppServer };