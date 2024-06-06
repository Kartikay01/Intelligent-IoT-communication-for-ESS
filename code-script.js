const { spawn } = require('child_process');

// Spawn parser.js
const parserProcess = spawn('node', ['parser.js']);

// Spawn brain.js
const brainProcess = spawn('node', ['brain.js']);

// Spawn listener.js
const listenerProcess = spawn('node', ['listener.js']);

// Spawn iot_simulator.js
const iot_simulatorProcess = spawn('node', ['iot_simulator.js']);

// Log output of parser.js
parserProcess.stdout.on('data', (data) => {
  console.log(`Parser.js output: ${data}`);
});

// Log output of listener.js
listenerProcess.stdout.on('data', (data) => {
  console.log(`listener.js output: ${data}`);
});

// Log output of iot_simulator.js
iot_simulatorProcess.stdout.on('data', (data) => {
  console.log(`iot_simulator.js output: ${data}`);
});

// Log output of parser.js
brainProcess.stdout.on('data', (data) => {
  console.log(`brain.js output: ${data}`);
});

// Handle errors
parserProcess.on('error', (err) => {
  console.error(`Error running parser.js: ${err}`);
});

listenerProcess.on('error', (err) => {
  console.error(`Error running listener.js: ${err}`);
});

iot_simulatorProcess.on('error', (err) => {
  console.error(`Error running iot_simulator.js: ${err}`);
});

brainProcess.on('error', (err) => {
  console.error(`Error running brain.js: ${err}`);
});