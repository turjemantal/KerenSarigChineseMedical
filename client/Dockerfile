FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Vite build-time config (baked into the bundle) — passed by `make push-images` from the root .env.
# Declared after `npm ci` so changing the value never busts the dependency cache layer.
# Public values only — anything here ends up in the client JS that every visitor downloads.
ARG VITE_MEDIA_BASE_URL
ENV VITE_MEDIA_BASE_URL=$VITE_MEDIA_BASE_URL
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
