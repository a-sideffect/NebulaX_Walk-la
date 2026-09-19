# ---- Build stage: install deps and compile the frontend ----
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage: only what's needed to actually run the server ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY --from=build /app/dist ./dist

# Cloud Run injects PORT and expects the container to listen on it --
# server/onemap.js already reads process.env.PORT first (falls back to 3001).
EXPOSE 8080
CMD ["node", "server/onemap.js"]
