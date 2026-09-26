FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production 2>/dev/null || npm install --only=production

# Copy compiled bundle
COPY dist/bundle.js ./dist/bundle.js

EXPOSE 3000

CMD ["node", "dist/bundle.js"]
