# ── Stage 1: Build the React frontend ──
FROM node:20-alpine AS frontend

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: Python backend + nginx serving ──
FROM python:3.11-slim

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend + analysis code
COPY backend/ ./backend/
COPY data_cleaning.py .
COPY analysis/ ./analysis/
COPY models/ ./models/
COPY Stories_data/ ./Stories_data/

# Copy built frontend
COPY --from=frontend /app/dist /usr/share/nginx/html

# Nginx config: SPA fallback + proxy /api to Flask
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location /api { proxy_pass http://127.0.0.1:5000; proxy_set_header Host $host; } \
  location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start both Flask and nginx
CMD sh -c "cd /app && python backend/app.py &" && nginx -g "daemon off;"
