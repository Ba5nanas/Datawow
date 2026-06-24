# Concert Reservation System

A full-stack concert reservation application with role-based access control, built with NestJS backend and Next.js frontend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
└─────────────────────────────┬───────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
┌─────────▼────────┐                  ┌──────────▼──────────┐
│  Next.js Frontend │                  │  NestJS Backend API  │
│  (Port 5001)     │◄────────────────►│  (Port 5000)        │
│                  │    HTTP/REST     │                     │
│ - Auth Pages     │                  │ - Auth Module       │
│ - User Dashboard │                  │ - User Module       │
│ - Admin Dashboard│                  │ - Concert Module    │
│ - Middleware     │                  │ - JWT Guards        │
└──────────────────┘                  └──────────┬──────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │   PostgreSQL    │
                                          │   (Port 5432)   │
                                          │   Database      │
                                          └─────────────────┘
```

### Layered Architecture

```
Frontend (landingpage/)
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (proxy layer)
│   ├── admin/              # Admin portal pages
│   ├── user/               # User portal pages
│   └── page.tsx            # Landing page
├── components/             # Reusable React components
│   ├── dashboard.tsx       # Admin/User dashboards
│   ├── auth-field.tsx      # Auth form fields
│   ├── auth-layout.tsx     # Auth page layout
│   ├── brand.tsx           # Branding component
│   └── icons.tsx           # Icon components
└── middleware.ts           # Auth middleware (cookie verification)

Backend (backend/)
├── src/
│   ├── auth/               # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   ├── strategies/     # JWT strategy
│   │   ├── decorators/     # @Roles() decorator
│   │   └── dto/            # Login DTO
│   ├── user/               # User module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── dto/            # Register DTO
│   ├── concert/            # Concert & Reservation module
│   │   ├── concert.controller.ts
│   │   ├── concert.service.ts
│   │   └── dto/            # CreateConcert DTO
│   ├── common/
│   │   ├── entities/       # TypeORM entities
│   │   │   ├── user.entity.ts
│   │   │   ├── concert.entity.ts
│   │   │   ├── concert-reservation.entity.ts
│   │   │   └── concert-history.entity.ts
│   │   └── enums/          # Role enum (ADMIN, USER)
│   ├── app.module.ts       # Root module with TypeORM config
│   └── main.ts             # App bootstrap
```

### Data Flow

1. **Auth Flow**: Frontend → `POST /api/login` → Backend `/auth/login` → JWT token → stored in cookies
2. **Concert Flow**: Frontend → `GET /api/concerts` → Backend `/concerts` → PostgreSQL
3. **Reservation Flow**: Frontend → `POST /api/concert/:id/reserve` → Backend `/concerts/:id/reserve` → DB transaction (decrement availableSeats + create reservation record)

## Library List

### Backend Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `@nestjs/common` | ^10.0.0 | Core NestJS framework |
| `@nestjs/core` | ^10.0.0 | NestJS runtime |
| `@nestjs/jwt` | ^11.0.2 | JWT token generation and verification |
| `@nestjs/passport` | ^11.0.5 | Passport.js integration |
| `@nestjs/platform-express` | ^10.0.0 | Express adapter |
| `@nestjs/typeorm` | ^11.0.2 | TypeORM integration |
| `bcrypt` | ^6.0.0 | Password hashing |
| `class-transformer` | ^0.5.1 | Object transformation for DTOs |
| `class-validator` | ^0.15.1 | DTO validation decorators |
| `passport` | ^0.7.0 | Authentication middleware |
| `passport-jwt` | ^4.0.1 | JWT authentication strategy |
| `pg` | ^8.22.0 | PostgreSQL driver |
| `reflect-metadata` | ^0.2.0 | Metadata reflection API |
| `rxjs` | ^7.8.0 | Reactive programming utilities |
| `typeorm` | ^1.0.0 | ORM for PostgreSQL |

### Backend Dev Dependencies

| Library | Purpose |
|---------|---------|
| `@nestjs/cli` | NestJS CLI tools |
| `@nestjs/schematics` | NestJS code generators |
| `@nestjs/testing` | Testing utilities |
| `jest` | Unit testing framework |
| `ts-jest` | Jest preprocessor for TypeScript |
| `ts-node` | TypeScript execution |
| `typescript` | TypeScript compiler |

### Frontend Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `next` | 14.0.0 | React framework (App Router) |
| `react` | ^18 | UI library |
| `react-dom` | ^18 | DOM rendering |

### Frontend Dev Dependencies

| Library | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `tailwindcss` | Utility-first CSS framework |
| `autoprefixer` | CSS vendor prefixing |
| `postcss` | CSS processing |
| `eslint` + `eslint-config-next` | Linting |

## Setup Instructions

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed
- Node.js 18+ (for local development without Docker)

### Option 1: Docker (Recommended)

**Step 1: Clone and start all services**

```bash
cd your folder
docker compose up --build
```

This starts:
- **Backend API** at `http://localhost:5000`
- **Next.js Frontend** at `http://localhost:5001`
- **PostgreSQL** at `localhost:5432`

