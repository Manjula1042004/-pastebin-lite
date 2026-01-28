# Pastebin Lite

A lightweight pastebin application with optional expiry constraints.

## Features
- Create text pastes with optional time/view limits
- Share via unique URLs
- REST API with JSON responses
- Automatic cleanup when constraints met

## Tech Stack
- Next.js 14, TypeScript, Prisma ORM
- SQLite (dev), PostgreSQL/Neon (prod)
- Vercel hosting

## API
- `GET /api/healthz` - Health check
- `POST /api/pastes` - Create paste
- `GET /api/pastes/:id` - Get paste (JSON)
- `GET /p/:id` - View paste (HTML)