const supabase = require("../config/supabaseClient");
const { formatPrinter } = require("../models/Printer");

/**
 * GET /api/printers
 * Any authenticated user — used by the customer flow to pick a printer.
 */
async function listPrinters(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("printers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const printers = data.map(formatPrinter);
    return res.status(200).json({ success: true, count: printers.length, printers });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/printers/:id
 */
async function getPrinter(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("printers")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Printer not found" });
    }

    return res.status(200).json({ success: true, printer: formatPrinter(data) });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/printers — admin only
 */
async function createPrinter(req, res, next) {
  try {
    const { name, location, status, supportedPaperSizes, supportedColorModes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }

    const insertPayload = {
      name,
      location: location ?? null,
      status: status ?? "offline",
      supported_paper_sizes: supportedPaperSizes ?? ["A4"],
      supported_color_modes: supportedColorModes ?? ["black-white"],
    };

    const { data, error } = await supabase
      .from("printers")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) throw error;

    return res
      .status(201)
      .json({ success: true, message: "Printer created", printer: formatPrinter(data) });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/printers/:id — admin only
 */
async function updatePrinter(req, res, next) {
  try {
    const { name, location, status, supportedPaperSizes, supportedColorModes } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (location !== undefined) updatePayload.location = location;
    if (status !== undefined) updatePayload.status = status;
    if (supportedPaperSizes !== undefined) updatePayload.supported_paper_sizes = supportedPaperSizes;
    if (supportedColorModes !== undefined) updatePayload.supported_color_modes = supportedColorModes;

    const { data, error } = await supabase
      .from("printers")
      .update(updatePayload)
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Printer not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Printer updated", printer: formatPrinter(data) });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/printers/:id — admin only
 */
async function deletePrinter(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("printers")
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "Printer not found" });
    }

    return res.status(200).json({ success: true, message: "Printer deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { listPrinters, getPrinter, createPrinter, updatePrinter, deletePrinter };
