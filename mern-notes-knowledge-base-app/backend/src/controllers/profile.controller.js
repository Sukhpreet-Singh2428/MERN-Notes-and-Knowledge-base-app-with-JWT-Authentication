import profileService from '../services/profile.service.js';

/** GET /api/profile — Authenticated user's profile */
export async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: 'Profile not found.', code: 'NOT_FOUND' },
      });
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/profile — Update authenticated user's profile */
export async function updateProfile(req, res, next) {
  try {
    const result = await profileService.updateProfile(req.user.id, req.body);
    if (result.error) {
      return res.status(400).json({
        success: false,
        error: { message: result.error, code: 'VALIDATION_ERROR' },
      });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
