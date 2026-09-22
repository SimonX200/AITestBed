FROM node:20-alpine
WORKDIR /app
COPY dist/bundle.js .
ENV PORT=3000
ENV REDIS_URL=redis://redis:6379
EXPOSE 3000
CMD ["node", "bundle.js"]
