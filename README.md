# DARUNITED Webapp

Next.js 16 application for the DARUNITED public website and admin dashboard, built with a **module/feature architecture** and integrated with a Laravel backend API.

## Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **TanStack React Query** — client data fetching & mutations
- **React Hook Form + Zod** — forms & validation
- **httpOnly cookies + BFF route handlers** — secure auth token storage

## Roles

| Role | Access |
|------|--------|
| `user` | Public landing pages only |
| `analyst` | Dashboard read access + analytics (no create/edit/delete) |
| `super_admin` | Full dashboard access |

## Project Structure

```
app/
  (auth)/          # Login & OTP pages
  (public)/        # Public marketing site
  (dashboard)/     # Admin dashboard (protected)
  api/auth/        # BFF proxies to Laravel auth endpoints

modules/           # Feature modules (domain logic)
shared/            # Cross-cutting concerns
```

## Auth Flow

```
/login → POST /api/auth/request-code → sets du_otp_access_token cookie
/otp   → POST /api/auth/verify-code → sets du_access_token + du_refresh_token + du_user_role
/dashboard/* → proxy checks session + role
```

## Environment

Copy `.env.example` to `.env.local` and fill backend / Firebase values when ready.

## Brand

Colors and typography follow the DARUNITED mini-guide (black / red / grey / off-white, Aktiv Grotesk). Font files and official logos can be dropped into `public/fonts/` and `public/logos/` later.