**Step 2: Verify services**

```bash
# Check all containers are running
docker ps

# View logs
docker compose logs -f
```

### Option 2: Local Development

**Step 1: Start PostgreSQL**

```bash
docker run -d --name concert-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=backend -p 5432:5432 postgres:16-alpine
```

**Step 2: Start Backend**

```bash
cd backend
npm install
npm run start:dev
```

**Step 3: Start Frontend**

```bash
cd landingpage
npm install
npm run dev
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | (register via `/admin/register`) | (set during registration) |
| User | (register via `/user/register`) | (set during registration) |

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login and receive JWT |

### Concerts

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/concerts` | Admin, User | List all concerts |
| `GET` | `/concerts/:id` | Admin, User | Get concert details |
| `POST` | `/concerts` | Admin only | Create a new concert |
| `DELETE` | `/concerts/:id` | Admin only | Delete a concert |

### Reservations

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/concerts/:id/reserve` | User only | Reserve a seat |
| `POST` | `/concerts/:id/cancel` | User only | Cancel a reservation |
| `GET` | `/concerts/history` | Admin only | View all reservation history |

## Test Execution

### Backend Unit Tests

```bash
cd backend
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # Run with coverage report
```

### Test Coverage

Tests cover:
- **Auth**: Registration, login, JWT payload validation, duplicate email rejection, invalid password rejection
- **Concert**: CRUD operations, role-based access control, validation errors
- **Reservations**: Reserve, cancel, duplicate prevention, full concert handling, history access
- **Edge Cases**: Non-existent concert, deleted concert, race condition protection

### Frontend Unit Tests

```bash
cd landingpage
npm run test          # Run all tests in watch mode
npm run test:run      # Run all tests once
```

#### Test Coverage

Tests cover **72 test cases** across 5 test files:

| File | Tests | Coverage |
|------|-------|----------|
| `tests/brand.test.tsx` | 4 | Brand component (colors, inverse prop) |
| `tests/auth-field.test.tsx` | 7 | AuthField (label, placeholder, password type, icons, focus styles) |
| `tests/auth-layout.test.tsx` | 7 | AuthLayout (children, brand, heading, paragraph, layout structure) |
| `tests/dashboard.test.tsx` | 47 | Icon, Sidebar, ConcertCard, Metric, Toast, ToastError, CreateForm, DeleteModal |
| `tests/page.test.tsx` | 7 | AccessIcon, AccessCard (icons, titles, links, styling) |

#### Testing Stack

| Library | Purpose |
|---------|---------|
| `vitest` | Unit testing framework |
| `@testing-library/react` | React component testing utilities |
| `@testing-library/jest-dom` | DOM matchers (toBeInTheDocument, toHaveClass, etc.) |
| `@testing-library/user-event` | User interaction simulation |
| `jsdom` | DOM environment for Node.js |

## Review Criteria

### Correctness & Completeness

The application fulfills all user and admin stories:
- **User Stories**: Register, login, view concerts, reserve seats, cancel reservations, view own history
- **Admin Stories**: Register, login, create concerts, delete concerts, view all concerts, view full reservation history
- **Role Separation**: Admin cannot reserve/cancel; User cannot create/delete concerts

### Architecture & Clarity

- **Clean separation of concerns**: Services handle business logic, Controllers handle HTTP routing, DTOs handle input validation
- **Module-based NestJS architecture**: Auth, User, and Concert modules are independent and well-encapsulated
- **TypeORM entities**: Properly defined with relations and constraints
- **Guards & Decorators**: `JwtAuthGuard` for authentication, `RolesGuard` + `@Roles()` for authorization

### Responsive Design

- Mobile-first approach using Tailwind CSS breakpoints (`sm:`, `md:`, `lg:`)
- Sidebar collapses to top navigation on mobile, side panel on `lg:` screens
- Grid layouts adapt from single column (mobile) to multi-column (desktop)
- Touch-friendly button sizes and spacing

### Robustness

- **Input validation**: DTOs with `class-validator` decorators for all endpoints
- **Duplicate prevention**: Users cannot reserve the same concert twice
- **Full concert handling**: Returns `BadRequestException` when concert is fully booked
- **Error handling**: Proper HTTP status codes and exception messages
- **Password security**: Hashed with `bcrypt`
- **JWT authentication**: Token-based stateless auth with expiry
- **Middleware auth**: Frontend middleware verifies tokens and enforces role-based routing

## Bonus: Performance Optimization

If the dataset becomes massive and traffic increases, the following strategies would be applied:

1. **Database Indexing**: Add indexes on frequently queried columns — `concerts.availableSeats`, `concert_reservations.concertId`, `concert_reservations.userId`, and `concert_reservations.action` — to speed up reservation lookups and seat availability checks.

2. **Caching**: Implement Redis or in-memory caching for the `GET /concerts` endpoint. Concert data changes infrequently (only on create/delete/reserve/cancel), so caching the concert list with a short TTL (e.g., 30 seconds) would drastically reduce database load. Cache invalidation triggers on mutation operations.

3. **Connection Pooling**: Configure PgBouncer or TypeORM's built-in connection pooling to handle high concurrent database connections efficiently.

4. **CDN**: Serve static assets (images, CSS, JS bundles) via a CDN like Cloudflare or Vercel Edge Network to reduce latency for global users.

5. **Pagination & Lazy Loading**: Implement cursor-based or offset pagination on the concert list and history endpoints to limit result set sizes and reduce database queries.

6. **Read Replicas**: For read-heavy workloads, offload `GET /concerts` and `GET /concerts/:id` queries to PostgreSQL read replicas.

## Bonus: Concurrency Control — Race Condition Strategy

The scenario: 1,000 users simultaneously try to reserve the last 10 available seats.

### Current Implementation

The current code checks `availableSeats` before reserving but does not use database transactions, which creates a race condition window where two requests could read the same `availableSeats` value and both proceed.

### Recommended Strategy: Pessimistic Locking with Database Transactions

```typescript
// Using TypeORM query runner for transaction + pessimistic write lock
const queryRunner = this.concertRepository.manager.connection.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // Lock the concert row and read it in the same transaction
  const concert = await queryRunner.manager.findOne(ConcertEntity, {
    where: { id },
    lock: { mode: 'pessimistic_write' },  // SELECT ... FOR UPDATE
  });

  if (concert.availableSeats <= 0) {
    throw new BadRequestException('Concert is fully booked');
  }

  // Decrement and save within the same transaction
  concert.availableSeats -= 1;
  await queryRunner.manager.save(concert);

  // Create reservation record
  const reservation = queryRunner.manager.create(ConcertReservationEntity, {
    concertId: concert.id,
    userId,
    action: ReservationAction.reserve,
  });
  await queryRunner.manager.save(reservation);

  // Create history record
  const history = queryRunner.manager.create(ConcertHistoryEntity, {
    concertId: concert.id,
    userId,
    action: HistoryAction.reserve,
  });
  await queryRunner.manager.save(history);

  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

