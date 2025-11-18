# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Actually building the API here!
RUN npm run build

# Serve the app
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY .env.prod ./.env
# --omit=dev ensures we don't install devDependencies in production
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3112
CMD ["node", "dist/index.js"]