# Implementation Plan - Cleanup and Ecosystem Stabilization

This plan addresses several critical issues in the Havenly Dashboard and Marketing sites: visibility of text/buttons, removal of all mock/demo data, responsiveness, fixing 404 errors, and updating the marketing logo.

## User Review Required

- **Backend Endpoints**: I will be adding several "stubs" or basic real-data implementations for missing analytics and partner endpoints in the backend to stop the dashboard from 404ing.
- **Mock Data Removal**: I will delete `mock-data.ts`. This means if the backend is down, the dashboard will show empty states instead of fake graphs.

## Proposed Changes

### 1. Dashboard UI Visibility & Buttons
- **[button.tsx](file:///home/BigBossOffice/Documents/havenly-dashboard/src/components/ui/button.tsx)**: Audit and ensure all button variants use `on-*` theme variables for text.
- **[login/page.tsx](file:///home/BigBossOffice/Documents/havenly-dashboard/src/app/(auth)/login/page.tsx)**: Remove hardcoded `text-white` from buttons.
- **[StatCard](file:///home/BigBossOffice/Documents/havenly-dashboard/src/components/ui/stat-card.tsx)**: Ensure text labels use `text-on-surface-variant` for consistent visibility.

### 2. Mock Data Removal (Strict)
- **[.env.local](file:///home/BigBossOffice/Documents/havenly-dashboard/.env.local)**: Set `NEXT_PUBLIC_DEMO_MODE=false`.
- **[api-client.ts](file:///home/BigBossOffice/Documents/havenly-dashboard/src/lib/api-client.ts)**: Double-check `DEMO_MODE` logic.
- **Hooks Audit**: Refactor all hooks in `src/hooks/` to remove `apiRequestWithFallback` usages pointing to `mock-data.ts`.
- **[DELETE] [mock-data.ts](file:///home/BigBossOffice/Documents/havenly-dashboard/src/lib/mock-data.ts)**: Permanent removal.

### 3. Backend Fixes (Resolve 404s)
- **[NEW] [finance.routes.ts](file:///home/BigBossOffice/Documents/havenly-backend/src/dashboard/routes/finance.routes.ts)**: Create routes for `/billing/subscriptions`.
- **[analytics.controller.ts](file:///home/BigBossOffice/Documents/havenly-backend/src/dashboard/controllers/analytics.controller.ts)**: Add `getFinanceAnalytics` endpoint.
- **[ngo.controller.ts](file:///home/BigBossOffice/Documents/havenly-backend/src/dashboard/controllers/ngo.controller.ts)**: Add `getMe` endpoint or similar to resolve `/partners/me`.

### 4. Marketing Site Logo
- **[icon.png](file:///home/BigBossOffice/Documents/havenly-marketing/src/app/icon.png)**: Use `logo.png` as the main app icon.
- **[layout.tsx](file:///home/BigBossOffice/Documents/havenly-marketing/src/app/layout.tsx)**: Update metadata logo reference.
- **[manifest.ts](file:///home/BigBossOffice/Documents/havenly-marketing/src/app/manifest.ts)**: Update icon source.

---

## Verification Plan

### Automated Tests
- `npm run test` in backend (if tests exist).
- `npx tsc --noEmit` in both dashboard and backend.
- API Endpoint Verification: Run a script to `curl` all critical dashboard endpoints and ensure they return 200/401/403, never 404.

### Manual Verification
- Toggle Dark Mode: Verify every button and text is readable.
- Mobile View: Check sidebar and dashboard tiles wrap correctly.
- Real Data Check: Log in and verify charts are either real or empty (never mock).