### Why Pessimistic Locking over Optimistic Locking?

| Approach | Pros | Cons |
|----------|------|------|
| **Pessimistic Locking** (`SELECT ... FOR UPDATE`) | Guaranteed no over-booking; simple reasoning | Lower throughput under extreme contention; rows are locked during transaction |
| **Optimistic Locking** (version column) | Higher throughput; no row locks | Multiple retries under high contention; more complex error handling |
| **Message Queue** (e.g., Redis/RabbitMQ) | Serializes requests; scales horizontally | Adds infrastructure complexity; eventual consistency |

For this use case, **pessimistic locking** is the most appropriate because:
1. Seat reservation is a **critical data integrity** operation — over-booking is unacceptable
2. The transaction duration is very short (a few SQL statements), so lock contention is minimal
3. It provides the simplest and most correct guarantee without additional infrastructure

### Alternative: Database-Level Unique Constraint

Additionally, a unique constraint on `(concertId, userId)` where `action = 'reserve'` provides a final safety net at the database level, preventing duplicate reservations even if application-level checks fail.

---

## Project Structure

```
Datawow/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Auth module
│   │   ├── user/               # User module
│   │   ├── concert/            # Concert & Reservation module
│   │   ├── common/             # Shared entities and enums
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── landingpage/                # Next.js Frontend
│   ├── app/
│   │   ├── api/                # API proxy routes
│   │   ├── admin/              # Admin pages
│   │   ├── user/               # User pages
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   ├── middleware.ts           # Auth middleware
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # Docker orchestration
└── .gitignore
```

This is a live demo running on my home server: https://datawow.nuddev.com
