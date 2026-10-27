import React from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import NoteCard from '../components/NoteCard.jsx';

export default function TrashView() {
  const { notes, counts, loading, viewMode, setViewMode, setDeleteDialog } = useNotes();
  const trashCount = notes.length;

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Archival Header & Sub-narrative */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md mb-space-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-outline">
              Library Archive / Retention
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="font-caption text-caption text-secondary font-medium">
              30-Day Window
            </span>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Trash
            </h1>
            <span className="font-caption text-caption px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
              {trashCount} {trashCount === 1 ? 'note' : 'notes'} in trash
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
            Notes discarded within the last 30 days. Items here can be restored to your active library or permanently removed into the void.
          </p>
        </div>

        {/* Quick Stats Metric Pill */}
        <div className="flex items-center gap-space-md self-start md:self-auto bg-surface-container-low px-space-md py-space-sm rounded-xl">
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">
              Reclaimable
            </span>
            <span className="font-title-md text-title-md text-primary">
              {trashCount} {trashCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">auto_delete</span>
          </div>
        </div>
      </header>

      {/* Editorial Info Banner with Subtle Terracotta Warmth */}
      <div className="w-full bg-secondary-fixed/30 rounded-xl p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm mb-space-xl border border-secondary-fixed/50">
        <div className="flex items-start sm:items-center gap-space-sm">
          <div className="p-2 rounded-lg bg-secondary-fixed/50 text-secondary shrink-0">
            <span className="material-symbols-outlined text-xl">hourglass_bottom</span>
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-on-surface">
              Automatic 30-Day Purge Enabled
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Notes in Trash will be automatically purged after 30 days. Permanent deletion cannot be undone.
            </p>
          </div>
        </div>

        {trashCount > 0 && (
          <div className="flex items-center gap-space-sm shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setDeleteDialog({ type: 'empty_trash' })}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-lowest text-secondary hover:bg-secondary hover:text-on-secondary transition-colors font-label-md text-label-md shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
              <span>Empty Trash ({trashCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl animate-spin text-primary">
            progress_activity
          </span>
        </div>
      )}

      {/* Empty State */}
      {!loading && trashCount === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-secondary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl">delete_outline</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Trash is clean
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            No discarded drafts or deleted notes found. Items moved to trash stay here for 30 days before permanent deletion.
          </p>
        </div>
      )}

      {/* Trash Grid */}
      {!loading && trashCount > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg'
              : 'flex flex-col gap-space-sm'
          }
        >
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} isListView={viewMode === 'list'} />
          ))}
        </div>
      )}
    </div>
  );
}
