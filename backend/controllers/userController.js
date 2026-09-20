const bcrypt = require("bcryptjs");
const supabase = require("../config/supabaseClient");
const { formatUser } = require("../models/User");

const SAFE_COLUMNS = "id, name, email, role, created_at, updated_at";

/**
 * GET /api/admin/users — admin only
 * Every user in the system, most recent first. Never returns the
 * password hash (SAFE_COLUMNS excludes it at the query level, not just
 * in formatting).
 */
async function getAllUsers(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(SAFE_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const users = data.map(formatUser);
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/users/:id — admin only
 */
async function getUserById(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(SAFE_COLUMNS)
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user: formatUser(data) });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/users/:id — admin only
 * Body: { name?, email?, role?, password? }
 *
 * Deliberately narrow: only name/email/role/password can be changed here.
 * `password`, if provided, is re-hashed — never stored or accepted as
 * plaintext-passthrough. There is no way to set/read the raw hash through
 * this endpoint.
 */
async function updateUser(req, res, next) {
  try {
    const { name, email, role, password } = req.body;

    if (role !== undefined && !["customer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'role must be "customer" or "admin"',
      });
    }

    if (password !== undefined && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "password must be at least 6 characters",
      });
    }

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (email !== undefined) updatePayload.email = email.toLowerCase();
    if (role !== undefined) updatePayload.role = role;
    if (password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one of: name, email, role, password",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", req.params.id)
      .select(SAFE_COLUMNS)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User updated", user: formatUser(data) });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/users/:id — admin only
 *
 * Will fail with a clear error if this user still owns print orders
 * (users -> print_orders is ON DELETE RESTRICT by design) — that's
 * intentional: it stops an admin from silently orphaning order history.
 */
async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account while logged in as it",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
