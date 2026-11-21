import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext.jsx';

export default function DeleteModal() {
  const { deleteDialog, setDeleteDialog, permanentDelete, emptyTrash } = useNotes();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!deleteDialog) return;
    setIsDeleting(false);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDeleteDialog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteDialog, isDeleting, setDeleteDialog]);

  if (!deleteDialog) return null;

  const isEmptyTrash = deleteDialog.type === 'empty_trash';
  const note = deleteDialog.note;

  const handleConfirm = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      if (isEmptyTrash) {
        await emptyTrash();
      } else if (note) {
        await permanentDelete(note.id || note._id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#171d16]/50 dark:bg-black/75 backdrop-blur-[6px] z-50 flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => {
        if (!isDeleting) setDeleteDialog(null);
      }}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-5 sm:p-6 flex flex-col gap-5 text-on-surface"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">
              {isEmptyTrash ? 'delete_sweep' : 'delete_forever'}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 id="delete-dialog-title" className="font-headline-sm text-headline-sm text-on-surface">
              {isEmptyTrash ? 'Empty Trash?' : 'Delete Note Permanently?'}
            </h3>
            <span className="font-caption text-caption text-outline">
              Irreversible destructive action
            </span>
          </div>
        </div>

        <div className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          {isEmptyTrash ? (
            <p>
              All notes currently residing in the Trash will be permanently erased from the local repository. This action cannot be undone.
            </p>
          ) : (
            <>
              <p>
                Are you sure you want to permanently delete{' '}
                <strong className="text-on-surface">“{note?.title || 'Untitled Note'}”</strong>?
              </p>
              <p className="mt-2 text-outline text-xs">
                This note will be permanently purged from disk storage and cannot be recovered.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={() => setDeleteDialog(null)}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors cursor-pointer text-center disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-error text-on-error hover:bg-[#a01515] font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {isDeleting ? 'progress_activity' : isEmptyTrash ? 'delete_sweep' : 'delete_forever'}
            </span>
            <span>
              {isDeleting
                ? isEmptyTrash
                  ? 'Emptying...'
                  : 'Deleting...'
                : isEmptyTrash
                ? 'Empty Trash'
                : 'Delete Permanently'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
