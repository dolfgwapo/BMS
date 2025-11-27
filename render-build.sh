#!/bin/bash
# Install Bun if not present
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install dependencies
bun install

# Run database migrations (only if CLOUD_DB_URL is set)
if [ -n "$CLOUD_DB_URL" ]; then
  echo "Running database migrations..."
  bun run db:push
else
  echo "Skipping database migrations (CLOUD_DB_URL not set)"
fi
