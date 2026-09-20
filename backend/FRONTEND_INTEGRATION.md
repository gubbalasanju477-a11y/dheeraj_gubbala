# Frontend integration guide (React + Vite)

This file is a reference to drop into your **existing** Vite frontend — it
doesn't modify anything there for you, since I don't have access to your
actual project files in this environment. Copy the pieces you need.

> **Note if you already wired anything to the MongoDB version:** the
> database is now Postgres (via Supabase), so every object's ID field is
> `id` (a UUID string), not Mongo's `_id`. Everything else about the API —
> endpoints, request bodies, response shapes, field names like `colorMode`/
> `paperSize` — is unchanged.

## 1. Environment variable for the API base URL

In your Vite project root, create/edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Vite only exposes env vars prefixed with `VITE_` to the browser — this is
why it's `VITE_API_URL`, not `API_URL`.

## 2. A small API client

Create `frontend/src/api/client.js`:

```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
};
```

## 3. Example calls for every endpoint from the spec

```js
import { api } from "./api/client";

// GET /api/test
const health = await api.get("/test");

// POST /api/auth/register
const { token, user } = await api.post("/auth/register", {
  name: "John",
  email: "john@example.com",
  password: "password123",
});
localStorage.setItem("token", token);

// POST /api/auth/login
const loginResult = await api.post("/auth/login", {
  email: "john@example.com",
  password: "password123",
});
localStorage.setItem("token", loginResult.token);

// POST /api/upload  (field name MUST be "document")
const formData = new FormData();
formData.append("document", fileFromInput); // fileFromInput = e.target.files[0]
const uploadResult = await api.post("/upload", formData);
// uploadResult.file.filename  <- pass this into createOrder() below

// POST /api/orders
const order = await api.post("/orders", {
  file: uploadResult.file.filename,
  printer: selectedPrinterId,
  pages: 10,
  copies: 2,
  colorMode: "black-white", // or "color"
  paperSize: "A4", // "A4" | "A3" | "Letter"
});

// GET /api/orders
const myOrders = await api.get("/orders");

// GET /api/printers
const printers = await api.get("/printers");
```

## 4. Where to look in your existing components

Since I don't have your actual files, look for these patterns and swap them
for the calls above:

- **Login / Signup forms** — wherever you currently `console.log` the form
  values, or call a mock/fake submit handler, replace it with
  `api.post("/auth/login", ...)` / `api.post("/auth/register", ...)`, then
  `localStorage.setItem("token", ...)` and redirect.
- **Document upload component** — wherever you hold the selected `File` in
  state, wrap it in a `FormData` under the key `"document"` and call
  `api.post("/upload", formData)` on submit.
- **Print settings / printer selection** — replace any hardcoded printer
  list with `api.get("/printers")` on mount.
- **Order creation / checkout button** — replace the "place order" mock
  handler with `api.post("/orders", { ... })` using the `filename` returned
  from the upload step.
- **Order history / status page** — replace mock order arrays with
  `api.get("/orders")`.

If you share the actual files (e.g. `Login.jsx`, `Upload.jsx`,
`CreateOrder.jsx`), I'll do these edits directly instead of describing them.

## 5. Auth-gated pages

A simple pattern for protecting routes client-side (in addition to the
server always re-checking the token — never rely on this alone):

```jsx
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

## 6. CORS note

The backend only accepts requests from the origin in `CLIENT_URL`
(defaults to `http://localhost:5173`, Vite's default port). If your Vite
dev server runs on a different port, update `CLIENT_URL` in
`backend/.env` to match.
