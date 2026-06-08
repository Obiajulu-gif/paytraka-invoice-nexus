# PayTraka Invoice Nexus

PayTraka is a smart invoicing and billing workspace for Nigerian SMEs. It supports mock login, dashboard metrics, customers, products/services, invoices, receipts, credit/debit notes, reports, and business settings.

This repository has been migrated from React + TypeScript + Vite to a Next.js App Router application. The current app is still frontend/mock-data based; it does not yet include a production backend, database, payment gateway, real PDF generation service, or live FIRS e-invoicing integration.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI | React 18, TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui-style components, Radix UI |
| Charts | Recharts |
| Icons | Lucide React |
| Forms | React Hook Form, Zod |
| Mock state | In-memory services and browser `localStorage` |

Next.js 15 is used because the local environment is running Node.js 18.19.1. Current Next.js 16 releases require a newer Node.js runtime.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start a production build:

```bash
npm run start
```

The app normally starts at:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js will choose the next available port.

## Demo Login

The mock authentication service uses fixed frontend-only credentials:

| Field | Value |
| --- | --- |
| Email | `admin@paytraka.com` |
| Password | `123456` |

Authentication state is stored in `localStorage` under `paytraka_user`.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Redirects to `/dashboard` |
| `/login` | Login |
| `/dashboard` | Dashboard |
| `/customers` | Customers |
| `/products` | Products & Services |
| `/invoices` | Invoices |
| `/receipts` | Receipts |
| `/adjustments` | Credit & Debit Notes |
| `/reports` | Reports |
| `/settings` | Settings |

Protected routes are grouped under the Next.js App Router layout in `src/app/(app)/layout.tsx`. The existing client-side auth guard is preserved and redirects unauthenticated users to `/login`.

## Project Structure

```text
src/
  app/
    layout.tsx              # Root Next.js layout and metadata
    providers.tsx           # Client providers for Query, toasts, tooltips
    globals.css             # Tailwind and app CSS variables
    page.tsx                # Redirects / to /dashboard
    login/page.tsx
    (app)/
      layout.tsx            # Auth-protected app shell
      dashboard/page.tsx
      customers/page.tsx
      products/page.tsx
      invoices/page.tsx
      receipts/page.tsx
      adjustments/page.tsx
      reports/page.tsx
      settings/page.tsx
  components/
    ui/                     # shadcn/ui-style primitives
    AppSidebar.tsx
    Layout.tsx
    NavLink.tsx
    *Dialog.tsx
  screens/                  # Migrated client screens from the old Vite pages
  services/                 # Mock auth/data/settings/report services
  hooks/
  lib/
  utils/
```

## Current Data Behavior

No database setup is required for the current app.

| Data | Current storage |
| --- | --- |
| Authenticated user | Browser `localStorage` key `paytraka_user` |
| Business settings | Browser `localStorage` key `paytraka_settings` |
| Uploaded logo | Base64 data URL inside `paytraka_settings` |
| Customers | In-memory array in `customersService.ts` |
| Products/services | In-memory array in `productsService.ts` |
| Invoices | In-memory array in `invoicesService.ts` |
| Receipts | In-memory array in `receiptsService.ts` |
| Credit/debit notes | In-memory arrays in `adjustmentsService.ts` |
| Reports | Calculated from in-memory invoice data |

Because most records are module-level arrays, business records may reset when the app reloads or restarts. Settings and mock auth persist in the browser.

## Future Production Architecture

A production PayTraka backend should use MySQL as the source of truth and Redis only for supporting infrastructure.

Recommended shape:

| Layer | Responsibility |
| --- | --- |
| Next.js App Router | UI, route layouts, metadata, server actions or route handlers where appropriate |
| API layer | Authenticated invoice, receipt, customer, product, adjustment, and report operations |
| MySQL | Durable source of truth for tenants, users, customers, products, invoices, receipts, adjustments, document numbers, audit logs, and settings |
| Redis | Rate limiting, short-lived cache, idempotency locks, queues, and background job coordination |
| Worker process | Email sending, PDF generation, FIRS submission/retry workflows, report precomputation |
| Object storage | Generated PDFs, uploaded logos, and document attachments |

Key backend requirements before replacing mock state:

- Use tenant-scoped authorization on every read and write.
- Generate invoice, receipt, credit note, and debit note numbers inside database transactions.
- Use row locks or a dedicated numbering table to prevent duplicate document numbers under concurrency.
- Treat receipts, invoice status changes, credit notes, and debit notes as transactional accounting workflows.
- Keep Redis out of the source-of-truth path; cache can be rebuilt from MySQL.
- Add idempotency keys for payment callbacks, receipt creation, PDF generation, and FIRS submission.
- Store immutable audit events for financial documents.
- Add integration tests around document numbering, partial payments, overpayment prevention, receipt deletion, and adjustment totals.

## Environment Variables

The current mock frontend does not require environment variables.

For future browser-exposed values in Next.js, use the `NEXT_PUBLIC_` prefix:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Do not expose secrets with `NEXT_PUBLIC_`.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Runs a production Next.js build |
| `npm run start` | Starts the production Next.js server |
| `npm run lint` | Runs ESLint over the source files |
| `npm run typecheck` | Runs TypeScript without emitting files |

## Verification Notes

The migration was verified with:

- Dependency install from a clean lockfile.
- TypeScript checking.
- Production Next.js build.
- Dev server startup.
- Route smoke checks for `/`, `/login`, `/dashboard`, `/customers`, `/products`, `/invoices`, `/receipts`, `/adjustments`, `/reports`, and `/settings`.

In the WSL 1 shell used during migration, the Windows npm shim intermittently failed with:

```text
WSL 1 is not supported. Please upgrade to WSL 2 or above.
Could not determine Node.js install directory
```

The underlying Next.js build and dev commands were verified through the Windows `.cmd` wrappers from the repository directory.

## Known Limitations

- Authentication is mock-only and stored in browser `localStorage`.
- There is no real backend, database, RBAC, server session, or password hashing.
- Invoice and receipt persistence is not durable.
- PDF generation is currently a placeholder utility.
- FIRS compliance messaging appears in the UI, but live FIRS validation/submission is not implemented.
- No automated test suite is configured yet.

## License

No license file is present in this repository.
