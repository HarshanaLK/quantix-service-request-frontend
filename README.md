# Quantix Service Desk — Next.js Frontend

A **separate Next.js (App Router), TypeScript, Tailwind CSS** frontend for the Laravel API in `quantix-service-request-api-master(1).zip`. This project does **not** contain or modify your Laravel code, and it does **not** use Inertia.js.

## Requirements

- Node.js 20.9+ (Node.js 22 LTS recommended) and npm
- Laravel backend running at `http://127.0.0.1:8000`, with **MySQL** configured and seeded
- Both applications run in separate terminal windows

## Run on Windows (PowerShell)

**Terminal 1 — Laravel API**, from the separate Laravel backend folder containing `artisan`:

```powershell
# Complete the Laravel project's README first: composer install, .env,
# MySQL database creation, php artisan key:generate and migrate --seed.
php artisan serve
```

Check: http://127.0.0.1:8000/up

**Terminal 2 — Next.js frontend**, from this frontend folder containing `package.json`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open **http://localhost:3000**. If Laravel runs on a different port or host, update `LARAVEL_API_URL` in `.env.local` (include `/api`) and restart the Next.js dev server.

For macOS/Linux, replace the copy command with `cp .env.example .env.local`.

## Demo logins

Use the accounts created by the backend's `php artisan migrate --seed`:

| Role | Email | Password |
|------|-------|----------|
| Employee | `alex@example.com` | `Password123!` |
| Employee | `sam@example.com` | `Password123!` |
| Manager | `manager@example.com` | `Password123!` |
| Operations | `operations@example.com` | `Password123!` |

**Demo accounts only:** change/remove default credentials before exposing a deployment to the internet.

## Features mapped to the real Laravel API

| UI feature | Laravel route(s) | Authorized user |
|------------|------------------|-----------------|
| Sign in, current profile, sign out | `POST /api/login`, `GET /api/me`, `POST /api/logout` | All |
| Dashboard counts and recent requests | `GET /api/requests` (pagination metadata) | All, backend scoped |
| List with search, status, sort, direction, page size, pagination | `GET /api/requests` | All, backend scoped |
| Create draft or create + submit | `POST /api/requests` with `submit` flag | Employee |
| View one request, edit draft/returned | `GET /api/requests/{id}`, `PUT /api/requests/{id}` | Permitted users / owner |
| Submit / resubmit | `POST /api/requests/{id}/submit` | Owner, draft/returned |
| Approve, reject, return with mandatory comment | `POST /api/requests/{id}/decision` | Reporting manager, pending |
| Assign an operations user | `POST /api/requests/{id}/assign` | Operations, approved |
| Start / complete | `POST /api/requests/{id}/status` | Operations, assigned/in_progress |
| Add comments, display comment history | `POST /api/requests/{id}/comments`, request details | Permitted participants except terminal |
| Show *paginated* audit history | `GET /api/requests/{id}/activity` | Permitted participants |

The workflow is **draft → pending → approved → assigned → in_progress → completed**, with alternatives **pending → returned → pending** and **pending → rejected**. Rejected and completed requests are terminal.

### Important backend limitations (not invented by the frontend)

- **No users-list endpoint:** The assignment screen supports **Assign to me** (using the logged-in operations account ID) or manually entering another valid operations user ID. In the provided seed data, operations user ID is `2`. The backend validates that the chosen user has the `operations` role.
- **No notifications-reading endpoint:** Laravel dispatches queued mail/database notifications, but there is no route to list or mark notifications read. Therefore no fake notification bell/inbox is presented.
- **No account creation, password-reset, file-upload, deletion, or profile-update endpoints:** Those workflows are not fabricated in the frontend.
- Dashboard totals are **accurate server-side pagination totals** for the current user's permitted requests, not calculated from only the first page. This uses 9 small read requests (all + 8 statuses) on dashboard load.
- Authorization and workflow validation **remain enforced by Laravel**; hiding a button is only a UX convenience.

## Architecture

```text
quantix-service-request-frontend/
├── app/
│   ├── (auth)/login/page.tsx           # Public login UI
│   ├── (workspace)/layout.tsx          # Authenticated layout
│   ├── (workspace)/dashboard/page.tsx  # Role-scoped overview
│   ├── (workspace)/requests/page.tsx   # Search/filter/paginate
│   ├── (workspace)/requests/new/page.tsx
│   ├── (workspace)/requests/[id]/page.tsx
│   ├── (workspace)/requests/[id]/edit/page.tsx
│   ├── api/session/{login,logout,me}/route.ts
│   └── api/backend/[...path]/route.ts   # Authorized API proxy
├── components/                          # Shared UI and forms
├── lib/api.ts                           # Typed frontend API client
├── lib/backend.ts                       # Laravel fetch and cookie helpers
├── lib/config.ts                        # Labels and formatting
├── lib/types.ts                         # Types matching Laravel Resources
├── .env.example
└── package.json
```

## Authentication and CORS

The Next.js server talks to the Laravel API using `LARAVEL_API_URL`. After `/api/login` succeeds, the Laravel Sanctum **bearer token** is held in an **HttpOnly, SameSite=Lax** session cookie on the Next.js origin (8-hour browser cookie lifetime). Browser JavaScript never reads or stores that token in localStorage. The proxy adds `Authorization: Bearer ...` when forwarding requests. This means you do **not** need to modify Laravel CORS for ordinary same-origin Next.js browsing. Logout revokes the current Laravel token when reachable and always clears the browser cookie.

**Production:** deploy the Next.js app behind HTTPS, configure server-side `LARAVEL_API_URL` to a reachable HTTPS/backend address, and set appropriate application security policies and rate limits. The frontend does not replace the backend's authorization. Use secure cookie / reverse proxy settings and review CSRF protections before a public rollout.

## Verification

```powershell
npm run typecheck
npm run build
npm run start
```

To test the full end-to-end workflow, run Laravel with MySQL and seeded demo users, then:

1. Sign in as Alex → create a request with **Create & submit**.
2. Sign out and sign in as Maya Manager → open **Pending review** → **Approve** with a comment.
3. Sign out and sign in as Oliver Operations → open **Approved** → **Assign to me** → **Assign request**.
4. Open the assigned request → **Start work** → **Mark completed**.
5. Inspect the activity timeline and comments on the request details screen.

Also test draft editing, returning + resubmitting, rejection, filters, and pagination.
