const express = require("express");
const { upload, uploadDocument } = require("../controllers/uploadController");

const router = express.Router();

// Public — customers upload documents without an account. File type and
// size are still enforced server-side in uploadController.js regardless.
// Field name must be "document" — see the frontend integration guide.
router.post("/", upload.single("document"), uploadDocument);

module.exports = router;
