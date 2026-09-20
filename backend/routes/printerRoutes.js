const express = require("express");
const {
  listPrinters,
  getPrinter,
  createPrinter,
  updatePrinter,
  deletePrinter,
} = require("../controllers/printerController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public — an anonymous customer placing an order may need to see which
// printers exist. Only creating/editing/deleting printers stays admin-only.
router.get("/", listPrinters);
router.get("/:id", getPrinter);
router.post("/", protect, adminOnly, createPrinter);
router.put("/:id", protect, adminOnly, updatePrinter);
router.delete("/:id", protect, adminOnly, deletePrinter);

module.exports = router;
