#!/bin/bash
# Start both the LiveKit council agent and the FastAPI deliberation server.
# Used as the Docker CMD -- runs both processes and forwards signals.

python council_agent.py start &
PID1=$!

uvicorn deliberation:app --host 0.0.0.0 --port 8080 &
PID2=$!

trap "kill $PID1 $PID2; wait" SIGTERM SIGINT
wait
