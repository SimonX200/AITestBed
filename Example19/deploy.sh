#!/bin/bash
set -e

PORT=${EXAMPLE_SESSIONMANAGER_PORT:-3000}

case "${1:-start}" in
    start)
        # Installiere esbuild falls nicht vorhanden
        if [ ! -d "node_modules/esbuild" ]; then
            echo "Installing esbuild..."
            npm install -D esbuild
        fi

        # Kompiliere TypeScript mit esbuild
        echo "Compiling sessionManager.ts..."
        npm run build

        # Erstelle Dockerfile on-the-fly
        echo "Creating Dockerfile..."
        cat > deploy/Dockerfile << 'DOCKERFILE'
FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
ENV PORT=3000
ENV REDIS_URL=redis://redis:6379
EXPOSE 3000
CMD ["node", "bundle.js"]
DOCKERFILE

        # Erstelle .env file für docker compose
        echo "EXAMPLE_SESSIONMANAGER_PORT=$PORT" > deploy/.env

        # Baue Docker Image (Kontext ist Root, Dockerfile in deploy/)
        echo "Building Docker image..."
        docker build -t session-manager -f deploy/Dockerfile .

        # Starte Container im Hintergrund
        echo "Starting containers on port $PORT..."
        docker compose -f deploy/docker-compose.yaml up -d

        echo "SessionManager deployed on port $PORT"
        ;;
    stop)
        echo "Stopping containers..."
        docker compose -f deploy/docker-compose.yaml down
        echo "Containers stopped."
        ;;
    restart)
        echo "Restarting..."
        bash "$0" stop
        bash "$0" start
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac