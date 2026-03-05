# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server with hot reload (tsx watch)
npm run build        # Generate Prisma client + compile TypeScript to dist/
npm run start        # Run compiled dist/index.js
npm run prod         # Build and start together

# Prisma
npm run prisma:generate       # Regenerate Prisma client after schema changes
npm run prisma:migrate:dev    # Run migrations on dev database
npm run prisma:migrate:prod   # Deploy migrations to production
npm run prisma:studio:dev     # Open Prisma Studio GUI for dev database
npm run prisma:pull:dev       # Pull schema from dev DB (introspection)
npm run prisma:reset:dev      # Reset dev database
```

No test or lint scripts are configured.

## Architecture

Express.js REST API with TypeScript, PostgreSQL via Prisma ORM.

**Request flow**: Route → Middleware (auth/validate) → Controller → Service → Prisma → DB

```
src/
├── index.ts / server.ts     # Entry point and Express app setup (CORS, middleware chain)
├── config/
│   ├── env.ts               # Loads .env.development or .env.production based on NODE_ENV
│   └── prisma.ts            # Singleton Prisma client
├── controllers/             # Thin handlers that delegate to services
├── services/
│   ├── base.service.ts      # Generic CRUD template extended by other services
│   ├── auth.service.ts      # Register, login, refresh, logout logic
│   ├── token.services.ts    # JWT generation and verification
│   └── ...                  # user.service.ts, spot.service.ts
├── middleware/
│   ├── auth.middleware.ts   # JWT verification + automatic access token refresh
│   ├── validate.middleware.ts # Zod schema validation
│   └── error.middleware.ts  # Global error handler
├── schemas/                 # Zod validation schemas
├── utils/
│   ├── AppError.ts          # Custom error class (message + HTTP status)
│   └── errorMap.prisma.ts   # Maps Prisma errors to HTTP errors
└── types/                   # express.d.ts extends req with userId
```

## Database Models

- **User**: id (CUID), username, email (unique), password (bcrypt), image, role (USER/ADMIN), refreshToken (hashed), emailVerified
- **Spot**: id, name, address, place, description, userId (FK→User, cascade delete), images[], latitude, longitude, public, active, slug (unique)

## Authentication

- Access token: 15min expiry, stored in HttpOnly cookie
- Refresh token: 30 days expiry, hashed in DB, stored in HttpOnly cookie
- Auth middleware auto-refreshes expired access tokens transparently
- Token reuse detection via hash comparison against DB

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register (email, password ≥8 chars, username 3-30 chars) |
| POST | /auth/login | No | Login |
| POST | /auth/refresh | No | Refresh access token |
| POST | /auth/logout | No | Logout |
| GET | /users/me | Yes | Current user profile |
| GET | /spots/get-all | No | All spots |
| POST/GET | /api/uploadthing | Yes | File uploads (max 4MB, images only) |

## Environment Variables

Required in `.env.development` / `.env.production` (see `.env.example`):

```
DATABASE_URL, PORT, NODE_ENV, API_URL
UPLOADTHING_TOKEN
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

## Error Handling

Throw `new AppError("message", httpStatusCode)` in services/controllers. The global error middleware in `error.middleware.ts` catches all errors and returns structured JSON. Prisma errors are mapped to HTTP errors via `errorMap.prisma.ts`.
