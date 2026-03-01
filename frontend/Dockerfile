FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build args injected at build time by docker-compose
ARG VITE_AUTH_USERNAME=storyteller
ARG VITE_AUTH_PASSWORD=taleworld
ARG VITE_API_MODE=local
ARG VITE_API_BASE_URL=http://localhost:8000

ENV VITE_AUTH_USERNAME=$VITE_AUTH_USERNAME
ENV VITE_API_MODE=$VITE_API_MODE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Serve the built files with a tiny static server
FROM node:20-slim

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
