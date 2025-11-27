#!/bin/bash
# Install Bun if not present
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install dependencies
bun install

# Run database migrations
bun run db:push
