/**
 * models/Printer.js — see the comment in models/User.js for why this
 * file no longer defines a Mongoose schema.
 */

const TABLE = "printers";

function formatPrinter(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    status: row.status,
    supportedPaperSizes: row.supported_paper_sizes,
    supportedColorModes: row.supported_color_modes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { TABLE, formatPrinter };
