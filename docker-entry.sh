#!/bin/bash

# Create a worker data dir inside of the volume mounted
mkdir -p /data/worker

# Start the app process
NITRO_PORT=3000 node /app/app/server/index.mjs &
  
# Start the proxy process
NITRO_PORT=3001 node /app/proxy/server/index.mjs &
  
# Start the worker process
NITRO_PORT=3002 node /app/worker/server/index.mjs &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
