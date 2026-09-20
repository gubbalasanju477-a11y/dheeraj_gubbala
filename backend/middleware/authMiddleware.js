const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const { formatUser } = require("../models/User");

/**
 * Verifies the "Authorization: Bearer <token>" header, loads the
 * corresponding user from Postgres, and attaches it to req.user. Rejects
 * the request if the token is missing, malformed, expired, or points to
 * a user that no longer exists.
 *
 * req.user is always the *formatted* (camelCase, no password) shape —
 * see models/User.js. Anywhere downstream that previously read
 * req.user._id (the Mongo convention) must now read req.user.id.
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: row, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at, updated_at")
      .eq("id", decoded.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!row) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User no longer exists.",
      });
    }

    req.user = formatUser(row);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
}

/**
 * Must run AFTER protect(). Rejects any request whose authenticated user
 * is not an admin. The role is read from req.user, which was loaded from
 * the database by protect() — never from a client-supplied header or body,
 * so a user cannot grant themselves admin access.
 */
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Admin access required.",
    });
  }

  next();
}

module.exports = { protect, adminOnly };
