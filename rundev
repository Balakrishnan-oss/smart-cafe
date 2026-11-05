#!/bin/bash
# rundev - Start Smart Café React local development server

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

NODE_CUA="/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node"

if command -v node >/dev/null 2>&1; then
  exec node dev-server.js "$@"
elif [ -x "$NODE_CUA" ]; then
  exec "$NODE_CUA" dev-server.js "$@"
elif command -v ruby >/dev/null 2>&1; then
  echo "Serving on port 3000 via Ruby..."
  exec ruby -run -e httpd . -p 3000
else
  echo "Error: No suitable runtime found."
  exit 1
fi
