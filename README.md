# HAVENLY SOLUTIONS — Guardian Command Centre

> **The Black Sheep Tech Corp LTD (PTY)**  
> Internal dashboard for team onboarding, pre-launch data, safety monitoring, and partner management.  
> Version: `1.0.0` · Launch: `24 November 2026`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [User Roles & Portal Access](#3-user-roles--portal-access)
4. [All Routes & Portals](#4-all-routes--portals)
5. [API Endpoints](#5-api-endpoints)
6. [Database Schema](#6-database-schema)
7. [Environment Variables](#7-environment-variables)
8. [Local Development Setup](#8-local-development-setup)
9. [Database Setup & Seeding](#9-database-setup--seeding)
10. [Deployment — Vercel + GitHub](#10-deployment--vercel--github)
11. [Adding Team Members (Founder Guide)](#11-adding-team-members-founder-guide)
12. [Folder Structure](#12-folder-structure)
13. [Role Permission Matrix](#13-role-permission-matrix)
14. [Build Roadmap](#14-build-roadmap)

---

## 1. Project Overview

The Havenly Solutions Command Centre is the internal management dashboard for the Havenly Solutions mobile application.  
It connects to the same PostgreSQL database as the public pre-registration site and the mobile app backend.

**Primary functions:**
- Founder-controlled team management and access provisioning
- Real-time SOS alert and incident monitoring
- Pre-registration data from the July 2026 national tour
- NGO/partner application intake and approval
- Mesh network node topology monitoring
- Cryptographic audit logs (legal evidence chain)
- Investor-facing analytics and growth metrics

---

## 2. Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components + API routes |
| Styling | Tailwind CSS | Custom Havenly Solutions design tokens |
| Auth | NextAuth.js v4 + JWT | Credentials provider, role-based |
| Database | PostgreSQL (Neon/Supabase/AWS RDS) | ACID compliance for audit trail |
| ORM | Prisma v5 | Type-safe queries + migrations |
| Charts | Recharts | Analytics + trajectory charts |
| Icons | Lucide React | Consistent icon system |
| Email | Resend | Transactional notifications |
| Storage | AWS S3 + KMS | Evidence vault (mobile app) |
| SMS/Voice | Twilio | SOS dispatch |
| Hosting | Vercel | Auto-deploy from GitHub main |
| Region | `jnb1` (Johannesburg) | Lowest latency for SA |

---

## 3. User Roles & Portal Access

The Founder is the **only** person who can create accounts and assign roles.  
All role changes are logged in the cryptographic audit trail.

### Role Definitions

| Role | Label | Description |
|---|---|---|
| `FOUNDER` | Founder & CEO | Full access to all portals. Only role that can invite users, change roles, suspend accounts. |
| `PA` | Personal Assistant | Manages pre-registration data, handles tour signups and scheduling communications. |
| `MANAGER` | Operations Manager | Full operational oversight — live feed, incidents, pre-regs, analytics, NGO portal. |
| `DEVELOPER` | Lead Developer | Technical portals — live feed, SOS, mesh topology, safety logs, resource centre. |
| `INVESTOR` | Investor / Partner | Read-only access to analytics, pre-registrations and investor materials. |
| `NGO_PARTNER` | NGO Partner | NGO portal for partner onboarding, case tools, and resource access. |

---

## 4. All Routes & Portals

### Public Routes (No Auth Required)
| Route | Description |
|---|---|
| `/login` | Secure login portal — email + password |

### Protected Dashboard Routes (Auth Required)

#### `/dashboard` — Live Feed (Guardian Command Centre)
**Access:** `FOUNDER`, `MANAGER`, `DEVELOPER`

The main operational hub. Shows:
- Real-time GSM/Satellite/NGO/SAPS status tiles
- Live incident feed with severity classification
- Engagement depth widget (pre-registration count, NGO partners)
- Pre-launch registration trajectory bar chart
- Tactical controls (broadcast alert, export evidence chain, review NGO credentials)
- System audit log preview (last 3 entries)

Auto-refreshes every 30 seconds via polling.

---

#### `/dashboard/sos-alerts` — SOS Alerts
**Access:** `FOUNDER`, `MANAGER`, `DEVELOPER`

Real-time SOS and incident monitoring.
- Filter by: ALL / ACTIVE / CRITICAL / WARNING / ADVISORY
- Summary stats: Total, Active, Critical, Resolved
- Each incident shows: severity badge, status, description, location, GPS coordinates
- Auto-refreshes every 15 seconds

---

#### `/dashboard/mesh-topology` — Mesh Network Topology
**Access:** `FOUNDER`, `DEVELOPER`

Guardian mesh network infrastructure monitor.
- System health tiles: GSM Health %, Active Nodes, Avg Latency, Uptime
- Topological logs table: Node ID, event type, status, hop count, throughput
- Click any node to view full detail panel (power status, connections, latency)
- Optimisation suite: Auto-Heal, Balancing, Sync Keys, Power Save
- Auto-refreshes every 30 seconds

---

#### `/dashboard/safety-logs` — Safety Logs
**Access:** `FOUNDER`, `MANAGER`, `DEVELOPER`

Cryptographically verified audit trail for legal evidence chain.
- Stats: Total events, Critical alerts, Hash status, Node uptime
- Filter by: All Events / Critical / System
- Date filter: 24H / 7D / 30D
- Table: Timestamp, Event Category, Description, Initiator, Integrity Hash, Status
- Export Audit (CSV) and Verify Chain actions
- Integrity Policy footer: network latency, storage cluster, last backup
- Pagination (20 per page)

---

#### `/dashboard/ngo-portal` — NGO Partner Portal
**Access:** `FOUNDER`, `MANAGER`, `NGO_PARTNER`

Institutional alliance management.
- Stats: Total partners, Approved, Pending, Active regions
- Partner application table with inline status management
- Status workflow: Pending → Approved / Rejected / Suspended
- New Application modal with full form:
  - Organisation name, liaison, type, email, reg number, region, mission statement
- All status changes are role-gated (FOUNDER + MANAGER only)

---

#### `/dashboard/pre-registrations` — Pre-Registrations
**Access:** `FOUNDER`, `PA`, `MANAGER`, `INVESTOR`

Tour and website pre-registration data hub.
- Tour target progress bar (goal: 5,000 by end of July 2026)
- Registrations by region bar chart
- Geographic distribution pie chart
- Full searchable, filterable table with region selector
- Export to CSV (downloads immediately in browser)
- Pagination (20 per page)

---

#### `/dashboard/analytics` — Analytics
**Access:** `FOUNDER`, `MANAGER`, `INVESTOR`, `PA`

Growth and engagement intelligence.
- KPI cards: Pre-Registrations, Active Incidents, NGO Partners, Team Members
- July Tour target progress bar with percentage
- Registration trajectory vs target grouped bar chart
- Geographic distribution pie chart (top 5 regions)
- Investor Snapshot panel: Pro tier price, break-even users, LTV, Year 2 ARR target

---

#### `/dashboard/team` — Team Management
**Access:** `FOUNDER` only

The Founder's complete control panel for all team access.
- Role summary tiles (count per role)
- Portal access reference card (what each role can see)
- Full team table with:
  - Name, email, role badge, department, last login, status
  - Inline status change (Active / Suspended / Pending)
  - Delete member button
- Add Team Member modal:
  - Name, email, department, temporary password, role selector
  - Logs creation in audit trail automatically
- **IMPORTANT:** Suspending a user blocks their next login. Deleting removes them permanently.

---

#### Portal Switcher — Founder Role Preview
**Access:** `FOUNDER` only (in Sidebar)

The Founder can preview the dashboard as any role without changing their actual account.
- Click the dropdown in the Sidebar showing the current role
- Select a different role to temporarily switch the UI
- The switch persists across navigation but resets when the browser tab closes
- **Important:** This only changes what the UI renders. Backend RBAC still enforces real permissions — the Founder cannot access resources beyond what the previewed role can see in production
- A "PREVIEW" badge appears in the Portal Switcher when viewing a non-Founder role
- Useful for testing role-specific features and understanding what each team member sees

---

#### `/dashboard/resource-centre` — Resource Centre
**Access:** ALL roles

Knowledge base for all team members and partners.
- Featured emergency protocol article
- Platform updates list
- Training status progress bar
- 6 technical categories: Hardware Ops, Chief Training, SOP Frameworks, Comms Linkage, Cyber Defense, Civic Liaison
- Support ticket CTA

---

#### `/dashboard/settings` — Settings
**Access:** ALL roles (own account only)

Personal account settings.
- Display name edit
- Email (read-only — contact Founder to change)
- Role display (read-only — contact Founder to change)
- System build info

---

## 5. API Endpoints

All endpoints require authentication unless marked `PUBLIC`.

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signin` | PUBLIC | NextAuth sign-in |
| `POST` | `/api/auth/signout` | Any | Sign out |
| `GET` | `/api/auth/session` | Any | Get session |

### Users
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | FOUNDER, MANAGER | List all users |
| `POST` | `/api/users` | FOUNDER | Create new user (invite) |
| `PATCH` | `/api/users/[id]` | FOUNDER | Update user role/status |
| `DELETE` | `/api/users/[id]` | FOUNDER | Remove user |

### Incidents
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/incidents` | Any auth | List all incidents |
| `POST` | `/api/incidents` | Any auth | Create incident |

### Pre-Registrations
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/pre-registrations` | Any auth | List with pagination + region filter |
| `POST` | `/api/pre-registrations` | PUBLIC | Submit pre-registration (from website) |

### NGO Partners
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/ngo-partners` | FOUNDER, MANAGER, NGO_PARTNER | List partners |
| `POST` | `/api/ngo-partners` | PUBLIC | Submit partner application (from website) |
| `PATCH` | `/api/ngo-partners/[id]` | FOUNDER, MANAGER | Update partner status |

### Audit Logs
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/audit-logs` | Any auth | List logs with filter + pagination |

### Mesh Nodes
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/mesh-nodes` | Any auth | List all mesh nodes |

### Analytics
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics` | Any auth | Aggregated stats for dashboard |

---

## 6. Database Schema

```
User             — team members, roles, login tracking
Session          — NextAuth session storage
PreRegistration  — tour/website pre-launch signups
Incident         — SOS events and community alerts
AuditLog         — immutable cryptographic event trail
NGOPartner       — institutional partner applications
MeshNode         — guardian mesh network node data
SystemMetric     — periodic system health snapshots
```

Full schema: `prisma/schema.prisma`

---

## 7. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.

```bash
cp .env.example .env.local
```

**Critical variables (app will not start without these):**
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Min 32 chars (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL` — Your app URL (`http://localhost:3000` for dev)

**For production add:**
- `FOUNDER_EMAIL` + `FOUNDER_PASSWORD` + `FOUNDER_NAME` — used once for seed
- All AWS, Twilio, Firebase, Resend keys

**Never commit `.env.local` to GitHub.** The `.gitignore` already excludes it.

---

## 8. Local Development Setup

### Prerequisites
- Node.js 18 LTS or higher
- PostgreSQL database (local or cloud — [Neon](https://neon.tech) recommended for free tier)
- npm or yarn

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-org/havenly-dashboard.git
cd havenly-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Generate Prisma client
npm run db:generate

# 5. Push schema to database
npm run db:push

# 6. Seed the database (creates Founder account + sample data)
npm run db:seed

# 7. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Login with the `FOUNDER_EMAIL` and `FOUNDER_PASSWORD` you set in `.env.local`.  
**Change the Founder password immediately after first login.**

---

## 9. Database Setup & Seeding

### Seed creates:
- 1 Founder account (from env vars)
- 50 sample pre-registrations across SA regions
- 3 sample incidents (Critical, Warning, Advisory)
- 3 mesh nodes (SAND-041, ROSE-112, SOW-MAIN)
- 3 audit log entries

```bash
# Run seed
npm run db:seed

# View database in browser
npm run db:studio

# Create migration (production)
npm run db:migrate -- --name init
```

### Resetting the database (dev only):
```bash
npx prisma migrate reset
npm run db:seed
```

---

## 10. Deployment — Vercel + GitHub

### GitHub Setup

```bash
# In project root
git init
git add .
git commit -m "feat: initial Havenly Solutions Command Centre build"

# Create repo on GitHub (private), then:
git remote add origin https://github.com/your-org/havenly-dashboard.git
git branch -M main
git push -u origin main
```

**Branch strategy:**
- `main` — production (auto-deploys to Vercel)
- `dev` — development integration branch
- `feature/*` — individual feature branches

### Vercel Setup

1. Go to [vercel.com](https://vercel.com) → Import Project → Select `havenly-dashboard`
2. Set Root Directory: `./` (leave default)
3. Add all environment variables from `.env.example` in Vercel dashboard under **Settings → Environment Variables**
4. Add `NEXTAUTH_URL` as your production URL: `https://dashboard.havenly.co.za`
5. Deploy

**Custom domain:** Add `dashboard.havenly.co.za` in Vercel → Domains, then set the DNS CNAME at your domain registrar.

**Region:** Set to `jnb1` (Johannesburg) in `vercel.json` for lowest latency.

### Auto-deploy workflow:
- Every push to `main` → automatic Vercel production deploy
- Every push to `dev` → Vercel preview URL

---

## 11. Adding Team Members (Founder Guide)

> Only the account with role `FOUNDER` can add team members.

1. Log in to the Command Centre
2. Navigate to **Team Management** in the sidebar
3. Click **Add Team Member** (top right)
4. Fill in:
   - **Full Name** — their display name
   - **Email** — their login email
   - **Department** — e.g. Operations, Tech, Marketing, Finance
   - **Temporary Password** — they must change this after first login (min 8 chars)
   - **Role** — selects their portal access level (see Role table above)
5. Click **Add Member**

The member can now log in at `https://dashboard.havenly.co.za/login`.

### Changing a role:
Currently done via the team table status dropdown. For role changes, use the Prisma Studio (`npm run db:studio`) or add a role-edit UI in a future sprint.

### Suspending access:
- Set status to **Suspended** in the team table
- The user's existing session expires at next request
- They cannot log in until status is set back to **Active**

---

## 12. Folder Structure

```
havenly-dashboard/
 .env.example                    # Environment variable template
 .gitignore                      # Git ignore rules
 README.md                       # This file
 vercel.json                     # Vercel deployment config
 next.config.js                  # Next.js configuration
 tailwind.config.js              # Tailwind + Havenly Solutions design tokens
 tsconfig.json                   # TypeScript config
 package.json                    # Dependencies and scripts

 prisma/
    schema.prisma               # Full database schema (all models)
    seed.ts                     # Database seed (Founder + sample data)

 src/
     app/
        layout.tsx              # Root layout (fonts, providers)
        page.tsx                # Root redirect (→ /login or /dashboard)
        globals.css             # Global styles + Havenly Solutions CSS tokens
        providers.tsx           # NextAuth SessionProvider
       
        (auth)/
           login/
               page.tsx        # Login page (email + password)
       
        dashboard/
           layout.tsx          # Dashboard shell (auth guard + sidebar)
           page.tsx            # Live Feed (Guardian Command Centre)
           sos-alerts/page.tsx
           mesh-topology/page.tsx
           safety-logs/page.tsx
           ngo-portal/page.tsx
           pre-registrations/page.tsx
           analytics/page.tsx
           team/page.tsx       # FOUNDER ONLY
           resource-centre/page.tsx
           settings/page.tsx
       
        api/
            auth/[...nextauth]/route.ts
            users/route.ts              # GET list, POST create
            users/[id]/route.ts         # PATCH update, DELETE remove
            incidents/route.ts
            pre-registrations/route.ts
            ngo-partners/route.ts
            ngo-partners/[id]/route.ts
            audit-logs/route.ts
            mesh-nodes/route.ts
            analytics/route.ts
    
     components/
        dashboard/
            Sidebar.tsx         # Left nav (role-filtered links)
            Header.tsx          # Top bar (search, bell, user badge)
    
     lib/
        db.ts                   # Prisma client singleton
        auth.ts                 # NextAuth options + callbacks
        utils.ts                # cn(), formatDate(), hasAccess(), etc.
    
     types/
        index.ts                # All TypeScript types + role constants
        next-auth.d.ts          # NextAuth session type extensions
    
     middleware.ts               # Route protection (role-based redirects)
```

---

## 13. Role Permission Matrix

| Route | FOUNDER | MANAGER | DEVELOPER | PA | INVESTOR | NGO_PARTNER |
|---|---|---|---|---|---|---|
| `/dashboard` (Live Feed) |  |  |  |  |  |  |
| `/dashboard/sos-alerts` |  |  |  |  |  |  |
| `/dashboard/mesh-topology` |  |  |  |  |  |  |
| `/dashboard/safety-logs` |  |  |  |  |  |  |
| `/dashboard/ngo-portal` |  |  |  |  |  |  |
| `/dashboard/pre-registrations` |  |  |  |  |  |  |
| `/dashboard/analytics` |  |  |  |  |  |  |
| `/dashboard/team` |  |  |  |  |  |  |
| `/dashboard/resource-centre` |  |  |  |  |  |  |
| `/dashboard/settings` |  |  |  |  |  |  |

Middleware enforces these rules at the Edge — unauthorized routes redirect to the user's first allowed portal.

---

## 14. Build Roadmap

### Phase 1 — Done (this build)
- [x] Authentication (NextAuth + JWT)
- [x] Role-based access control (6 roles)
- [x] All 10 dashboard portals
- [x] Founder team management
- [x] Pre-registration data intake + export
- [x] NGO partner application management
- [x] Safety logs with hash verification
- [x] Mesh topology monitoring
- [x] Analytics + investor snapshot
- [x] Full REST API layer
- [x] Prisma schema + seed
- [x] Vercel + GitHub ready

### Phase 2 — Next Sprint
- [ ] Real-time updates via Socket.io (replace polling)
- [ ] Mapbox map integration (Live Feed + Mesh Topology)
- [ ] Email notifications via Resend (new SOS, partner application)
- [ ] Mobile app data pipeline integration
- [ ] Password change flow (Settings page)
- [ ] Activity feed per user
- [ ] Dark mode toggle

### Phase 3 — Post-Launch
- [ ] Investor report PDF export
- [ ] SAPS API integration layer
- [ ] Advanced audit log search + export
- [ ] WhatsApp webhook for tour registrations
- [ ] Multi-language support (isiZulu, Afrikaans, Xhosa)

---

## Confidentiality

This repository is **private and confidential**.  
Property of The Black Sheep Tech Corp LTD (PTY).  
All contributors must sign an NDA and IP Assignment Agreement before access is granted.

*Havenly Solutions — Your Haven. Your Community. Always On.*
