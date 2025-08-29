# Project Technical Memo

## Key Technical Decisions

### 1. Monorepo with Turborepo

We structured the project as a **Turborepo monorepo**. This lets us share types and schemas (`@app/shared`) across backend and frontend while keeping concerns separated.

- **Pros:**
  - Shared Zod schemas and TypeScript types reduce duplication and bugs.
  - Easier developer workflow (one repo, consistent tooling).
  - CI/CD pipelines can cache and parallelize builds.
- **Cons:**
  - Slightly higher setup complexity compared to single repo.
  - Requires developers to learn monorepo tooling if unfamiliar.

---

### 2. Prisma vs Supabase (RLS Limitation)

Initially, we planned to use Prisma for database access. However, since we rely on **Supabase Row Level Security (RLS)**, Prisma would bypass those checks.  
The solution was to create a **Supabase service module** inside NestJS that queries through Supabase REST with RLS enabled.

- **Pros:**
  - Enforces security policies consistently at the database level.
  - Simpler to reason about access control.
  - Still type-safe by validating responses with Zod.
- **Cons:**
  - Gives up Prisma’s advanced query builder and migrations.
  - Supabase REST is less ergonomic than Prisma for complex queries.
  - Slightly more network overhead (HTTP vs direct DB queries).

---

### 3. Dynamic Shipment Status Derivation

Shipment statuses (`On Time`, `In Transit`, `Delayed`, `Delivered`) are derived dynamically from timestamps (`pickupAt`, `expectedDeliveryAt`, `deliveredAt`) instead of being stored.

- **Pros:**
  - No risk of stale status values — always consistent with timestamps.
  - Easy to extend (e.g., detect “late but still in transit”).
  - Keeps database schema simpler.
- **Cons:**
  - Slightly more compute per row on the frontend.
  - Debugging historical changes in status is harder (no persisted status history).

---

### 4. Per-Row Optimistic Updates

On the frontend, we used **React Query** with per-row optimistic updates. When you click “Mark Delivered,” only that row updates optimistically while awaiting confirmation.

- **Pros:**
  - Very responsive user experience (no global loading states).
  - Easy to rollback if mutation fails.
  - Scales better for large lists since only one row is affected.
- **Cons:**
  - More complex cache handling logic.
  - Edge cases (e.g., conflicts with server state) require careful invalidation.

---

### 5. Impersonation for Development

We added a **user impersonation feature**. Developers can impersonate one user from the Users page, which sets an active token in local storage and reloads shipments as if logged in as that user.

- **Pros:**
  - Faster developer workflow when testing RLS and multi-user behavior.
  - No need to manage multiple accounts manually.
- **Cons:**
  - Not a production feature (dev-only).
  - Adds a custom code path that must be carefully excluded from production builds.

---

## Scaling to 1 Million Shipments

If this tool needed to handle 1M+ shipments, I would:

### 1. Move hot paths to Supabase **Edge Functions**

- **Why:** Cut a network hop (client → Nest → Supabase) and run close to the DB with the user’s JWT context so RLS still applies.
- **What I’d move first:**
  - `GET /shipments`: Use **keyset pagination** (cursor-based) instead of offset; allow server-driven includes (origin/destination).
  - `POST /shipments/:id/deliver`: Tiny function running a single SQL `UPDATE`, guarded by RLS. Publish an event to Supabase Realtime for instant UI refresh.

### 2. Optimize the data layer

- **Indexes:** `(senderUserId, id)`, `(createdAt, id)`, `(originLocationId)`, `(destinationLocationId)`, `(expectedDeliveryAt, deliveredAt)`.
- **Partitioning:** Time-based partitioning on `createdAt` to keep indexes lean.
- **Denormalization:** Materialized view or computed columns for list views to avoid heavy joins.
- **Read replicas:** Route list queries to replicas, keep writes on primary.

### 3. Frontend performance

- **Virtualized lists** (`react-window`) so only visible rows render.
- **Smarter caching:** Stale-while-revalidate with React Query + ETags.
- **Realtime invalidation:** Update only affected rows via subscription instead of refetching all.

### 4. Reliability & cost controls

- **Batching & rate limits** on queries/mutations.
- **Idempotency keys** for deliveries (avoid double updates).
- **Background jobs** for heavy aggregate tasks (daily reporting, SLA compliance).

---

## Future Feature

### Real-Time + Hardening

If I had more time, I would add **real-time updates** with Supabase subscriptions (or WebSockets). This way, shipments update instantly across all clients when delivered.

In parallel, I’d focus on **hardening and observability** before expanding features:

- Contract and integration tests for API endpoints.
- Property-based testing of `deriveStatus` edge cases.
- Structured logging + tracing (OpenTelemetry).
- Metrics (RED: Rate, Errors, Duration) and alerts on slow queries or errors.
- Defensive runtime checks via Zod across all client/server interactions.

This ensures we have **robustness and visibility at scale** before layering in more user-facing features like filters, bulk actions, or map visualizations.
