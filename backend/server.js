const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const printerRoutes = require("./routes/printerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

connectDB();

const app = express();

// --- Core middleware ---------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically so a stored path like
// "/uploads/171234-abcd.pdf" resolves to an actual downloadable file.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Health check routes ------------------------------------------------
app.get("/", (req, res) => {
  res.json({ message: "Automated Printing Backend is running!" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Frontend can connect to backend!" });
});

// --- Feature routes -------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/printers", printerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);

// --- Error handling (must be last) --------------------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Automated Printing backend listening on http://localhost:${PORT}`);
});
