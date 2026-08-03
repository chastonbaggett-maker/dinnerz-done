# Dinnerz Done

Mobile-first web app for a local dinner-to-door business. Customers order the day before; admins build daily menus with customizable items.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS + shadcn/ui**
- **Supabase** (Postgres)
- **Clerk** (optional customer accounts + admin auth)
- **Stripe Checkout** (payments)

## Quick start

```bash
cd "DD site"
npm install
cp .env.example .env.local
# Fill in env vars (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo mode:** Without Supabase/Stripe keys, the app runs with in-memory demo menu data and skips payment.

## Environment setup

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_*` | Database |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side writes |
| `NEXT_PUBLIC_CLERK_*` | Auth |
| `ADMIN_USER_IDS` | Comma-separated Clerk user IDs for admin access |
| `STRIPE_*` | Payments |
| `NEXT_PUBLIC_APP_URL` | Stripe redirect URLs |
| `RESEND_API_KEY` | Optional order confirmation emails |

### Admin access

Set `publicMetadata.role = "admin"` on your Clerk user, **or** add your Clerk user ID to `ADMIN_USER_IDS`.

### Database

1. Create a [Supabase](https://supabase.com) project
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Optionally run `supabase/seed.sql` for sample menu items

## Features

- **Customer:** Browse tomorrow's menu, customize items, cart, Stripe checkout, order history (signed in)
- **Admin:** Menu library, daily menu builder, order management, business settings
- **Mobile:** Bottom sheets, sticky cart bar, PWA manifest

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
