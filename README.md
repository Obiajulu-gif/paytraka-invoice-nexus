# Paytraka Invoice Nexus

Paytraka Invoice Nexus is a React-based invoicing dashboard for creating and managing customers, products/services, invoices, receipts, credit notes, debit notes, business settings, and basic revenue reports for Nigerian SMEs.

The app is presented as a FIRS-compliant invoicing platform in the UI and metadata. In the current codebase, most business data is mocked in the frontend and there is no connected production backend, database, or real PDF generation service.

## What the Project Does

This project provides a browser-based invoicing workspace where a user can:

- Sign in with fixed demo credentials.
- Manage customer records.
- Manage product and service catalog items.
- Create invoices with line items, taxes, discounts, delivery fees, and totals.
- Create receipts linked to unpaid invoices.
- Track invoice status changes after payments.
- Create credit notes and debit notes for invoice adjustments.
- View dashboard and report charts based on invoice data.
- Save business profile, invoice defaults, logo, and tax settings in the browser.
- View invoice, receipt, credit note, and debit note dialogs with QR code imagery and FIRS footer messaging.

## Key Features

- Protected application layout with login/logout flow.
- Responsive sidebar navigation.
- Customer CRUD operations.
- Product/service CRUD operations.
- Invoice creation with calculated subtotal, tax, discount, delivery fee, and total.
- Receipt creation linked to invoices.
- Automatic invoice status update to `paid` when receipts cover the invoice total.
- Credit note and debit note creation.
- Dashboard cards and charts powered by Recharts.
- Reports page with revenue trend, invoice status summary, and top customers.
- Business settings page with logo upload using browser `FileReader`.
- Nigerian Naira currency formatting.
- shadcn/ui component structure with Radix UI primitives and Tailwind CSS.

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime/build tool | Vite |
| UI framework | React 18 |
| Language | TypeScript |
| Routing | React Router DOM |
| Server state utility | TanStack React Query |
| Styling | Tailwind CSS |
| UI components | shadcn/ui-style components, Radix UI primitives |
| Icons | Lucide React |
| Charts | Recharts |
| Forms/utilities | React Hook Form, Zod, date-fns |
| Notifications | Sonner and local toast components |
| Linting | ESLint 9 with TypeScript ESLint |

## Project Structure

```text
.
+-- public/
|   +-- placeholder.svg
|   +-- robots.txt
+-- src/
|   +-- components/
|   |   +-- ui/                    # Reusable UI primitives
|   |   +-- AppSidebar.tsx         # Main sidebar navigation
|   |   +-- Layout.tsx             # Auth-protected app shell
|   |   +-- *Dialog.tsx            # Create/view dialogs for app entities
|   |   +-- NavLink.tsx
|   +-- hooks/                     # Toast and mobile helpers
|   +-- lib/
|   |   +-- utils.ts               # Shared className utility
|   +-- pages/
|   |   +-- Dashboard.tsx
|   |   +-- Customers.tsx
|   |   +-- Products.tsx
|   |   +-- Invoices.tsx
|   |   +-- Receipts.tsx
|   |   +-- Adjustments.tsx
|   |   +-- Reports.tsx
|   |   +-- Settings.tsx
|   |   +-- Login.tsx
|   |   +-- NotFound.tsx
|   +-- services/                  # Mock data/auth/settings/report services
|   +-- utils/
|   |   +-- currency.ts
|   |   +-- pdfGenerator.ts
|   +-- App.tsx                    # App providers and route definitions
|   +-- main.tsx                   # React entry point
|   +-- index.css                  # Tailwind and CSS variables
+-- components.json                # shadcn/ui configuration
+-- eslint.config.js
+-- package.json
+-- tailwind.config.ts
+-- tsconfig*.json
+-- vite.config.ts
```

## Installation and Setup

### Prerequisites

- Node.js 18 or newer is recommended for Vite 5.
- npm, or another package manager compatible with the project.

This repository includes both `package-lock.json` and `bun.lockb`. Because `package-lock.json` is present and the scripts are npm-compatible, the examples below use npm.

### Install Dependencies

```bash
npm install
```

## Environment Variables

No required environment variables were found in the current codebase. There are no references to `import.meta.env`, `process.env`, or `VITE_*` variables in the source files.

