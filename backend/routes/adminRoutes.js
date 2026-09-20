const express = require("express");
const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const {
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Every route below requires a valid token AND the admin role.
router.use(protect, adminOnly);

// --- Orders ---------------------------------------------------------------
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// --- Users ------------------------------------------------------------------
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// --- Payments (mahindhar project table) --------------------------------------
router.get("/payments", listPayments);
router.get("/payments/:id", getPayment);
router.post("/payments", createPayment);
router.put("/payments/:id", updatePayment);
router.delete("/payments/:id", deletePayment);

// --- Settings (shop's UPI ID / business name) --------------------------------
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;
