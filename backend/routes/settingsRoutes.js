const express = require("express");
const { getPublicSettings } = require("../controllers/settingsController");

const router = express.Router();

// Public — customers are never authenticated, and they need the shop's
// UPI ID to build the payment deep link.
router.get("/", getPublicSettings);

module.exports = router;