If a backend is added later, create a `.env.local` file and expose frontend variables with the `VITE_` prefix, for example:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

This example is not currently used by the application.

## Running Locally

Start the Vite development server:

```bash
npm run dev
```

The Vite config sets the dev server to:

```text
http://localhost:8080
```

If accessing from another device on the same network, Vite is configured with `host: "::"`.

### Demo Login

The current authentication service uses fixed frontend-only credentials:

| Field | Value |
| --- | --- |
| Email | `admin@paytraka.com` |
| Password | `123456` |

Authentication state is saved in `localStorage` under `paytraka_user`.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the production app into `dist/`. |
| `npm run build:dev` | Builds the app using Vite development mode. |
| `npm run lint` | Runs ESLint across the project. |
| `npm run preview` | Serves the built `dist/` output locally for preview. |

## Application Routes

The frontend routes are defined in `src/App.tsx`.

| Route | Page | Description |
| --- | --- | --- |
| `/login` | Login | Public login screen. |
| `/` | Dashboard | Revenue, invoice status, and top customer overview. |
| `/customers` | Customers | Customer listing, search, create, edit, and delete. |
| `/products` | Products & Services | Catalog listing, search, create, edit, and delete. |
| `/invoices` | Invoices | Invoice listing, search, create, view, PDF placeholder, and delete. |
| `/receipts` | Receipts | Receipt listing, search, create, PDF placeholder, and delete. |
| `/adjustments` | Credit & Debit Notes | Credit note and debit note tabs with creation and view dialogs. |
| `/reports` | Reports | Revenue trend, invoice status summary, and top customer charts. |
| `/settings` | Settings | Business information, invoice defaults, logo, and tax information. |
| `*` | NotFound | 404 fallback inside the protected layout. |

All routes except `/login` are wrapped by `Layout`, which redirects unauthenticated users to `/login`.

## API Endpoints

There are no active HTTP API calls in the current implementation.

The service files contain TODO comments showing intended future endpoints, but these are examples only and are not currently implemented:

| Entity | Example future endpoint from comments |
| --- | --- |
| Customers | `/api/customers`, `/api/customers/:id` |
| Products | `/api/products`, `/api/products/:id` |
| Invoices | `/api/invoices`, `/api/invoices/:id` |
| Receipts | `/api/receipts` |
| Credit notes | `/api/credit-notes` |
| Debit notes | `/api/debit-notes` |
| Reports | `/api/reports/revenue`, `/api/reports/invoice-status`, `/api/reports/top-customers` |

External assets/services used in the UI:

- QR code images are loaded from `https://api.qrserver.com/v1/create-qr-code/` in document view dialogs.
- FIRS logo/favicon assets are loaded from `https://einvoice.firs.gov.ng/`.

## Data Storage and Database Setup

No database setup is required for the current codebase.

Current storage behavior:

| Data | Current storage |
| --- | --- |
| Authenticated user | Browser `localStorage` key `paytraka_user` |
| Business settings | Browser `localStorage` key `paytraka_settings` |
| Uploaded logo | Base64 data URL stored as part of `paytraka_settings` |
| Customers | In-memory array in `customersService.ts` |
| Products/services | In-memory array in `productsService.ts` |
| Invoices | In-memory exported array in `invoicesService.ts` |
| Receipts | In-memory array in `receiptsService.ts` |
| Credit/debit notes | In-memory arrays in `adjustmentsService.ts` |
| Reports | Calculated from the in-memory invoice array |

Because most records are stored in module-level arrays, they are not persisted to a database and may reset when the browser reloads or the app is restarted.

## Authentication and Authorization Flow

Authentication is implemented in `src/services/authService.ts`.

1. The user submits email and password on `/login`.
2. `login(email, password)` checks the values against fixed credentials.
3. On success, a mock user is saved to `localStorage`.
4. `Layout` calls `isAuthenticated()` on protected routes.
5. If no user exists in `localStorage`, the app redirects to `/login`.
6. Logout removes `paytraka_user` from `localStorage` and redirects to `/login`.

There is no role-based authorization, token validation, password hashing, server session, or backend identity provider in the current implementation.

## Important Business Logic

### Invoice totals

Invoice totals are calculated in `InvoiceDialog`:

