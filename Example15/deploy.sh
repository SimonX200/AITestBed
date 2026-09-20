#!/usr/bin/env bash
set -e

echo "=== Deploy Script ==="

# Step 1: Install esbuild if not present
if ! command -v esbuild &> /dev/null && [ ! -f node_modules/.bin/esbuild ]; then
  echo "Installing esbuild..."
  npm install -D esbuild
else
  echo "esbuild already available"
fi

# Step 2: Create dist directory
mkdir -p dist

# Step 3: Compile sessionManager.ts to dist/bundle.js using esbuild
echo "Compiling sessionManager.ts with esbuild..."
./node_modules/.bin/esbuild sessionManager.ts \
  --bundle \
  --outfile=dist/bundle.js \
  --platform=node \
  --target=node20 \
  --minify

echo "Build successful: dist/bundle.js"

# Step 4: Create Dockerfile on-the-fly
echo "Creating Dockerfile..."
cat > Dockerfile << 'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
EXPOSE 3000
ENV PORT=3000
CMD ["node", "bundle.js"]
DOCKERFILE

echo "Dockerfile created"

# Step 5: Stop and remove existing container if running
echo "Cleaning up existing container..."
docker stop session-manager 2>/dev/null || true
docker rm session-manager 2>/dev/null || true

# Step 6: Build Docker image
echo "Building Docker image..."
docker build -t session-manager-app .

# Step 7: Run Docker container in background
echo "Starting Docker container..."
docker run -d \
  --name session-manager \
  -p 3000:3000 \
  session-manager-app

echo "Container 'session-manager' is running on port 3000"
echo "=== Deploy Complete ==="
