# Payment Collective Dashboard

A modern, high-performance internal web dashboard built with **Next.js 15 (App Router)**, **React 19**, and **TypeScript** for managing Payment Collective operations, billing analytics, field AR visits, and automated spreadsheet synchronizations.

---

## Overview

Payment Collective Dashboard is designed for operational efficiency across two key roles:
- **Admin**: Main billing dashboard, data visualization charts, external sheet synchronization, and custom shortcuts manager.
- **AR (Account Representative)**: Field visit tracking, customer geolocation navigation via Google Maps, and visit data exports.

The application connects directly to Google Sheets via:
1. **Google Visualization API (`/gviz/tq`)**: Fast, lightweight query interface for reading dashboard datasets.
2. **Google Sheets API v4 (Service Account)**: Secure write/append capabilities for automated background synchronization and data uploads.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Frontend Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) & PostCSS |
| **Charts** | [Chart.js 4](https://www.chartjs.org/) |
| **Spreadsheet Engine** | [ExcelJS](https://github.com/exceljs/exceljs) |
| **Google Integrations** | `googleapis`, `google-auth-library` |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## Key Features

### 1. Main Dashboard (`/dashboard` — Admin)
- **Aggregated Analytics**: Bar chart visualizing total balance per bill category and doughnut chart tracking payment status breakdown.
- **Real-Time Search**: Instant search with deferred query evaluation matching customer SND and customer name.
- **Multi-Faceted Filtering**: Filter by Datel (regional area), Bill Category, Customer Age, and Payment Status (Paid / Unpaid) with select all/clear toggles, evaluated via high-speed $O(1)$ `Set` lookups.
- **Dynamic Sorting & Pagination**: Sort by balance (ascending, descending, default) with configurable page sizes (10, 20, 50, 100 rows per page) and dedicated server-side paginated query route.
- **Custom Styled XLSX Export**: Select specific columns to download either the current page or the full filtered dataset, formatted with auto-fitted column widths, frozen top header row, brand header styling (`#0D8ABC` with crisp bold white text), and alternating zebra striping (`#F8FAFC`) with soft divider borders.
- **Centered Loading UX**: Smooth, centered loading states during server render and client data syncs.

### 2. AR Visit Dashboard (`/dashboard-ar` — Admin & AR)
- **Agent Visit Management**: Table view displaying agent IDs, customer details, address, and coordinates.
- **Google Maps Integration**: Instant navigation link opening exact customer coordinates in Google Maps.
- **Agent Filter**: Filter visits by specific field agents.
- **XLSX Export**: Customizable export for visit schedules and completed visit logs.

### 3. Shortcuts Portal (`/shortcuts` — Admin)
- **Categorized Quick Links**: Organize frequently used internal tools and portals into custom categories.
- **Custom Icons & Fallbacks**: Support for custom emoji or image URL logos with automatic fallback handling.
- **Local Persistence**: Client-side storage synchronized across sessions.

### 4. Data Update & Synchronization (`/update` — Admin)
- **PRQ Sync**: Automated incremental synchronization comparing incoming rows against Report PRQ with multiple fallback matching strategies.
- **VISEEPRO Upload**: Upload XLS/XLSX spreadsheets to append new visit logs with timestamp deduplication.
- **Broadcast Events**: Triggers real-time storage and window events to notify open dashboard tabs to refresh.

---

## Performance Optimizations

The system is optimized to process tens of thousands of rows smoothly:

- **Unified In-Memory Server Caching**: Centralized server bootstrap caching (`getMainDashboardBootstrap`, `getARDashboardBootstrap`) with a 5-minute TTL (`SHEET_CACHE_TTL_MS`), unified across all main routes (`/api/sheets/main`, `/filters`, `/stats`, `/paginated`). Prevents redundant upstream Google Sheet fetches and rate limits while supporting on-demand cache invalidation via `?refresh=1`.
- **Client Session Storage**: Cached payloads in `sessionStorage` provide instant navigation and transitions between views with event-driven background cache invalidation (`pc-dashboard-data-updated`).
- **$O(1)$ Filter Lookups**: Multi-faceted filter evaluations utilize JavaScript `Set` structures across both client components and server paginated endpoints, delivering instantaneous evaluation across large row sets.
- **Single-Pass Auto-Fit XLSX Streaming & Styling**: Column width calculation performs a single pass over sampled data, generating professionally styled Excel workbooks with frozen headers, brand styling, and zebra striping in milliseconds.
- **Tree-Shaking & Lazy-Loading**: Modular Chart.js registration (only bundling used elements) and dynamic client-side modal loading (`export-modal`, `detail-modal`) to minimize initial JavaScript bundle size and optimize Core Web Vitals.
- **Static Formatter Singletons**: Reusable `Intl.NumberFormat` instances avoid expensive formatter recreations across thousands of table cells.

---

## Project Structure

```text
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts                  # Login and session creation
│   │   │   └── logout/route.ts                 # Session cleanup handler
│   │   ├── export/
│   │   │   └── dashboard/route.ts              # Spreadsheet export generator
│   │   └── sheets/
│   │       ├── ar/route.ts                     # AR dashboard data endpoint
│   │       ├── main/
│   │       │   ├── filters/route.ts            # Categorical filter options
│   │       │   ├── paginated/route.ts          # Paginated customer records
│   │       │   ├── stats/route.ts              # Summary statistics endpoint
│   │       │   └── route.ts                    # Main dataset bootstrap endpoint
│   │       └── update/
│   │           ├── sync-prq/route.ts           # PRQ report synchronization
│   │           └── upload-viseepro/route.ts    # VISEEPRO upload and append
│   ├── dashboard/
│   │   ├── loading.tsx                         # Main dashboard loading skeleton
│   │   └── page.tsx                            # Server-rendered main dashboard
│   ├── dashboard-ar/
│   │   ├── loading.tsx                         # AR loading skeleton
│   │   └── page.tsx                            # AR field visit dashboard
│   ├── login/
│   │   └── page.tsx                            # Login authentication page
│   ├── shortcuts/
│   │   └── page.tsx                            # Quick links portal page
│   ├── update/
│   │   └── page.tsx                            # Data update and upload tools
│   ├── globals.css                             # Global stylesheet
│   ├── layout.tsx                              # Root application layout
│   └── page.tsx                                # Root entry and role redirect
│
├── components/
│   ├── app-shell.tsx                           # Main navigation frame
│   ├── dashboard-client.tsx                    # Main dashboard view
│   ├── dashboard-ar-client.tsx                 # AR visit dashboard view
│   ├── detail-modal.tsx                        # Record detail inspector
│   ├── export-modal.tsx                        # Export column selector
│   ├── login-client.tsx                        # Login form interface
│   ├── logout-button.tsx                       # Logout action button
│   ├── pagination-controls.tsx                 # Table pagination bar
│   ├── shortcuts-client.tsx                    # Shortcuts manager interface
│   └── update-client.tsx                       # Data sync and upload cards
│
├── lib/
│   ├── services/                               # Shared service layer
│   │   ├── cache-service.ts                    # Client cache manager
│   │   ├── data-service.ts                     # Data provider service
│   │   ├── export-service.ts                   # Export preparation helper
│   │   ├── filter-service.ts                   # Filter evaluation engine
│   │   ├── formatter-service.ts                # Currency and date formatters
│   │   ├── index.ts                            # Service layer entry point
│   │   └── table-service.ts                    # Sorting and pagination logic
│   ├── auth.ts                                 # Session and auth helpers
│   ├── export-utils.ts                         # File download utilities
│   ├── google-sheets-api.ts                    # Google Sheets API client
│   ├── nav-items.ts                            # Role navigation definitions
│   ├── pagination.ts                           # Pagination window calculations
│   ├── server-auth.ts                          # Server authentication guards
│   ├── sheets.ts                               # Google Sheets parser and cache
│   ├── shortcuts.ts                            # Shortcuts storage helpers
│   ├── spreadsheet-utils.ts                    # Spreadsheet ID utilities
│   └── types.ts                                # Core TypeScript interfaces
│
├── middleware.ts                               # Route protection and auth guard
├── next.config.ts                              # Next.js configuration
├── tailwind.config.ts                          # Tailwind CSS configuration
└── tsconfig.json                               # TypeScript configuration
```

---

## Authentication & Access Control

Access is strictly protected via Next.js middleware and server-side session guards:

| Role | Accessible Routes | Description |
|---|---|---|
| **`admin`** | `/dashboard`, `/dashboard-ar`, `/update`, `/shortcuts` | Full access to all analytics, management tools, and sync operations. |
| **`ar`** | `/dashboard-ar` | Access restricted strictly to AR field visit records. |
| **Unauthenticated** | `/login` | Redirected to login with original return path handling. |

### Security Model
- **HTTP-Only Cookies**: Sessions are stored securely in `pc_session` cookie with `SameSite=Lax`.
- **Session Fingerprinting**: Client headers (`User-Agent`, `Accept-Language`, `Sec-CH-UA-Platform`) are hashed into the session to prevent cookie hijacking across different environments.
- **Session Expiration**: Automatic 8-hour session lifetime (`SESSION_TTL_MS`).

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm, yarn, or pnpm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/indrarmsp/paycoll-dashboard.git
cd paycoll-dashboard
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```env
# Google Visualization API Endpoints (Dashboard read)
MAIN_SHEET_URL="https://docs.google.com/spreadsheets/d/<MAIN_SHEET_ID>/gviz/tq?tqx=out:json"
AR_SHEET_URL="https://docs.google.com/spreadsheets/d/<AR_SHEET_ID>/gviz/tq?tqx=out:json"

# Spreadsheet IDs for Update/Write Operations
PRITI_DATA_SHEET_ID="<PRITI_DATA_SPREADSHEET_ID>"
REPORT_PRQ_SHEET_ID="<REPORT_PRQ_SPREADSHEET_ID>"
VISEEPRO_SHEET_ID="<VISEEPRO_SPREADSHEET_ID>"

# Google Sheets Service Account Credentials
GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_PROJECT_ID="your-gcp-project-id"

# Optional: Path to Service Account JSON (alternative to env vars above)
# GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"

# Application Authentication Credentials
PC_ADMIN_USERNAME="admin"
PC_ADMIN_PASSWORD="your-secure-admin-password"
PC_AR_USERNAME="ar_user"
PC_AR_PASSWORD="your-secure-ar-password"

# Optional Sync Interval (default: 60000ms, min: 15000ms)
NEXT_PUBLIC_DASHBOARD_SYNC_INTERVAL_MS=60000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## API Endpoints Reference

| Method | Endpoint | Parameters / Payload | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | `{ username, password }` | Authenticates credentials and issues secure fingerprint session cookie |
| `POST` | `/api/auth/logout` | — | Clears user session cookie |
| `GET` | `/api/sheets/main` | `?refresh=1`, `?limit=N` | Fetches parsed main dashboard dataset from shared in-memory server cache |
| `GET` | `/api/sheets/main/paginated` | `?page=&limit=&search=&sort=&filter_*=&refresh=1` | Sliced pagination with search, sorting, and $O(1)$ Set faceted filtering |
| `GET` | `/api/sheets/main/filters` | `?refresh=1` | Returns unique categorical filter values (Datel, Bill Category, Customer Age) |
| `GET` | `/api/sheets/main/stats` | `?refresh=1` | Computes aggregated balance per category and paid/unpaid status counts |
| `GET` | `/api/sheets/ar` | `?refresh=1` | Fetches parsed AR field visit records |
| `POST` | `/api/export/dashboard` | `{ rows, columns }` | Generates styled XLSX binary with frozen header, brand styles & zebra stripes |
| `POST` | `/api/sheets/update/sync-prq` | — | Syncs incremental data from PRITI DATA to Report PRQ with fallback matching |
| `POST` | `/api/sheets/update/upload-viseepro` | `FormData (file)` | Uploads XLS/XLSX spreadsheets and appends visit logs with deduplication |

---

## Troubleshooting

- **"Google Sheets response format mismatch"**:
  Verify that `MAIN_SHEET_URL` and `AR_SHEET_URL` end with `/gviz/tq?tqx=out:json` and that the Google Spreadsheet has sharing set to allow access.
- **"Google Sheets API credentials not configured"**:
  Ensure `GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SHEETS_PRIVATE_KEY` are provided in `.env.local` (or `GOOGLE_APPLICATION_CREDENTIALS` points to a valid JSON key file).
- **"Unauthorized redirects"**:
  If your browser sends fluctuating client headers, re-authenticating at `/login` will issue a fresh session fingerprint.