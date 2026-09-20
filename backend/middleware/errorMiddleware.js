/**
 * Catches requests to routes that don't exist and forwards a 404 into
 * the centralized error handler below, so unknown routes get the same
 * consistent JSON error shape as everything else.
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

/**
 * Centralized error handler. Every thrown/next(error) in the app ends up
 * here so the API always returns the same JSON error shape:
 *   { success: false, message: "..." }
 *
 * Must be registered LAST, after all routes, with 4 arguments so Express
 * recognizes it as an error handler.
 *
 * Error codes below are Postgres error codes as surfaced by
 * @supabase/supabase-js / PostgREST (error.code), replacing the old
 * Mongoose-specific handling (CastError / ValidationError / code 11000).
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  switch (err.code) {
    case "23505": // unique_violation — e.g. registering a duplicate email
      statusCode = 400;
      message = "A record with that value already exists";
      break;
    case "23503": // foreign_key_violation — either a referenced id doesn't
      // exist (e.g. an unknown printer/client id), or this record is
      // still referenced by others and can't be deleted (e.g. a user
      // who still owns print orders).
      statusCode = 400;
      message =
        "This operation violates a foreign key relationship: a referenced record either doesn't exist, or this record is still referenced by other data";
      break;
    case "23514": // check_violation — e.g. an invalid status/colorMode/paperSize value
      statusCode = 400;
      message = "Invalid value provided for one of the fields";
      break;
    case "22P02": // invalid_text_representation — e.g. a malformed UUID in the URL
      statusCode = 400;
      message = "Invalid ID format";
      break;
    default:
      break;
  }

  // Multer file-upload errors (size limit, unexpected field, etc.)
  if (err.name === "MulterError") {
    statusCode = 400;
    message = err.message;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  console.error(`[Error] ${req.method} ${req.originalUrl} -> ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    // Stack traces only in development, never in production responses.
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
