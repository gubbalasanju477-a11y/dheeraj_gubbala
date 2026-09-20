const supabase = require("../config/supabaseClient");
const { formatOrder } = require("../models/PrintOrder");
const { calculatePrice } = require("../config/pricing");

// Shared select string: order columns + embedded printer/user via FK joins.
// Supabase/PostgREST auto-detects the relationship from the foreign key
// defined in sql/schema.sql (print_orders.printer_id -> printers.id, etc.).
const ORDER_WITH_PRINTER = "*, printer:printers(*)";
const ORDER_WITH_PRINTER_AND_USER = "*, printer:printers(*), user:users(id, name, email, role, created_at, updated_at)";

/**
 * POST /api/orders — PUBLIC, no auth required.
 * Body: { file, printer, pages, copies, colorMode, paperSize, customerName?, customerPhone? }
 *
 * Customers no longer need an account to place an order. customerName/
 * customerPhone are optional free-text fields purely for the shop's own
 * reference (e.g. calling out a name at the counter) — they are NOT an
 * identity or ownership mechanism. The returned order's `id` (a UUID) is
 * the only thing that lets someone look up or cancel this order
 * afterwards, the same way a guest-checkout order number works anywhere
 * else — treat it as a bearer credential and don't log it publicly.
 *
 * price is ALWAYS computed here from pages/copies/paperSize/colorMode —
 * the client never sends a price and nothing it sends is trusted as one.
 */
async function createOrder(req, res, next) {
  try {
    const {
      file,
      printer,
      pages,
      copies = 1,
      colorMode,
      paperSize,
      customerName,
      customerPhone,
    } = req.body;

    if (!file || !printer || !pages || !colorMode || !paperSize) {
      return res.status(400).json({
        success: false,
        message: "file, printer, pages, colorMode and paperSize are all required",
      });
    }

    if (pages < 1 || copies < 1) {
      return res.status(400).json({
        success: false,
        message: "pages and copies must each be at least 1",
      });
    }

    const { data: printerRow, error: printerError } = await supabase
      .from("printers")
      .select("*")
      .eq("id", printer)
      .maybeSingle();

    if (printerError) throw printerError;

    if (!printerRow) {
      return res.status(404).json({ success: false, message: "Printer not found" });
    }

    if (printerRow.status === "offline") {
      return res.status(400).json({
        success: false,
        message: "Selected printer is currently offline",
      });
    }

    if (
      printerRow.supported_paper_sizes?.length &&
      !printerRow.supported_paper_sizes.includes(paperSize)
    ) {
      return res.status(400).json({
        success: false,
        message: `Selected printer does not support paper size "${paperSize}"`,
      });
    }

    if (
      printerRow.supported_color_modes?.length &&
      !printerRow.supported_color_modes.includes(colorMode)
    ) {
      return res.status(400).json({
        success: false,
        message: `Selected printer does not support color mode "${colorMode}"`,
      });
    }

    const price = calculatePrice({ pages, copies, paperSize, colorMode });

    const { data: created, error: insertError } = await supabase
      .from("print_orders")
      .insert({
        // No authenticated user in the anonymous flow — user_id stays null.
        user_id: null,
        customer_name: customerName ?? null,
        customer_phone: customerPhone ?? null,
        file,
        printer_id: printer,
        pages,
        copies,
        color_mode: colorMode,
        paper_size: paperSize,
        price,
        status: "pending",
      })
      .select(ORDER_WITH_PRINTER)
      .single();

    if (insertError) throw insertError;

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: formatOrder(created),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id — PUBLIC, no auth required.
 *
 * There's no concept of order ownership without customer accounts, so
 * this is intentionally not access-controlled beyond "you know the order's
 * UUID" — the same trust model as a guest-checkout order-tracking link.
 */
async function getOrderById(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("print_orders")
      .select(ORDER_WITH_PRINTER)
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order: formatOrder(data) });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/orders/:id/cancel — PUBLIC, no auth required.
 * Only works while the order is still "pending".
 */
async function cancelOrder(req, res, next) {
  try {
    const { data: existing, error: lookupError } = await supabase
      .from("print_orders")
      .select("id, status")
      .eq("id", req.params.id)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (existing.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it is "${existing.status}"`,
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from("print_orders")
      .update({ status: "cancelled" })
      .eq("id", req.params.id)
      .select(ORDER_WITH_PRINTER)
      .single();

    if (updateError) throw updateError;

    return res
      .status(200)
      .json({ success: true, message: "Order cancelled", order: formatOrder(updated) });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/:id/confirm-payment — PUBLIC, no auth required.
 *
 * Called by the frontend after the customer is redirected to their UPI
 * app and taps "I've completed the payment" back on our site.
 *
 * IMPORTANT — this is a customer SELF-REPORT, not a verified payment.
 * A bare UPI deep link has no callback/webhook the way a real payment
 * gateway (Razorpay etc.) does, so there is no cryptographic proof this
 * actually happened. This endpoint only moves a "pending" order to "paid";
 * it deliberately refuses to do so from any other status so it can't be
 * used to replay/tamper with an order that's already further along.
 * Reconcile against real payments manually from the admin Payments page.
 */
async function confirmPayment(req, res, next) {
  try {
    const { data: existing, error: lookupError } = await supabase
      .from("print_orders")
      .select("id, status")
      .eq("id", req.params.id)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (existing.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Order is already "${existing.status}" — payment cannot be confirmed again`,
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from("print_orders")
      .update({ status: "paid" })
      .eq("id", req.params.id)
      .select(ORDER_WITH_PRINTER)
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: "Payment confirmed",
      order: formatOrder(updated),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders — admin only
 * Every order in the system, most recent first.
 */
async function getAllOrders(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("print_orders")
      .select(ORDER_WITH_PRINTER_AND_USER)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const orders = data.map(formatOrder);
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/orders/:id/status — admin only
 * Body: { status }
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "paid", "printing", "completed", "cancelled", "failed"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const { data, error } = await supabase
      .from("print_orders")
      .update({ status })
      .eq("id", req.params.id)
      .select(ORDER_WITH_PRINTER_AND_USER)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Order status updated", order: formatOrder(data) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrderById,
  cancelOrder,
  confirmPayment,
  getAllOrders,
  updateOrderStatus,
};
