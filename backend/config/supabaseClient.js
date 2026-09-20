const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "[Supabase] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set in backend/.env"
  );
  process.exit(1);
}

/**
 * Server-side Supabase client, authenticated with the SERVICE ROLE key.
 *
 * This key bypasses Row Level Security — that's intentional here: this
 * client is only ever imported by trusted server code (controllers,
 * middleware, scripts), never sent to the browser. All authorization
 * (ownership checks, admin-only routes) is enforced in Express, the same
 * way it was with Mongoose.
 *
 * NEVER import this file from anything that ships to the frontend, and
 * NEVER log or return `serviceRoleKey` in any API response.
 */
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
