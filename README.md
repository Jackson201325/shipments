# Shipments Dashboard

A small logistics dashboard built with **Turborepo**, **React + Vite**, **NestJS**, and **Supabase (with RLS)**.  
It demonstrates user impersonation, dynamic shipment status, and optimistic UI updates.

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone git@github.com:Jackson201325/shipments.git
cd shipments
npm install
cd backend && npx prisma generate && cd ../
npm run build --workspace @app/shared
npm run dev

```

### 2. Run Dev (Backend + Frontend)

We use **Turbo** to orchestrate backend and frontend dev servers:

```bash
npm run dev
```

- Starts **NestJS backend** (Supabase proxy module, with RLS preserved).
- Starts **React frontend** (Vite) on another port.
- Turborepo ensures backend starts first.

---

## 🔑 Key Commands

- **Start dev servers:**

  ```bash
  npm run dev
  ```

- **Run only backend:**

  ```bash
  npm run dev --filter backend
  ```

- **Run only frontend:**

  ```bash
  npm run dev --filter frontend
  ```

- **Reset and reseed DB:**

  ```bash
  npx prisma migrate reset
  npx prisma db seed
  ```

---

## 🛠 Technical Decisions

1. **Monorepo with Turborepo**  
   Share Zod schemas and TypeScript types (`@app/shared`) across backend and frontend.  
   ✅ Less duplication. ❌ Slightly more complex tooling.

2. **Prisma vs Supabase RLS**  
   We switched to **Supabase REST via a NestJS service** because Prisma bypasses Row Level Security.  
   ✅ Stronger data security. ❌ Lost Prisma’s ergonomic query builder.

3. **Dynamic Shipment Status**  
   Status (`On Time`, `In Transit`, `Delayed`, `Delivered`) is derived dynamically from timestamps.  
   ✅ Always consistent with real data. ❌ Cannot track historical status changes.

4. **Optimistic Row Updates**  
   When clicking “Mark Delivered”, only that row updates optimistically while awaiting confirmation.  
   ✅ Very responsive UI. ❌ Requires careful cache invalidation.

5. **User Impersonation (Dev)**  
   Developers can impersonate users (Alice/Bob) from the **Users Page** to quickly test role-specific flows.

---

## 📈 Scaling Considerations

For **1M+ shipments** we would:

- Add **indexes** on `createdAt`, `originLocationId`, `destinationLocationId`.
- Use **keyset pagination** instead of offset-based.
- Implement **Edge Functions** in Supabase for hot paths.
- Add **frontend virtualization** (`react-window`) to render only visible rows.

---

## 🔮 Future Features

- **Real-time updates** via Supabase subscriptions (shipments update live across clients).
- **Robust logging & monitoring** (cover edge cases before adding new features).
- **Spec-driven validation** for stronger data contracts.

---
