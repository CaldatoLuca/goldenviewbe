# GoldenView — Backend API

REST API for the GoldenView platform. Manages authentication, users, spots, tags, and file uploads.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Language | TypeScript 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT (HttpOnly cookies) |
| Validation | Zod 4 |
| File Upload | UploadThing |
| API Docs | Swagger UI (`/docs`) |
| Logging | Morgan + Winston |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- UploadThing account

### Installation

```bash
npm install
```

### Environment

Create `.env.development` and `.env.production` based on `.env.example`:

```env
DATABASE_URL=
PORT=3001
NODE_ENV=development
API_URL=

UPLOADTHING_TOKEN=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```

### Development

```bash
npm run dev
```

Starts the server with hot reload on `http://localhost:3001`.
Interactive API docs available at `http://localhost:3001/docs`.

### Production

```bash
npm run prod       # build + start
npm run build      # compile only
npm run start      # run compiled output
```

---

## Database

```bash
# Run migrations (dev)
npm run prisma:migrate:dev

# Deploy migrations (prod)
npm run prisma:migrate:prod

# Open Prisma Studio (dev)
npm run prisma:studio:dev

# Regenerate client after schema changes
npm run prisma:generate

# Reset dev database
npm run prisma:reset:dev
```

---

## Project Structure

```
src/
├── index.ts                  # Entry point
├── server.ts                 # Express app, middleware chain, route registration
├── config/
│   ├── env.ts                # Environment loader (dev/prod)
│   ├── prisma.ts             # Singleton Prisma client
│   └── swagger.ts            # OpenAPI specification
├── controllers/              # Request handlers — delegate to services
├── services/
│   ├── base.service.ts       # Generic CRUD base class
│   ├── auth.service.ts       # Register, login, refresh, logout
│   ├── token.services.ts     # JWT sign & verify
│   ├── user.service.ts
│   ├── spot.service.ts
│   └── tag.service.ts
├── middleware/
│   ├── auth.middleware.ts    # JWT verification + silent token refresh
│   ├── admin.middleware.ts   # Restricts access to ADMIN role
│   ├── validate.middleware.ts # Zod request validation
│   ├── error.middleware.ts   # Global error handler
│   ├── notfound.middleware.ts
│   └── morgan.middleaware.ts
├── routes/
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── spot.routes.ts
│   └── tag.routes.ts
├── schemas/                  # Zod validation schemas
├── utils/
│   ├── AppError.ts           # Custom error class (message + HTTP status)
│   ├── errorMap.prisma.ts    # Maps Prisma errors to HTTP errors
│   └── uploadthing.ts        # UploadThing router configuration
└── types/
    └── express.d.ts          # Extends Express Request with userId
```

---

## API Reference

Full interactive documentation is available at `/docs` (Swagger UI).

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Register — email, password (≥8), username (3-30) |
| `POST` | `/auth/login` | No | Login with email and password |
| `POST` | `/auth/refresh` | No | Rotate refresh token and issue new access token |
| `POST` | `/auth/logout` | No | Invalidate refresh token and clear cookies |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me` | Yes | Current authenticated user profile |

### Spots

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/spots/get-all` | No | List all spots |

### Tags

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/tags/get-all` | Admin | List all tags |
| `GET` | `/tags/:id` | Admin | Get tag by ID |
| `POST` | `/tags` | Admin | Create a tag (`name`, 1-50 chars) |
| `PUT` | `/tags/:id` | Admin | Update a tag |
| `DELETE` | `/tags/:id` | Admin | Delete a tag |

### File Upload

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/uploadthing` | Yes | Upload an image (max 4 MB) |

---

## Authentication Model

- **Access token** — 15 min expiry, stored in `HttpOnly` cookie
- **Refresh token** — 30 day expiry, hashed and stored in DB, `HttpOnly` cookie
- Expired access tokens are refreshed **transparently** by the auth middleware using the refresh token cookie
- Refresh token reuse is detected via hash comparison — reuse invalidates the session

---

## Data Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | Primary key |
| `username` | String | 3–30 characters |
| `email` | String | Unique |
| `password` | String | bcrypt hashed |
| `image` | String? | Avatar URL |
| `role` | Enum | `USER` \| `ADMIN` |
| `refreshToken` | String? | Hashed |
| `emailVerified` | Boolean | |

### Spot

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | Primary key |
| `name` | String | |
| `address` | String | |
| `place` | String | |
| `description` | String | |
| `userId` | String | FK → User (cascade delete) |
| `images` | String[] | URLs |
| `latitude` | Float | |
| `longitude` | Float | |
| `public` | Boolean | |
| `active` | Boolean | |
| `slug` | String | Unique |
| `tags` | Tag[] | Many-to-many |

### Tag

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | Primary key |
| `name` | String | Unique, max 50 chars |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

---

## Error Handling

All errors are returned as structured JSON:

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    "status": 404
  }
}
```

Throw `new AppError("message", statusCode)` anywhere in controllers or services — the global error middleware handles the rest. Prisma errors are automatically mapped to appropriate HTTP status codes via `errorMap.prisma.ts`.

---

## CORS

Requests are accepted from the following origins:

- `http://localhost:3000`
- `https://goldenview-admin.netlify.app`
- `https://goldenviewadmin.netlify.app`
- `https://gw-admin-livid.vercel.app`
