#!/bin/bash
# Start both client and server in dev mode
cd "$(dirname "$0")/.."
npx concurrently -n server,client -c blue,green "npm run dev -w server" "npm run dev -w client"
