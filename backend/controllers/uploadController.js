const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/jpeg",
  "image/png",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);

const MAX_FILE_SIZE_BYTES = (Number(process.env.MAX_FILE_SIZE_MB) || 25) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function filename(req, file, cb) {
    // Never trust the client-supplied filename directly — generate a
    // unique name but keep the original extension for readability.
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.has(ext);

  if (!mimeOk || !extOk) {
    return cb(
      new Error(
        "Unsupported file type. Allowed formats: PDF, DOC, DOCX, JPG, JPEG, PNG."
      )
    );
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

/**
 * POST /api/upload
 * Expects a single file under the field name "document".
 */
function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file was uploaded. Attach a file under the field name 'document'.",
    });
  }

  return res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
}

module.exports = { upload, uploadDocument };
