import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  togglePin,
  toggleArchive,
  softDeleteNote,
  restoreNote,
  permanentDeleteNote
} from '../controllers/notes.controller.js';

const router = Router();

router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.patch('/:id/pin', togglePin);
router.patch('/:id/archive', toggleArchive);
router.patch('/:id/restore', restoreNote);
router.delete('/:id', softDeleteNote);
router.delete('/:id/permanent', permanentDeleteNote);

export default router;
