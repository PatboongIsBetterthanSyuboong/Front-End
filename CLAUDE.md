# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses Yarn Berry (v4). Do not use npm.

```bash
# Install dependencies
yarn install

# Development server (http://localhost:3000)
yarn dev

# Production build
yarn build

# Lint
yarn lint
```

## Environment Variables

Create `.env.local` with:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_EMPLOYEE_ID=1
NEXT_PUBLIC_DEFAULT_DEPT_ID=1
```

## Architecture Overview

This is a **medical clinic management system** (병원 진료 관리) built with Next.js 15 (App Router) and React 19.

### Key Domain Concepts

- **환자접수 (Patient Reception)**: Receptionists/nurses register patients, add them to the waiting list
- **진료실 (Clinic Room)**: Doctors record diagnoses (상병, disease codes) and prescriptions (진단, medications)
- **History**: Each clinic visit creates a `History` record that links the patient, employee, diseases, and diagnoses

### Role-Based Access

Roles are defined in [src/types/user.ts](src/types/user.ts): `DEFAULT`, `SUPER_USER`, `DOCTOR`, `NURSE`, `RECEPTIONIST`.

- `환자접수` menu: `SUPER_USER`, `RECEPTIONIST`, `NURSE`
- `진료실` menu: `SUPER_USER`, `DOCTOR`

Role is fetched at runtime via `GET /api/patients/get_role` and gates menu access in the dashboard.

### Routing

The app uses Next.js route groups:
- `(auth)/login`, `(auth)/signup`, `(auth)/super` — auth pages
- `(dashboard)/dashboard` — the main application page

Middleware (`src/middleware.ts`) redirects `/` → `/dashboard` (authenticated) or `/login` (unauthenticated), using the `access_token` cookie.

### Auth Token Flow

Tokens are stored in `localStorage` and synced as a cookie for middleware. The flow:
1. `login()` in `src/services/auth.ts` calls the backend, then calls `setAccessToken`/`setRefreshToken` from `src/lib/auth/token.ts`
2. `setAccessToken` writes to `localStorage` **and** sets a non-HttpOnly cookie (`access_token`) for middleware reads
3. `ClientProviders.tsx` (mounted in the root layout) registers `getAccessToken` as the axios auth token getter via `setAuthTokenGetter`
4. All subsequent API requests automatically get `Authorization: Bearer <token>`

### HTTP Client (`@services`)

Axios-based wrapper in `src/services/http/`. Import from `@services`:

```ts
import { get, post, put, del, HttpError } from "@services";
```

All HTTP errors are normalized to `HttpError` with `.status`, `.message`, `.data`. Add new API endpoint functions under `src/services/api/` or alongside existing service files (`auth.ts`, `history.ts`, `super.ts`).

### State Management

No Redux/Zustand. Uses React Context for in-session state:
- `MedicalSelectionProvider` (`src/store/medicalSelection.tsx`): tracks selected diseases and diagnoses within a clinic visit — only mounted for the `진료실` view

### Path Aliases

All `src/` subdirectories have aliases in `tsconfig.json`:

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@services/*` | `src/services/*` |
| `@store/*` | `src/store/*` |
| `@lib/*` | `src/lib/*` |
| `@hooks/*` | `src/hooks/*` |
| `@features/*` | `src/features/*` |
| `@types/*` | `src/types/*` |
| `@utils/*` | `src/utils/*` |

### Backend API

The backend runs at `http://localhost:8080` (hardcoded in some places) or configured via `NEXT_PUBLIC_API_BASE_URL`. Some components still use raw `fetch` with the hardcoded URL — new code should use the `@services` HTTP client instead.

Key API routes used:
- `POST /api/user/login` / `POST /api/user/logout` / `POST /api/user/register`
- `GET /api/patients/get_role`
- `POST /api/patients/get_patient_id`
- `POST /api/waiting/register`
- `POST /api/histories/write_history`
- `GET /api/histories/search_history/:employeeId`
- `PUT /api/histories/:id/set_diseases` / `set_diagnoses`
