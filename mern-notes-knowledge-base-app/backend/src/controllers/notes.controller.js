import notesService from '../services/notes.service.js';
import { validateNote } from '../validators/note.validation.js';

/** GET /api/notes */
export async function getAllNotes(req, res, next) {
  try {
    const notes = await notesService.getNotes(req.query);
    res.json({ success: true, data: notes, count: notes.length });
  } catch (err) {
    next(err);
  }
}

/** GET /api/notes/:id */
export async function getNoteById(req, res, next) {
  try {
    const note = await notesService.getNoteById(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: { message: 'Note not found.', code: 'NOT_FOUND' } });
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

/** POST /api/notes */
export async function createNote(req, res, next) {
  try {
    const validation = validateNote(req.body, false);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: { message: validation.errors.join(' '), code: 'VALIDATION_ERROR' } });
    }
    const note = await notesService.createNote(validation.data);
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/notes/:id */
export async function updateNote(req, res, next) {
  try {
    const validation = validateNote(req.body, true);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: { message: validation.errors.join(' '), code: 'VALIDATION_ERROR' } });
    }
    const note = await notesService.updateNote(req.params.id, validation.data);
    if (!note) return res.status(404).json({ success: false, error: { message: 'Note not found or cannot be edited.', code: 'NOT_FOUND' } });
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/notes/:id/pin */
export async function togglePin(req, res, next) {
  try {
    const note = await notesService.togglePin(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: { message: 'Note not found.', code: 'NOT_FOUND' } });
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/notes/:id/archive */
export async function toggleArchive(req, res, next) {
  try {
    const note = await notesService.toggleArchive(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: { message: 'Note not found.', code: 'NOT_FOUND' } });
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/notes/:id (soft delete) */
export async function softDeleteNote(req, res, next) {
  try {
    const note = await notesService.softDelete(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: { message: 'Note not found.', code: 'NOT_FOUND' } });
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/notes/:id/restore */
export async function restoreNote(req, res, next) {
  try {
    const note = await notesService.restore(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: { message: 'Note not found or not in trash.', code: 'NOT_FOUND' } });
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/notes/:id/permanent */
export async function permanentDeleteNote(req, res, next) {
  try {
    const result = await notesService.permanentDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: { message: 'Note not found.', code: 'NOT_FOUND' } });
    if (result.error) return res.status(400).json({ success: false, error: { message: result.error, code: 'INVALID_OPERATION' } });
    res.json({ success: true, data: { message: 'Note permanently deleted.' } });
  } catch (err) {
    next(err);
  }
}
