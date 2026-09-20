const supabase = require("./supabaseClient");

/**
 * Supabase (unlike Mongoose) doesn't have a persistent "connection" to
 * open — every call is a stateless HTTPS request. To still give a clear
 * success/failure signal at startup (as the app did with MongoDB), this
 * runs one lightweight query against the `printers` table and reports
 * the result.
 *
 * Run sql/schema.sql in the Supabase SQL editor before starting the
 * server for the first time, or this check will fail with "relation
 * does not exist".
 */
async function connectDB() {
  try {
    const { error } = await supabase.from("printers").select("id").limit(1);

    if (error) {
      throw error;
    }

    console.log(`[Supabase] Connected successfully -> ${process.env.SUPABASE_URL}`);
  } catch (error) {
    console.error(`[Supabase] Connection FAILED: ${error.message}`);
    console.error(
      "[Supabase] Check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env, and that sql/schema.sql has been run."
    );
    process.exit(1);
  }
}

module.exports = connectDB;
