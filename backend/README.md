# Automated Printing — Backend

Express + **Supabase (PostgreSQL)** API for the Automated Printing platform.
Lives entirely in this `backend/` folder — your Vite frontend is untouched
and lives alongside it in `frontend/`.

Authentication is still your own JWT + bcrypt system — this backend does
**not** use Supabase Auth. Supabase here is just the Postgres database,
accessed via the `@supabase/supabase-js` client using the service role key.

## 1. Folder structure

```
backend/
├── server.js                  # Express app entry point
├── package.json
├── .env                       # your local secrets (gitignored)
├── .env.example                # template — safe to commit
├── .gitignore
├── sql/
│   └── schema.sql              # run once in the Supabase SQL editor
├── config/
│   ├── supabaseClient.js       # the Supabase client (service role key)
│   ├── db.js                   # startup connectivity check
│   └── pricing.js              # per-page rate table + calculatePrice()
├── models/
│   ├── User.js                 # row -> JSON formatter (not an ORM schema)
│   ├── PrintOrder.js           # row -> JSON formatter
│   └── Printer.js              # row -> JSON formatter
├── routes/
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── printerRoutes.js
│   ├── uploadRoutes.js
│   └── adminRoutes.js          # added beyond the original spec — see note below
├── controllers/
│   ├── authController.js
│   ├── orderController.js      # also holds the admin order/user handlers
│   ├── printerController.js
│   └── uploadController.js     # unchanged — still local disk storage via Multer
├── middleware/
│   ├── authMiddleware.js       # protect() + adminOnly()
│   └── errorMiddleware.js
├── scripts/
│   └── makeAdmin.js            # promote a user to admin from the CLI
└── uploads/                     # uploaded files land here (gitignored)
```

**Two structural additions beyond the original spec:**
- `routes/adminRoutes.js` — "view all users", "view all orders", and
  "update order status" needed somewhere to live that wasn't
  printer-specific; mounted at `/api/admin/*`.
- `sql/schema.sql` — the Postgres equivalent of the old Mongoose schemas.
  Run once in Supabase; nothing in the app runs migrations automatically.

**File uploads are unchanged.** You only asked me to switch the database —
uploaded documents still land on disk in `backend/uploads/` via Multer,
exactly as before. If you'd rather store files in **Supabase Storage**
instead of local disk, say so and I'll swap that layer too.

## 2. Install

```bash
cd backend
npm install
```

This installs exactly: `@supabase/supabase-js`, `express`, `jsonwebtoken`,
`bcryptjs`, `dotenv`, `cors`, `multer` (dependencies) and `nodemon` (dev
dependency). `mongoose` has been removed.

## 3. Set up the Supabase project

