#!/usr/bin/env bash
set -e

source "$HOME/.config/memwal/env"

exec /home/aibot/.nvm/versions/node/v24.16.0/bin/node \
  /home/aibot/walrus-session7/memwal-sdk-mcp.mjs
