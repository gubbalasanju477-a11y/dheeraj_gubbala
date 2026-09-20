const supabase = require("../config/supabaseClient");
const {
  formatShopSettings,
  formatPublicShopSettings,
} = require("../models/ShopSettings");

async function fetchSettingsRow() {
  const { data, error } = await supabase
    .from("shop_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * GET /api/settings — PUBLIC, no auth.
 * Only exposes businessName + upiId — nothing sensitive. This is what the
 * customer payment page calls to build the UPI deep link, since customers
 * are never authenticated.
 */
async function getPublicSettings(req, res, next) {
  try {
    const row = await fetchSettingsRow();
    return res.status(200).json({ success: true, settings: formatPublicShopSettings(row) });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/settings — admin only
 */
async function getSettings(req, res, next) {
  try {
    const row = await fetchSettingsRow();
    return res.status(200).json({ success: true, settings: formatShopSettings(row) });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/settings — admin only
 * Body: { businessName?, upiId? }
 */
async function updateSettings(req, res, next) {
  try {
    const { businessName, upiId } = req.body;

    const updatePayload = {};
    if (businessName !== undefined) updatePayload.business_name = businessName;
    if (upiId !== undefined) updatePayload.upi_id = upiId;

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one of: businessName, upiId",
      });
    }

    // Basic sanity check on UPI ID shape: "handle@bank" — not a full
    // validator, just enough to catch obvious typos before saving.
    if (updatePayload.upi_id && !/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(updatePayload.upi_id)) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID doesn\'t look valid — expected a format like "shopname@bank"',
      });
    }

    const { data, error } = await supabase
      .from("shop_settings")
      .update(updatePayload)
      .eq("id", 1)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    return res
      .status(200)
      .json({ success: true, message: "Settings updated", settings: formatShopSettings(data) });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPublicSettings, getSettings, updateSettings };
