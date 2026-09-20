# PrintEase — Self-Service Automated Printing Platform (Frontend)

A complete, production-quality **frontend only** for a self-service printing kiosk product. Built with Next.js (App Router), React, TypeScript, Tailwind CSS, and a hand-rolled shadcn/ui-style component set. All backend behavior is mocked in `lib/api.ts` so the entire customer and admin experience runs without a server.

## Getting started

This project's dependencies were not installed in the environment it was generated in (no network access), so you'll need to install them yourself:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## What's inside

### Customer flow (mobile-first)
- `/` — Landing page
- `/print/upload` — Upload documents (drag & drop, camera capture, mock page-count detection)
- `/print/options` — Color / paper / sides / copies / page-range, live price summary
- `/print/review` — Order review with a confirmation checkbox
- `/print/payment` — Mock UPI / Card / Net Banking payment, with a QR code and a ~5% simulated failure to exercise the error state
- `/print/success` — Payment success + status timeline
- `/print/status/[id]` — Live-feeling print progress (queued → printing → completed), with a failure state

### Admin dashboard
- `/admin` — Revenue, job counts, recent jobs table
- `/admin/jobs` — Searchable, filterable job list with a detail drawer
- `/admin/pricing` — Editable per-page rates by paper/color, sides multipliers, service fee, minimum order
- `/admin/printers` — Printer cards with live-looking progress, online/offline/paused states
- `/admin/customers` — Customer list rolled up from order history
- `/admin/reports` — Revenue trends, B&W vs Color, A4 vs A3, daily orders (Recharts)
- `/admin/settings` — Business info, printing defaults, security, system settings

## Architecture notes

- **State across the print flow** lives in `lib/store.tsx` (`PrintOrderProvider`), a React Context that carries uploaded documents, selected options, computed price, and the resulting order across the five-page customer flow. It's intentionally in-memory (no localStorage) since `File` objects can't be serialized — this matches how a real implementation would hold state client-side before handing off to a backend.
- **Mock service layer** — `lib/api.ts` — every function (`uploadDocument`, `getDocumentPageCount`, `calculatePrintPrice`, `createPrintJob`, `processPayment`, `getPrintJobStatus`) simulates network latency and returns realistically shaped data. Swap the internals for real `fetch` calls when a backend exists; call sites don't need to change.
- **Pricing logic** is centralized in `lib/pricing.ts` so the customer-facing price calculator and the admin pricing page share the same rate table shape.
- **Design system**: a single accent color (Signal Blue `#2E5CFF`) on a light, paper-white background; Space Grotesk for display type, Inter for body text, and IBM Plex Mono for prices/order IDs/receipts. The "ticket" component (see `.ticket` / `.ticket-divider` in `app/globals.css`) gives order summaries a perforated-receipt look, tying the UI back to the physical act of printing.

## Known limitations (by design, since this is frontend-only)

- No real file upload, payment gateway, or printer connection — see `lib/api.ts` for where those would plug in.
- The QR code on the payment page is a decorative mock grid, not a scannable code.
- Admin data (orders, printers, revenue) is static mock data in `lib/mock-data.ts`.
