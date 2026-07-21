# Havenly Dashboard \u2014 Backend Handoff

Wiring guide for `havenly-backend/src/dashboard`. Every path, verb, and
payload shape below is exactly what `src/lib/api-client.ts` and the hooks in
`src/hooks/` send and expect back \u2014 nothing here is speculative.

## 0. How this frontend behaves before your routes exist

Every read hook calls the real endpoint first. If it fails (404, network
error, backend not running) **and** `NEXT_PUBLIC_DEMO_MODE=true`, it falls
back to seeded data in `src/lib/mock-data.ts` so every screen is reviewable
without a backend. Set `NEXT_PUBLIC_DEMO_MODE=false` in production.

Write actions (invite, approve, grant access, reply, status changes, add a
card) always call the real endpoint. They are not mocked; they'll error with
a toast until wired up.

## 1. Roles \u2014 no ADMIN, CO_FOUNDER instead

```
FOUNDER | CO_FOUNDER | MANAGER | PA | DEVELOPER | NGO_PARTNER | INVESTOR
```

There is no ADMIN role. The Founder has unrestricted access to everything
(business, technical, and team) and is the only role that can grant or
revoke anyone else's access. CO_FOUNDER is a distinct, business-focused role
(finance, subscriptions, marketing, partners) without the Founder's
technical/security/team-approval reach by default \u2014 the Founder can widen
that per role or per person any time via the Access Control Matrix (\u00a73).

## 2. Auth (`/api/dashboard/auth`) \u2014 no PIN, no WhatsApp

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | Returns `{ user, accessToken, accessTokenExpiresAt }`. Set the refresh token as an **httpOnly cookie**. |
| POST | `/auth/refresh` | *(cookie only)* | Returns `{ accessToken }`. Called automatically on any 401. |
| POST | `/auth/logout` | \u2014 | Clear the refresh cookie server-side. |
| GET | `/auth/me` | \u2014 | Returns `AuthUser` incl. `mustChangePassword`. |
| POST | `/auth/forgot-password` | `{ email }` | Always 200 regardless of whether the email exists. |
| POST | `/auth/reset-password` | `{ token, password }` | 400 if token expired/used. |
| GET | `/auth/invite/:token` | \u2014 | Returns `{ email, role, organizationName?, invitedByName }`. |
| POST | `/auth/accept-invite` | `{ token, password }` | Activates the account, consumes the token. No PIN. |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` | Used by both Settings and the forced first-login flow (\u00a74). On success, clear `mustChangePassword` on the user record. |

**Team invite/approval (Team & Approvals, Founder only):**

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/admin/team` | \u2014 | Returns `TeamMember[]`. |
| POST | `/admin/team/invite` | `{ name, email, role }` | `role` is one of the 7 above. Sends an invite email with a link to `/accept-invite/:token`. |
| POST | `/admin/team/:id/suspend` | \u2014 | Revokes access. |
| POST | `/admin/team/:id/resend-invite` | \u2014 | |
| GET | `/admin/approvals` | \u2014 | Returns `ApprovalRequest[]`. |
| POST | `/admin/approvals/:id/approve` | `{ role }` | Sends the invite email. |
| POST | `/admin/approvals/:id/deny` | \u2014 | |
| POST | `/admin/test-mode/switch-role` | `{ role }` | **Founder only.** Issues a new short-lived JWT scoped to `role`, same shape as `/auth/login`. This is what makes "Switch Portal" real \u2014 every RBAC check and every data-scoping rule on your side should see the simulated role, not Founder. Frontend keeps the original Founder token in memory and restores it locally on "Exit preview" (no extra endpoint needed for that). |

## 3. Access Control Matrix (`/api/dashboard/admin/access-control`) \u2014 Founder only

