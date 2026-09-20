FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./bundle.js
EXPOSE 3000
CMD ["node", "bundle.js"]
