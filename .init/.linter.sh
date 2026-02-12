#!/bin/bash
cd /home/kavia/workspace/code-generation/music-streamer-9845-9870/spotify_style_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