This is the granular grant/revoke system behind "don't share portal data
that hasn't been granted." Every module has a **default** role scope (see
`src/lib/rbac.ts` \u2192 `NAV_MODULES[].roles`), which the Founder can override
two ways, both live in the UI at `/access-control`:

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/access-control/role-grants` | \u2014 | Returns `RoleGrant[]` \u2014 role-level ON/OFF overrides of a module's default. |
| POST | `/access-control/role-grants` | `{ role, moduleKey, enabled }` | Upserts one role-level override. |
| GET | `/access-control/user-overrides` | \u2014 | Returns `UserOverride[]` \u2014 individual-person overrides, highest precedence. |
| POST | `/access-control/user-overrides` | `{ userId, userRole, moduleKey, enabled, reason? }` | |
| DELETE | `/access-control/user-overrides/:id` | \u2014 | |
| GET | `/access-control/change-log` | \u2014 | Returns `AccessChangeLogEntry[]` for the audit trail shown on the page. |

Resolution order (`src/lib/permissions.ts` \u2192 `resolveAccessibleModuleKeys`):
role default \u2192 role-level grant/revoke \u2192 individual user override. Founder
always resolves to every module, full stop \u2014 they can't lock themselves out
via the matrix. **Enforce this same resolution server-side** on every
protected route; the frontend matrix is worthless if the API doesn't also
check it.

## 4. Onboarding \u2014 first login and the product tour

Two separate, sequential steps, matching the Stitch `onboarding_*` screens:

1. **Forced password change** (`/welcome/set-password`): shown instead of the
   normal dashboard whenever `user.mustChangePassword` is true. Same
   `/auth/change-password` endpoint as Settings. On success the frontend
   marks the tour "pending" (client-side only right now, see below) and
   redirects to the user's portal home.
2. **Guided tour** (`src/components/onboarding/onboarding-tour.tsx`):
   auto-starts once, right after that first password change, on whichever
   portal home the user lands on. Five steps, portal-agnostic \u2014 it
   spotlights the sidebar, topbar, and main content area, which every portal
   has, so it's the same real tour for every role, not just Founder. Users
   can also replay it anytime from Settings.

**Not yet backed by an endpoint** \u2014 tour/dismissal state currently lives in
`localStorage` only (`src/lib/onboarding.ts`). If you want it to persist
across devices, add:

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/auth/me` | \u2014 | Add `onboardingCompletedAt: string \| null` to the response. |
| POST | `/auth/onboarding-complete` | \u2014 | Called when the tour finishes or is skipped. |

## 5. SOS (`/api/dashboard/sos`)

| Method | Path | Notes |
|---|---|---|
| GET | `/sos/events` | Returns `SosEvent[]`. Polled every 30s and on the `dashboard:sos` socket event. |
| GET | `/sos/log` | Returns `SosLogEntry[]`. |
| PATCH | `/sos/events/:id/status` | `{ status: "PENDING"\u2007|\u2007"ACTIVE"\u2007|\u2007"RESOLVED"\u2007|\u2007"FALSE_ALARM" }` |

Socket room `dashboard:sos`. Live map: `src/components/sos/incident-map.tsx`,
lazy-loaded Mapbox GL. Needs a **public** token (`pk.\u2026`) as
`NEXT_PUBLIC_MAPBOX_TOKEN` \u2014 separate from the secret token (`sk.\u2026`) you
gave the backend, which is for server-side reverse geocoding. Get a public
token at https://account.mapbox.com/access-tokens/.

## 6. Helpdesk (`/api/dashboard/helpdesk`)

| Method | Path | Notes |
|---|---|---|
| GET | `/helpdesk/tickets` | Returns `HelpdeskTicket[]`. |
| GET | `/helpdesk/agents` | Returns `HelpdeskAgent[]`. |
| PATCH | `/helpdesk/tickets/:id/status` | `{ status }` |
| PATCH | `/helpdesk/tickets/:id/assign` | `{ agentId }` |

Socket room `dashboard:tickets`.

## 7. Customer Support (`/api/dashboard/support`)

| Method | Path | Notes |
|---|---|---|
| GET | `/support/enquiries` | Returns `SupportEnquiry[]`. |
| GET | `/support/enquiries/:id/replies` | Returns `EnquiryReply[]`. |
| POST | `/support/enquiries/:id/replies` | `{ body }` |
| PATCH | `/support/enquiries/:id/status` | `{ status }` |

## 8. Analytics (`/api/dashboard/analytics`)

| Method | Path | Notes |
|---|---|---|
| GET | `/analytics/marketing?range=30d` | **New**, not in the original audit. Returns `MarketingSnapshot`. Source from **www.havenly.solutions**'s actual analytics (GA4, Plausible, or your own pipeline) \u2014 confirmed production URL, already set as `NEXT_PUBLIC_MARKETING_SITE_URL`. |
| GET | `/analytics/app?range=30d` | Returns `AppAnalyticsSnapshot`. The audit's `GET /system`, reshaped. |
| GET | `/analytics/finance` | Returns `FinanceSnapshot`. Matches the audit's `GET /finance`. |

## 9. Security Suite (`/api/dashboard/security`) \u2014 Founder + Developer only by default

| Method | Path | Notes |
|---|---|---|
| GET | `/security/campaigns` | Returns `SecurityCampaign[]` (GoPhish). |
| GET | `/security/training` | Not yet wired to a hook \u2014 static placeholder list in `security/training/page.tsx`. |
| GET | `/security/leaderboard` | Returns `LeaderboardEntry[]` (CTFd). |
| GET | `/security/breach-logs` | Returns `BreachLogEntry[]`. |

