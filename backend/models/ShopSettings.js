/**
 * models/ShopSettings.js — row formatter for the singleton shop_settings
 * table (see sql/schema.sql). Holds the shop's UPI ID, which the customer
 * payment page uses to build its "upi://pay?..." deep link.
 */

const TABLE = "shop_settings";

function formatShopSettings(row) {
  if (!row) return null;
  return {
    businessName: row.business_name,
    upiId: row.upi_id,
    updatedAt: row.updated_at,
  };
}

/** Public-safe subset — safe to expose with no authentication at all. */
function formatPublicShopSettings(row) {
  if (!row) return null;
  return {
    businessName: row.business_name,
    upiId: row.upi_id,
  };
}

module.exports = { TABLE, formatShopSettings, formatPublicShopSettings };
