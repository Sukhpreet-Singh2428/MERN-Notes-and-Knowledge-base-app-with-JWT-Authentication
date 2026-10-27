/**
 * Centralized error handler. Never exposes stack traces in production responses.
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: {
      message: status === 500 ? 'An unexpected server error occurred.' : err.message,
      code: 'SERVER_ERROR'
    }
  });
}
