/**
 * models/PrintOrder.js — see the comment in models/User.js for why this
 * file no longer defines a Mongoose schema.
 */

const { formatPrinter } = require("./Printer");
const { formatUser } = require("./User");

const TABLE = "print_orders";

/**
 * Row -> camelCase JSON, matching the exact shape the frontend already
 * expects from the old Mongoose version. Handles the optional embedded
 * `printer` / `user` objects that come back from a Supabase `.select()`
 * with a joined foreign table (see orderController.js).
 */
function formatOrder(row) {
  if (!row) return null;

  return {
    id: row.id,
    // null for anonymous/walk-up orders now that customer accounts are optional.
    user: row.user ? formatUser(row.user) : row.user_id ?? null,
    customerName: row.customer_name ?? null,
    customerPhone: row.customer_phone ?? null,
    file: row.file,
    printer: row.printer ? formatPrinter(row.printer) : row.printer_id,
    pages: row.pages,
    copies: row.copies,
    colorMode: row.color_mode,
    paperSize: row.paper_size,
    price: Number(row.price),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { TABLE, formatOrder };
