import React from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import NoteCard from '../components/NoteCard.jsx';

export default function PinnedView() {
  const { notes, counts, loading, viewMode, setViewMode, sort, setSort, openCreateModal } =
    useNotes();

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Editorial Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md pb-space-lg">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase">
            <span className="material-symbols-outlined text-secondary text-base material-symbols-filled">
              push_pin
            </span>
            <span>Priority Deck</span>
            <span className="text-outline-variant">•</span>
            <span className="font-caption text-caption text-secondary font-medium">
              {counts.pinned} pinned entries
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-normal">
            Pinned Notes
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Your high-priority working notes and active citations kept right at the surface.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-space-sm self-start md:self-auto">
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
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl animate-spin text-primary">
            progress_activity
          </span>
        </div>
      )}

      {/* Empty State */}
      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-secondary-fixed/40 flex items-center justify-center text-secondary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl material-symbols-filled">
              push_pin
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            No pinned notes
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
            Pin notes from your library to keep key research frameworks, active drafts, or essential reminders at your fingertips.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Create Pinned Note</span>
          </button>
        </div>
      )}

      {/* Pinned Grid / List */}
      {!loading && notes.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md'
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
