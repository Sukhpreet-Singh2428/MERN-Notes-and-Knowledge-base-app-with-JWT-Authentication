import React from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import NoteCard from '../components/NoteCard.jsx';
import FilterBanner from '../components/FilterBanner.jsx';

export default function TrashView() {
  const {
    notes,
    counts,
    loading,
    error,
    viewMode,
    setViewMode,
    setDeleteDialog,
    isFiltering,
    clearFilters,
    allNotesData,
  } = useNotes();
  const totalTrashCount = counts.trash;
  const matchingTrashCount = notes.length;

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
              {totalTrashCount} {totalTrashCount === 1 ? 'note' : 'notes'} in trash
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
            Notes discarded within the last 30 days. Items here can be restored to your active library or permanently removed into the void.
          </p>
        </div>

        {/* Quick Stats Metric Pill */}
        <div className="flex items-center gap-space-md self-start sm:self-auto bg-surface-container-low px-space-md py-space-sm rounded-xl">
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">
              Reclaimable
            </span>
            <span className="font-title-md text-title-md text-primary">
              {totalTrashCount} {totalTrashCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">auto_delete</span>
          </div>
        </div>
      </header>

      {/* Editorial Info Banner with Subtle Terracotta Warmth */}
      <div className="w-full bg-secondary-fixed/30 rounded-xl p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm mb-space-md border border-secondary-fixed/50">
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

        {totalTrashCount > 0 && (
          <div className="flex items-center gap-space-sm shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setDeleteDialog({ type: 'empty_trash' })}
              className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-lowest text-secondary hover:bg-secondary hover:text-on-secondary transition-colors font-label-md text-label-md shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
              <span>Empty Trash ({totalTrashCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Search / Filter Banner if any */}
      <FilterBanner />

      {/* Loading */}
      {loading && allNotesData.length === 0 && (
        <div className="flex items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl animate-spin text-primary">
            progress_activity
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-error font-body-sm text-body-sm mb-4">
          Error loading notes: {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && matchingTrashCount === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-secondary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl">
              {isFiltering ? 'search_off' : 'delete_outline'}
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            {isFiltering ? 'No matching notes in trash' : 'Trash is clean'}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
            {isFiltering
              ? 'No notes in trash match your current search or filters. Try adjusting your query or resetting filters.'
              : 'No discarded drafts or deleted notes found. Items moved to trash stay here for 30 days before permanent deletion.'}
          </p>
          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">filter_alt_off</span>
              <span>Reset Search & Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Trash Grid */}
      {!loading && matchingTrashCount > 0 && (
        <section className="flex flex-col gap-space-md">
          {isFiltering && (
            <div className="flex items-center gap-space-xs pt-1">
              <span className="material-symbols-outlined text-primary text-lg">search_check</span>
              <h2 className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                Matching Trash Notes ({matchingTrashCount})
              </h2>
            </div>
          )}
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-space-md'
                : 'flex flex-col gap-space-sm'
            }
          >
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} isListView={viewMode === 'list'} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
