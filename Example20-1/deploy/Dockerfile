FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./dist/bundle.js
COPY package.json ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "dist/bundle.js"]