```text
subtotal = sum(line item quantity * unit price)
tax = sum(line item total * tax rate / 100)
total = subtotal + tax - discount + delivery fee
```

### Invoice numbering

Invoices are assigned numbers in this format:

```text
INV-2024-001
```

The numeric suffix is based on the current in-memory invoice count.

### Receipt numbering

Receipts are assigned numbers in this format:

```text
RCP-<current-year>-001
```

### Receipt-to-invoice status update

When a receipt is created, updated, or deleted, `receiptsService.ts` recalculates total paid for the linked invoice:

- If total paid is greater than or equal to invoice total, invoice status becomes `paid`.
- If total paid is greater than `0` but less than invoice total, invoice status remains or becomes `sent`.

### Reports

Reports are calculated from `mockInvoices` in `reportsService.ts`:

- Total revenue
- Paid revenue
- Unpaid revenue
- Monthly revenue
- Invoice status count
- Top customers by invoiced amount

## PDF and QR Code Behavior

`src/utils/pdfGenerator.ts` is currently a mock utility. Calling PDF generation logs to the console and shows an alert instead of downloading a real PDF.

Document view dialogs display QR codes through an external QR code image URL. Real PDF generation is listed as a TODO in the code, with suggested libraries such as jsPDF or PDFKit.

## Deployment

This is a static Vite frontend app. To create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Deploy the generated `dist/` folder to any static hosting provider, such as:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Nginx or Apache static hosting

For single-page app routing, configure your host to serve `index.html` for unknown routes. Without this rewrite, refreshing a nested route such as `/invoices` may return a 404 from the hosting provider.

## Contribution Guidelines

1. Fork or branch from the main project branch.
2. Install dependencies with `npm install`.
3. Create focused changes that match the existing React, TypeScript, Tailwind, and shadcn/ui patterns.
4. Run linting before submitting:

```bash
npm run lint
```

5. Build the app before opening a pull request:

```bash
npm run build
```

6. Keep mock service changes clearly separated from any future backend integration.
7. Do not commit secrets, credentials, `.env.local`, or generated build artifacts.

## Common Errors and Troubleshooting

| Problem | Possible cause | Fix |
| --- | --- | --- |
| Login fails | Wrong fixed demo credentials | Use `admin@paytraka.com` and `123456`. |
| App redirects to `/login` | No `paytraka_user` entry in `localStorage` | Log in again. |
| Records disappear after refresh | Most entity data is stored in in-memory arrays | This is expected until a real backend/database is added. |
| Settings persist but invoices do not | Settings use `localStorage`; invoices use in-memory arrays | Add persistent storage or backend APIs for invoice data. |
| PDF download does not happen | PDF generation is currently mocked | Implement real generation in `src/utils/pdfGenerator.ts`. |
| QR codes or FIRS images do not load | Browser cannot reach external image hosts | Check network access to `api.qrserver.com` and `einvoice.firs.gov.ng`. |
| Refreshing `/customers` or another nested route fails after deployment | Static host is not configured for SPA fallback | Configure rewrites to serve `index.html`. |
| Dashboard/report values show zero or empty charts | No invoices exist in the in-memory invoice array | Create invoices in the current app session. |
| `npm run lint` reports errors | Existing TypeScript/ESLint issues are present in the source code | Fix the reported lint issues before treating lint as a passing CI check. |

## Notes / Assumptions

- No real backend API implementation was found.
- No database schema, migration files, ORM config, or database client was found.
- No required environment variables were found.
- No test framework or test scripts were found.
- No license file was found.
- No maintainer contact information was found.
- The package name in `package.json` is currently `vite_react_shadcn_ts`, while the app branding and HTML metadata use Paytraka.
- Some older invoice statuses such as `draft`, `overdue`, and `cancelled` are still referenced in parts of the UI, but the active invoice service currently types invoice status as `sent` or `paid`.
- The UI claims FIRS-compliant output, but actual compliance validation, FIRS integration, and production-grade PDF generation were not confirmed in the codebase.
- At the time this README was created, `npm run build` completed successfully, while `npm run lint` reported existing source lint errors.

## License

No license file or package-level license field was found in this repository. Add a `LICENSE` file before distributing the project publicly.

## Contact / Maintainer

No maintainer contact was found in the repository. Add maintainer details here when available.
