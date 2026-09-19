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
RUN npm ci --omit=dev && npm install tsx --no-save
# tsx is a devDependency (used for local `npm run server`); installed
# separately here since --omit=dev strips it, but the runtime still needs it
# to execute the TypeScript server directly without a separate build step.

COPY server ./server
COPY --from=build /app/dist ./dist

# Cloud Run injects PORT and expects the container to listen on it --
# server/index.ts already reads process.env.PORT first.
EXPOSE 8080
CMD ["npx", "tsx", "server/index.ts"]
