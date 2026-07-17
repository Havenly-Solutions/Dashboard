# Havenly Dashboard

Founder command center for Havenly Solutions \u2014 built with Next.js 14 (App
Router), TypeScript, Tailwind CSS, and TanStack Query. Design system sourced
directly from the Stitch export.

## What's in here

- **7 exclusive portals**, one per role, each with its own home screen and
  default access \u2014 not a shared dashboard with filtered nav:
  - **Founder Portal** (`/overview`) \u2014 full control, business + technical + team
  - **Executive Portal** (`/executive-portal`, Co-Founder) \u2014 business focus: finance, marketing, subscriptions
  - **Manager Portal** (`/manager-portal`) \u2014 SOS, helpdesk, support
  - **PA Portal** (`/pa-portal`) \u2014 helpdesk, support, comms
  - **Developer Portal** (`/developer-portal`) \u2014 app analytics, security suite
  - **Partners Portal** (`/partners-portal`, NGO partner) \u2014 case load, funding
  - **Investor Portal** (`/investor-portal`) \u2014 read-only growth & health metrics
  - `/portal-switcher` (Founder only) previews any portal via a real
    role-scoped JWT swap (`/admin/test-mode/switch-role`), not a client-side costume.
- **Access Control Matrix** (`/access-control`, Founder only): grant or
  revoke any module by role or by individual person, live, with an audit log.
- **Onboarding**: forced password change on first login
  (`/welcome/set-password`), then a 5-step guided tour that spotlights the
  real sidebar/topbar/content \u2014 the same tour for every portal, replayable
  from Settings.
- **Auth**: sign in, forgot/reset password, invite-link account setup (no
  PIN, no WhatsApp/SMS).
- **Live SOS Command**: real-time incident queue with a live Mapbox map.
- **Marketing Analytics**: traffic/funnel data for www.havenly.solutions.
- **App & System Analytics**: mobile engagement + GSM/Satellite/fleet health.
- **Helpdesk**, **Customer Support**, **Team & Approvals**.
- **Security Suite**: GoPhish campaigns, CTFd leaderboard, breach log.
- **Subscription Management** (customers' billing) and **Billing**
  (Havenly's own payment method \u2014 provider-agnostic tokenized card capture,
  works with Stripe, Yoco, Peach Payments, or Paystack).
- **Finance Hub**, **Partners & NGOs**, **Comms Hub** (email + in-app),
  **Settings**.
- Light/dark theme toggle.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. `.env.local` ships with
`NEXT_PUBLIC_DEMO_MODE=true`, so every screen renders with realistic seeded
data even with no backend running.

## Wiring up havenly-backend

See **[`HANDOFF.md`](./HANDOFF.md)** for the full endpoint list, request/response
shapes, Socket.io event names, the access-control resolution order, and
what's built vs. not yet built.

## Structure

```
src/
  app/
    (auth)/           \u2014 login, password reset, invite acceptance
    welcome/          \u2014 forced first-login password change
    (dashboard)/       \u2014 every module and all 7 portal homes
  components/
    ui/               \u2014 design-system primitives
    layout/           \u2014 Sidebar, Topbar, DashboardShell (grant-aware RBAC guard)
    onboarding/        \u2014 guided tour + "Getting started" checklist
    charts/           \u2014 recharts wrappers
  hooks/               \u2014 one file per domain, TanStack Query hooks
  lib/
    api-client.ts     \u2014 fetch wrapper, JWT refresh handling
    rbac.ts           \u2014 roles, portals, default module access
    permissions.ts    \u2014 resolves role defaults + Founder grants/overrides
    onboarding.ts     \u2014 tour steps + localStorage completion state
    mock-data.ts      \u2014 demo-mode fallback data
    socket.ts         \u2014 Socket.io client
  types/               \u2014 shared domain types, mirrors backend DTOs
```
