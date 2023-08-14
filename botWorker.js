process.on('uncaughtException', (err) => {
  console.error('Unhandled error:', err.stack || err.toString());
  process.exit(1); 
});


const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const mineflayer = require('mineflayer');

function initBot() {
  try {
    const { username, host, port, version } = workerData;
    const bot = mineflayer.createBot({
      host,
      port,
      username,
      version,
    });

    bot.once('spawn', () => {
      //parentPort.postMessage({ type: 'botReady', bot });
    });

    bot.on('error', (error) => {
      parentPort.postMessage({ type: 'error', error: error.toString() });
    });

    bot.on('end', () => {
      parentPort.postMessage({ type: 'error', error: 'Bot disconnected unexpectedly.' });
    });
  } catch (error) {
    parentPort.postMessage({ type: 'error', error: error.stack || error.message });
  }
}

if (!isMainThread) {
  initBot();
}
