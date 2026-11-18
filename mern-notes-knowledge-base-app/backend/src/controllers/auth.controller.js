import authService from '../services/auth.service.js';

/**
 * POST /api/auth/register
 *
 * Register a new user and return the serialized user + JWT.
 */
export async function register(req, res, next) {
  try {
    const { displayName, email, password } = req.body;
    const result = await authService.register({ displayName, email, password });

    if (result.error) {
      return res.status(result.statusCode).json({
        success: false,
        error: {
          message: result.error,
          code: result.statusCode === 409 ? 'DUPLICATE_EMAIL' : 'VALIDATION_ERROR',
        },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 *
 * Authenticate a user and return the serialized user + JWT.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    if (result.error) {
      return res.status(result.statusCode).json({
        success: false,
        error: {
          message: result.error,
          code: result.statusCode === 401 ? 'INVALID_CREDENTIALS' : 'VALIDATION_ERROR',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (err) {
    next(err);
  }
}
