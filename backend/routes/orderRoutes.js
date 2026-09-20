const express = require("express");
const {
  createOrder,
  getOrderById,
  cancelOrder,
  confirmPayment,
} = require("../controllers/orderController");

const router = express.Router();

// All public — customers no longer need an account to place, track, or
// cancel a print order. Authorization for these now rests entirely on
// possessing the order's UUID (see the comments in orderController.js),
// the same trust model as a guest-checkout confirmation link.
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);
router.post("/:id/confirm-payment", confirmPayment);

module.exports = router;
