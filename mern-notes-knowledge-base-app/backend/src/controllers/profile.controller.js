import profileService from '../services/profile.service.js';

/** GET /api/profile */
export async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getProfile();
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/profile */
export async function updateProfile(req, res, next) {
  try {
    const result = await profileService.updateProfile(req.body);
    if (result.error) {
      return res.status(400).json({ success: false, error: { message: result.error, code: 'VALIDATION_ERROR' } });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
