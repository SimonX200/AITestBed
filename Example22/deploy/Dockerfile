FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
COPY package.json .
COPY node_modules ./node_modules
EXPOSE 3000
CMD ["node", "bundle.js"]