## 10. Subscription Management & Billing

Two distinct screens, don't conflate them:

**Subscription Management** (`/subscription-management`, Founder + Co-Founder)
manages *your customers'* subscriptions \u2014 the orgs paying Havenly:

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/billing/subscriptions` | \u2014 | Returns `OrgSubscription[]`. |
| PATCH | `/billing/subscriptions/:id` | `{ tier }` | `STARTER\u2007|\u2007BRONZE\u2007|\u2007SILVER\u2007|\u2007GOLD\u2007|\u2007ENTERPRISE` |
| PATCH | `/billing/subscriptions/:id/status` | `{ status }` | `PAID\u2007|\u2007PENDING\u2007|\u2007OVERDUE` |

**Billing** (`/billing`, self-service) is Havenly's *own* payment method for
being billed:

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/billing/payment-methods` | \u2014 | Returns `PaymentMethod[]`. |
| POST | `/billing/payment-methods` | `{ paymentMethodToken }` | **Frontend never sends a raw card number.** A provider SDK tokenizes client-side (Stripe Elements, Paystack Inline, Yoco's SDK) and only the resulting token reaches this endpoint. |
| DELETE | `/billing/payment-methods/:id` | \u2014 | |
| GET | `/billing/invoices` | \u2014 | Returns `InvoiceRecord[]`. |

**Provider note:** you mentioned Stripe but said it doesn't have to be Stripe
specifically. As a pre-revenue SA startup, worth comparing before
committing: Stripe now supports South African billing directly; **Yoco** and
**Peach Payments** are SA-built with strong local card support; **Paystack**
covers pan-African expansion if that's on the roadmap. The screen and the
`paymentMethodToken` contract above work with any of them \u2014 whichever you
pick just needs its hosted card element wired into the "Add card" form in
`src/app/(dashboard)/billing/page.tsx`.

## 11. Partners & Comms

| Method | Path | Notes |
|---|---|---|
| GET | `/partners` | Returns `Partner[]`. |
| GET | `/partners/me` | **Not yet called.** Partners Portal currently previews the first `/partners` record as "your org" \u2014 swap for an org-scoped `/partners/me` once JWTs carry `organizationId` for NGO_PARTNER users. |
| GET | `/comms/messages` | Returns `CommsMessage[]`. Email + in-app only, no WhatsApp. |
| POST | `/comms/messages` | `{ channel, toEmail, subject?, body }` |

Socket room `dashboard:comms`.

## 12. What's genuinely done vs. still missing

**Fully built and wireable today:** auth incl. invite/reset/first-login,
role simulation + Access Control Matrix, all 7 exclusive portal homes
(Founder/Executive/Manager/PA/Developer/Partners/Investor), the onboarding
tour, Live SOS Command with the Mapbox map, Marketing Analytics, App &
System Analytics, Helpdesk, Customer Support, Team & Approvals, Security
Suite (training tab still static), Finance Hub, Subscription Management,
Billing, Partners, Comms Hub, Settings.

**Not built yet** \u2014 flagged so nothing is silently missing, same design
system and hook pattern as everything else once you're ready for these:
Missing Persons case management, Employee attendance/leave calendar,
Biometric verification, Media Vault, Org/NGO onboarding wizard, Regional
coordinator view.

## 13. RBAC \u2014 where the real boundary is

`src/lib/rbac.ts` (defaults) + `src/lib/permissions.ts` (grants) filter
navigation and block client-side routing. **This is a UX convenience, not
your security boundary.** havenly-backend must independently enforce the
same resolution on every route \u2014 a PA token hitting `/admin/team/invite`
should 403 regardless of what the dashboard would have shown them. This
matters even more now: only a genuine FOUNDER-role JWT should ever be
allowed to call `/admin/test-mode/switch-role` or any `/access-control/*`
write route.

## 14. Environment variables

```
NEXT_PUBLIC_API_URL=https://api.havenly.io
NEXT_PUBLIC_SOCKET_URL=https://api.havenly.io
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_MARKETING_SITE_URL=https://www.havenly.solutions
NEXT_PUBLIC_MAPBOX_TOKEN=pk.\u2026
```

## 15. Quick start

```bash
npm install
npm run dev        # http://localhost:3000, demo mode on by default
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

Verified clean in the environment this was produced in: 36 routes compile,
static generation succeeds, zero type errors, zero lint warnings. The only
thing that differs in a network-restricted sandbox vs. your machine/host is
`next/font/google` fetching Inter at build time \u2014 needs normal internet
access, which Vercel/any real host has.
