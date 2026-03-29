# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept the API URL at build time so Vite can embed it into the static bundle.
# Default is empty string: the frontend uses relative /api/* URLs and nginx
# proxies them to the backend container.
# Override only if NOT using the nginx reverse-proxy.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production image
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx config with our SPA-aware config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Healthcheck to ensure container is healthy
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
