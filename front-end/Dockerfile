# --- build static assets with Node 22.14.0 ---
FROM node:22.14.0-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build-time env for Vite (API base in production). We proxy /api to backend via nginx.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# --- serve with nginx ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
