const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabaseClient");
const { formatUser } = require("../models/User");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are all required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with that email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // role is intentionally hardcoded — never taken from the request body.
    // Every account created through this public endpoint is a customer.
    // Admins are promoted directly via scripts/makeAdmin.js.
    const { data: created, error: insertError } = await supabase
      .from("users")
      .insert({ name, email: normalizedEmail, password: hashedPassword, role: "customer" })
      .select("id, name, email, role, created_at, updated_at")
      .single();

    if (insertError) throw insertError;

    const user = formatUser(created);
    const token = signToken(user.id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const { data: row, error } = await supabase
      .from("users")
      .select("id, name, email, password, role, created_at, updated_at")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) throw error;

    if (!row) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, row.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = formatUser(row); // strips the password hash
    const token = signToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (already attached by
 * the `protect` middleware, already formatted/password-free).
 */
async function getMe(req, res) {
  return res.status(200).json({ success: true, user: req.user });
}

module.exports = { register, login, getMe };
