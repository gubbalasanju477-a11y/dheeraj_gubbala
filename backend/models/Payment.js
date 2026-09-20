/**
 * models/Payment.js
 *
 * Row formatter for the existing `payments` table (client_id, amount,
 * currency, status, payment_time, created_at) — this table already
 * exists in Supabase; nothing here creates or alters it.
 */

const { formatUser } = require("./User");

const TABLE = "payments";

/**
 * Row -> camelCase JSON. `client` is an optional embedded user object
 * attached manually in the controller (see paymentController.js) —
 * Postgres relationship embedding is not relied on here since we can't
 * confirm a foreign key actually exists between payments.client_id and
 * users.id in your database.
 */
function formatPayment(row) {
  if (!row) return null;

  return {
    id: row.id,
    clientId: row.client_id,
    client: row.client ? formatUser(row.client) : undefined,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    paymentTime: row.payment_time,
    createdAt: row.created_at,
  };
}

module.exports = { TABLE, formatPayment };
