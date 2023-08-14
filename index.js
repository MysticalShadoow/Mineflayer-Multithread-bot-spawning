process.on('uncaughtException', (err) => {
  console.error('Unhandled error:', err.stack || err.toString());
  process.exit(1); // Terminate the process to avoid undefined behavior
});

// index.js
const { Worker } = require('worker_threads');
const mineflayer = require('mineflayer');

// Settings
const botArgs = {
  host: '',
  port: ,
  version: '1.18.2'
};

const NUM_BOTS = 4; // Number of bot instances
const SPAWN_DELAY = 5000; 

class MCBot {
  constructor(username) {
    this.username = username;
    this.host = botArgs.host;
    this.port = botArgs.port;
    this.version = botArgs.version;

    this.initBot();
  }

  initBot() {
    this.worker = new Worker('./botWorker.js', {
      workerData: {
        username: this.username,
        host: this.host,
        port: this.port,
        version: this.version,
      },
    });

    this.worker.on('message', (message) => {
      if (message.type === 'botReady') {
        this.bot = message.bot;
        this.initEvents();
        console.log(`[${this.username}] Worker initialized`);
      } else if (message.type === 'error') {
        console.error(`[${this.username}] Worker encountered an error:`, message.error);
      }
    });
  }

  initEvents() {
    if (!this.bot) {
      return;
    }

    
    this.bot.on('end', (reason) => {
      console.log(`[${this.username}] Disconnected: ${reason}`);
      this.reconnect();
    });
  }

  reconnect() {
    if (this.worker) {
      this.worker.terminate();
    }
    setTimeout(() => {
      console.log(`[${this.username}] Attempting to reconnect...`);
      this.initBot();
    }, 5000);
  }
}


async function spawnBots() {
  for (let i = 0; i < NUM_BOTS; i++) {
    const username = `MT${i}`;
    new MCBot(username);
    await sleep(SPAWN_DELAY);
  }
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

spawnBots();
