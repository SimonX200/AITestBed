FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js ./bundle.js
ENV PORT=3000
EXPOSE 3000
CMD ["node", "bundle.js"]
