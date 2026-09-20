const supabase = require("../config/supabaseClient");
const { formatPayment } = require("../models/Payment");

const SAFE_USER_COLUMNS = "id, name, email, role, created_at, updated_at";

/**
 * Attaches a `client` object to each payment row by looking up
 * payments.client_id against users.id in a second query and merging in
 * memory. Done manually (rather than a Supabase embedded `.select()`
 * join) because we can't confirm a foreign key actually exists between
 * `payments.client_id` and `users.id` in your database — a missing FK
 * would make PostgREST's embedded-join syntax fail outright.
 */
async function attachClients(rows) {
  const clientIds = [...new Set(rows.map((r) => r.client_id).filter(Boolean))];
  if (clientIds.length === 0) return rows;

  const { data: users, error } = await supabase
    .from("users")
    .select(SAFE_USER_COLUMNS)
    .in("id", clientIds);

  if (error) throw error;

  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.map((row) => ({ ...row, client: byId.get(row.client_id) || null }));
}

/**
 * GET /api/admin/payments — admin only
 * Supports optional ?status=... filtering for the admin table's filter UI.
 */
async function listPayments(req, res, next) {
  try {
    let query = supabase.from("payments").select("*").order("created_at", { ascending: false });

    if (req.query.status) {
      query = query.eq("status", req.query.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const withClients = await attachClients(data);
    const payments = withClients.map(formatPayment);

    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/payments/:id — admin only
 */
async function getPayment(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const [withClient] = await attachClients([data]);
    return res.status(200).json({ success: true, payment: formatPayment(withClient) });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/payments — admin only
 * Body: { clientId, amount, currency, status, paymentTime? }
 */
async function createPayment(req, res, next) {
  try {
    const { clientId, amount, currency, status, paymentTime } = req.body;

    if (!clientId || amount === undefined || !currency || !status) {
      return res.status(400).json({
        success: false,
        message: "clientId, amount, currency and status are all required",
      });
    }

    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be a non-negative number",
      });
    }

    const insertPayload = {
      client_id: clientId,
      amount,
      currency,
      status,
      ...(paymentTime ? { payment_time: paymentTime } : {}),
    };

    const { data, error } = await supabase
      .from("payments")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) throw error;

    const [withClient] = await attachClients([data]);
    return res
      .status(201)
      .json({ success: true, message: "Payment created", payment: formatPayment(withClient) });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/payments/:id — admin only
 * Body: any of { clientId, amount, currency, status, paymentTime }
 */
async function updatePayment(req, res, next) {
  try {
    const { clientId, amount, currency, status, paymentTime } = req.body;

    const updatePayload = {};
    if (clientId !== undefined) updatePayload.client_id = clientId;
    if (amount !== undefined) {
      if (typeof amount !== "number" || amount < 0) {
        return res.status(400).json({
          success: false,
          message: "amount must be a non-negative number",
        });
      }
      updatePayload.amount = amount;
    }
    if (currency !== undefined) updatePayload.currency = currency;
    if (status !== undefined) updatePayload.status = status;
    if (paymentTime !== undefined) updatePayload.payment_time = paymentTime;

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const { data, error } = await supabase
      .from("payments")
      .update(updatePayload)
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const [withClient] = await attachClients([data]);
    return res
      .status(200)
      .json({ success: true, message: "Payment updated", payment: formatPayment(withClient) });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/payments/:id — admin only
 */
async function deletePayment(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    return res.status(200).json({ success: true, message: "Payment deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { listPayments, getPayment, createPayment, updatePayment, deletePayment };
