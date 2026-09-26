FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./dist/bundle.js
COPY node_modules/sql.js/dist/sql-wasm.wasm ./dist/sql-wasm.wasm
COPY package.json ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "dist/bundle.js"]