1. Create a project at [supabase.com](https://supabase.com) if you haven't
   already.
2. Open **SQL Editor** in the Supabase dashboard, paste the entire contents
   of `sql/schema.sql`, and run it. This creates the `users`, `printers`,
   and `print_orders` tables, their indexes, `updated_at` triggers, and
   enables Row Level Security (see the comment at the bottom of that file
   for what RLS does and doesn't do here).
3. Go to **Project Settings → Data API** and copy your **Project URL**.
4. Go to **Project Settings → API Keys** and copy the **service_role**
   secret key (not the `anon` public key — the backend needs the elevated
   key to read/write freely; see the security note below on why that's safe
   here).

## 4. Configure environment variables

```bash
cp .env.example .env
```

```
PORT=5000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=25
```

- **SUPABASE_URL** / **SUPABASE_SERVICE_ROLE_KEY** — from step 3 above.
- **JWT_SECRET** — any long random string, e.g. generate one with
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- **CLIENT_URL** — must match wherever your Vite dev server actually runs.

`.env` is in `.gitignore` — never commit it, and never commit the service
role key anywhere.

## 5. Run

```bash
npm run dev     # nodemon, auto-restarts on file changes
# or
npm start       # plain node, for production
```

You should see:

```
[Supabase] Connected successfully -> https://your-project-ref.supabase.co
Automated Printing backend listening on http://localhost:5000
```

If the schema hasn't been run yet, or the credentials are wrong, you'll see
`[Supabase] Connection FAILED: ...` and the process exits — it will never
silently run against a database it can't actually reach.

## 6. Verify it's working

```bash
curl http://localhost:5000/
# {"message":"Automated Printing Backend is running!"}

curl http://localhost:5000/api/test
# {"message":"Frontend can connect to backend!"}
```

## 7. Create your first admin

Every account created through `POST /api/auth/register` is a `customer` —
this is intentional (see Security below). To get an admin:

```bash
# 1. Register a normal account through your frontend or curl, then:
node scripts/makeAdmin.js owner@example.com
```

## 8. API reference

All responses follow `{ success: boolean, message?, ...data }`. All
authenticated routes expect `Authorization: Bearer <token>`.

**IDs are now Postgres UUIDs returned as `id`** (e.g.
`"id": "b3f1c2a0-..."`), not Mongo's `_id`. If your frontend reads
`order._id` or `user._id` anywhere, change it to `.id`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | none | Health check |
| GET | `/api/test` | none | Health check for frontend connectivity |
| POST | `/api/auth/register` | none | Create a customer account |
| POST | `/api/auth/login` | none | Log in, get a JWT |
| GET | `/api/auth/me` | user | Current user's profile |
| POST | `/api/upload` | user | Upload a document (field name: `document`) |
| GET | `/api/printers` | user | List all printers |
| GET | `/api/printers/:id` | user | Get one printer |
| POST | `/api/printers` | admin | Create a printer |
| PUT | `/api/printers/:id` | admin | Update a printer |
| DELETE | `/api/printers/:id` | admin | Delete a printer |
| POST | `/api/orders` | user | Create a print order (price computed server-side) |
| GET | `/api/orders` | user | List the current user's orders |
| GET | `/api/orders/:id` | user | Get one of the current user's orders |
| PUT | `/api/orders/:id/cancel` | user | Cancel own order (only while `pending`) |
| GET | `/api/admin/users` | admin | List every user |
| GET | `/api/admin/orders` | admin | List every order |
| PUT | `/api/admin/orders/:id/status` | admin | Change an order's status |

See `FRONTEND_INTEGRATION.md` for exact `fetch`/`FormData` examples.

## 9. Pricing

Unchanged — `config/pricing.js` still holds the rate table and
`price = pages × copies × rate`. This logic never touched MongoDB and
didn't need to change for Supabase.

## 10. Security notes

- Passwords are hashed with bcrypt (10 salt rounds) before being written to
  Postgres; `models/User.js`'s `formatUser()` strips the hash from every
  response, and the login/register queries only ever `select` it when
  actually needed for comparison.
- `role` is never accepted from the client on register/login/order endpoints
  — every self-registered account is a `customer`. Admin status only comes
  from a database row, set via `scripts/makeAdmin.js`.
- The backend connects with the Supabase **service role key**, which
  bypasses Row Level Security. This is safe *only* because that key lives
  exclusively in `backend/.env` on the server and is never sent to any
  client. All authorization (ownership checks, admin-only routes) is
  enforced in Express, exactly as it was with MongoDB — RLS on the tables
  is enabled purely as a second layer in case the `anon` key is ever used
  directly from a browser.
- File uploads are restricted by both MIME type and extension
  (PDF/DOC/DOCX/JPG/JPEG/PNG) and capped at `MAX_FILE_SIZE_MB` (default 25MB).
  Filenames are regenerated server-side.
- Order price is always recalculated server-side; nothing the client sends
  as a "total" is trusted.
- Ownership is checked on every order read/cancel (`order.user_id` must
  match the authenticated user's `id`).
- CORS is locked to a single configurable origin (`CLIENT_URL`), not `*`.

## 11. Testing the full flow

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"password123"}'
# -> copy the "token" from the response

TOKEN="paste-token-here"

# Upload a file
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "document=@/path/to/test.pdf"
# -> copy "file.filename" from the response

# Create a printer (needs an admin token — see step 7)
# curl -X POST http://localhost:5000/api/printers -H "Authorization: Bearer $ADMIN_TOKEN" \
#   -H "Content-Type: application/json" -d '{"name":"Front Desk Printer","status":"online"}'
# -> copy the printer "id"

# Create an order
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"file":"paste-filename-here","printer":"paste-printer-id-here","pages":10,"copies":2,"colorMode":"black-white","paperSize":"A4"}'

# List my orders
curl http://localhost:5000/api/orders -H "Authorization: Bearer $TOKEN"
```

You can also inspect rows directly in **Supabase → Table Editor** at any
point to confirm what actually landed in the database.

## 12. What's NOT built yet: the physical printer

Unchanged from before — this backend manages print **jobs and their
status**, not an actual printer. See the original architecture notes for
the planned Print Agent (poll for `paid` jobs → atomic claim → send to the
shop's local print system → report status back) — happy to build that as a
follow-up.
