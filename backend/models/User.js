/**
 * models/User.js
 *
 * There's no ORM schema here anymore — the `users` table itself
 * (see sql/schema.sql) is the source of truth for shape/constraints.
 * This file's job now is just to translate a raw Postgres row
 * (snake_case, includes the password hash) into the camelCase, safe
 * shape the API actually returns — so the password hash can never
 * accidentally leak into a response, the same guarantee the old
 * Mongoose toJSON() override used to give us.
 */

const TABLE = "users";

/** Row -> public-safe JSON. Never includes `password`. */
function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { TABLE, formatUser };
