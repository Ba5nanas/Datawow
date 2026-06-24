# Backend + Landingpage Docker Compose

## Quick Start

```bash
docker compose up --build
```

## Services

| Service     | URL             | Port |
|-------------|-----------------|------|
| Backend     | http://localhost:5000 | 3000 |
| Landingpage | http://localhost:5001 | 3001 |

## Development

Both services run in dev mode with hot-reload enabled via volume mounts.

Changes to source files will automatically trigger rebuild/restart.
