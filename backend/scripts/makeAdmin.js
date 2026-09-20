/**
 * One-off script to promote an existing user to the "admin" role.
 *
 * Why this exists: POST /api/auth/register always creates a "customer"
 * account on purpose (see controllers/authController.js) — the API never
 * takes role from the request body, so a user can't grant themselves
 * admin access. This script is the intended way to create your first
 * admin: register a normal account through the app, then run this once
 * from the command line.
 *
 * Usage:
 *   cd backend
 *   node scripts/makeAdmin.js you@example.com
 */
require("dotenv").config();
const supabase = require("../config/supabaseClient");

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node scripts/makeAdmin.js <email>");
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("users")
    .update({ role: "admin" })
    .eq("email", email.toLowerCase())
    .select("id, email, role")
    .maybeSingle();

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (!data) {
    console.error(`No user found with email "${email}". Register that account first.`);
    process.exit(1);
  }

  console.log(`"${data.email}" is now an admin.`);
}

main();
