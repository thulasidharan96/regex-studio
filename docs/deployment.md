# Regex Studio Deployment

Because Regex Studio is fully static and offline-first, deployment is straightforward. The application requires no database servers, backend runtimes, or authentication microservices.

## Local Development

Regex Studio v3 utilizes `bun` or standard modern monorepo package managers for development orchestration.

### Prerequisites
- Install [Bun](https://bun.sh).

### Setup Commands
```bash
# 1. Install Workspace Dependencies
bun install

# 2. Spin up Local Development Server
bun dev

# 3. Compile Production Output
bun build
```

---

## Static Web Hosting

The build process compilation outputs static assets to `apps/web/dist`. These files can be hosted on any standard CDN or static server.

### 1. GitHub Pages
We configure standard automatic workflows to build and push static files:
- Target folder: `apps/web/dist`
- Asset base: Set in `vite.config.ts` to support custom subdomain URLs.

### 2. Nginx Static Routing
An example Nginx config file for container deployments:

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Vercel / Netlify / Cloudflare Pages
Simply connect the repository and specify:
- **Build Command**: `bun run build`
- **Output Directory**: `apps/web/dist`

---

## Containerized Deployment (Docker)

To run a secure, containerized preview:

```dockerfile
# Build phase
FROM oven/bun:1.3.14-alpine AS builder
WORKDIR /app
COPY . .
RUN bun install && bun run build

# Run phase
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
