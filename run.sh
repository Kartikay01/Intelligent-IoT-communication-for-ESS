#!/bin/bash

# Run parser.js in the background
node parser.js > parser_output.log 2>&1 &

# Run listener.js in the background
node listener.js > listener_output.log 2>&1 &

# Run iot_simulator.js in the background
node iot_simulator.js > iot_simulator_output.log 2>&1 &

echo "All processes started successfully."
