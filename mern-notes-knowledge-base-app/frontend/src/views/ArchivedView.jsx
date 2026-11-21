import React from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import NoteCard from '../components/NoteCard.jsx';
import FilterBanner from '../components/FilterBanner.jsx';

export default function ArchivedView() {
  const {
    notes,
    counts,
    loading,
    error,
    viewMode,
    setViewMode,
    sort,
    setSort,
    openCreateModal,
    isFiltering,
    clearFilters,
    allNotesData,
  } = useNotes();

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Editorial Header Section */}
      <header className="relative mb-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-caption text-caption tracking-widest uppercase text-tertiary font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Quiet Storage & Retrospectives
              </span>
              <span className="text-outline-variant font-caption text-caption">•</span>
              <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                {counts.archived} archived notes
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Archived Notes
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
              Completed projects, past research logs, and reference material tucked away from your daily focus.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container-low shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">inventory_2</span>
              </div>
              <div className="flex flex-col">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">
                  Vault Retention
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {counts.archived} Stored
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="p-2.5 bg-surface-container-low/70 backdrop-blur rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-caption text-caption uppercase text-on-surface-variant font-semibold pl-2">
              Archived Index
            </span>
          </div>

          <div className="flex items-center gap-space-sm ml-auto">
            {/* Sort */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm shadow-sm border border-surface-container/60">
              <span className="material-symbols-outlined text-base text-primary">swap_vert</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-on-surface font-medium outline-none cursor-pointer pr-1 text-label-sm"
              >
                <option value="updated_desc">Updated: Newest</option>
                <option value="updated_asc">Updated: Oldest</option>
                <option value="created_desc">Created: Newest</option>
                <option value="title_asc">Title: A–Z</option>
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-surface-container-lowest p-0.5 rounded-xl shadow-sm border border-surface-container/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-surface-container text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Grid View"
              >
                <span className="material-symbols-outlined text-base">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-surface-container text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="List View"
              >
                <span className="material-symbols-outlined text-base">view_agenda</span>
              </button>
            </div>
          </div>
        </div>
      </header>

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
      {!loading && !error && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-tertiary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl">
              {isFiltering ? 'search_off' : 'archive'}
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            {isFiltering ? 'No matching archived notes' : 'Archive is empty'}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
            {isFiltering
              ? 'No archived notes match your current search or filters. Try adjusting your query or resetting filters.'
              : 'Archive completed projects and older references to keep your main dashboard uncluttered while keeping full search accessibility.'}
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

      {/* Archive Grid / List */}
      {!loading && notes.length > 0 && (
        <section className="flex flex-col gap-space-md">
          {isFiltering && (
            <div className="flex items-center gap-space-xs pt-1">
              <span className="material-symbols-outlined text-primary text-lg">search_check</span>
              <h2 className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                Matching Archived Notes ({notes.length})
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
