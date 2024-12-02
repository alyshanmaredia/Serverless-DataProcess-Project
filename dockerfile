# Use Node 16 base image
FROM node:16-alpine

WORKDIR /app

COPY frontend/package*.json ./


RUN npm install

COPY frontend/ ./

RUN npm run build


EXPOSE 3000

# Start the app
CMD ["npx", "serve", "build"]


