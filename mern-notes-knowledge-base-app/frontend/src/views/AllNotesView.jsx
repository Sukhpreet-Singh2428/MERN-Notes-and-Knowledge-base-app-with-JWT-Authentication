import React from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import NoteCard from '../components/NoteCard.jsx';
import { NOTE_COLORS } from '../utils/formatDate.js';

export default function AllNotesView() {
  const {
    notes,
    counts,
    loading,
    error,
    selectedTag,
    setSelectedTag,
    selectedColor,
    setSelectedColor,
    sort,
    setSort,
    viewMode,
    setViewMode,
    openCreateModal,
    searchQuery,
    setSearchQuery,
    tagsSummary,
  } = useNotes();

  const isFiltering = Boolean(searchQuery || selectedTag || selectedColor);

  // Separate pinned and unpinned notes when viewing default unfiltered library
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const otherNotes = notes.filter((n) => !n.isPinned);

  const topTags = tagsSummary.slice(0, 6);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Page Header & Ambient Context */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md pb-space-lg">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
            <span>Curated Archive</span>
            <span className="text-outline-variant">•</span>
            <span className="font-caption text-caption text-secondary">
              {counts.all} notes across {counts.tags} tags
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-normal">
            All Notes
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Your central library of research, journal entries, fleeting thoughts, and project drafts.
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-sm self-start md:self-auto">
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">
              Sync State
            </span>
            <span className="font-label-sm text-label-sm text-primary font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              Local Synced
            </span>
          </div>
          <div className="w-px h-7 bg-surface-container-high mx-1"></div>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">
              Active Notes
            </span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">
              {counts.all} records
            </span>
          </div>
        </div>
      </header>

      {/* Controls & Action Ribbon */}
      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md py-space-sm mb-space-lg bg-surface-container-low/70 backdrop-blur rounded-2xl p-space-sm">
        {/* Filter Chips */}
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedTag === null
                ? 'bg-surface-container text-primary font-semibold'
                : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-base">auto_stories</span>
            <span>All</span>
            <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-primary-container text-on-primary">
              {counts.all}
            </span>
          </button>

          {topTags.map((item) => {
            const isSelected = selectedTag === item.tag;
            return (
              <button
                key={item.tag}
                type="button"
                onClick={() => setSelectedTag(isSelected ? null : item.tag)}
                className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary-container text-on-primary font-medium'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                #{item.tag}
              </button>
            );
          })}
        </div>

        {/* Dropdowns & Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-space-xs justify-end">
          {/* Note Color Filter */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
            <span className="material-symbols-outlined text-base text-secondary ml-1">palette</span>
            <button
              type="button"
              onClick={() => setSelectedColor(null)}
              className={`w-4 h-4 rounded-full border border-black/10 cursor-pointer ${
                selectedColor === null ? 'ring-2 ring-primary' : ''
              }`}
              title="All Colors"
              style={{ backgroundColor: '#ffffff' }}
            />
            {Object.entries(NOTE_COLORS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedColor(selectedColor === key ? null : key)}
                className={`w-4 h-4 rounded-full cursor-pointer transition-transform ${
                  selectedColor === key ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'
                }`}
                title={val.name}
                style={{ backgroundColor: val.swatch }}
              />
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <label className="sr-only" htmlFor="sort-notes">
              Sort notes
            </label>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm shadow-sm border border-surface-container/60">
              <span className="material-symbols-outlined text-base text-primary">swap_vert</span>
              <select
                id="sort-notes"
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
          </div>

          <div className="w-px h-6 bg-surface-container-high mx-1"></div>

          {/* View Switcher (Grid vs List) */}
          <div className="flex items-center bg-surface-container-lowest p-0.5 rounded-xl shadow-sm border border-surface-container/60">
            <button
              type="button"
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
              type="button"
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
      </section>

      {/* Active Search / Filter Banner if any */}
      {isFiltering && (
        <div className="flex items-center justify-between gap-2 p-3 mb-space-md rounded-xl bg-primary-fixed/40 text-primary font-body-sm text-body-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-base">filter_alt</span>
            <span>Filtering by:</span>
            {searchQuery && (
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium">
                Search: “{searchQuery}”
              </span>
            )}
            {selectedTag && (
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium">
                Tag: #{selectedTag}
              </span>
            )}
            {selectedColor && (
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium">
                Color: {NOTE_COLORS[selectedColor]?.name || selectedColor}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
              setSelectedColor(null);
            }}
            className="text-xs uppercase font-semibold hover:underline text-primary cursor-pointer shrink-0"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Loading & Error States */}
      {loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">
            progress_activity
          </span>
          <span className="font-body-md text-body-md">Searching your library...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-error font-body-sm text-body-sm mb-4">
          Error loading notes: {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl">note_add</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            No notes found
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
            {isFiltering
              ? 'No notes match your current search or filters. Try adjusting your query or resetting filters.'
              : 'Your canvas is clear. Capture your first thought, book summary, or research note.'}
          </p>
          {isFiltering ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
                setSelectedColor(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">filter_alt_off</span>
              <span>Reset Search & Filters</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Create New Note</span>
            </button>
          )}
        </div>
      )}

      {/* CASE A: Filtered / Search Results Section (Displays ALL matching notes) */}
      {!loading && isFiltering && notes.length > 0 && (
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-lg">
                search_check
              </span>
              <h2 className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                Matching Notes ({notes.length})
              </h2>
            </div>
          </div>

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
        </section>
      )}

      {/* CASE B: Default Unfiltered Dashboard (Pinned Deck + Other Notes) */}
      {!loading && !isFiltering && notes.length > 0 && (
        <>
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <section className="flex flex-col gap-space-md mb-space-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-lg material-symbols-filled">
                    push_pin
                  </span>
                  <h2 className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                    Pinned Notes
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption">
                    {pinnedNotes.length}
                  </span>
                </div>
              </div>

              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md'
                    : 'flex flex-col gap-space-sm'
                }
              >
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} isListView={viewMode === 'list'} />
                ))}
              </div>
            </section>
          )}

          {/* Other Notes Section */}
          {otherNotes.length > 0 && (
            <section className="flex flex-col gap-space-md">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-lg">
                      description
                    </span>
                    <h2 className="font-label-md text-label-md text-on-surface font-semibold tracking-wider uppercase">
                      Other Notes
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption">
                      {otherNotes.length}
                    </span>
                  </div>
                </div>
              )}

              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md'
                    : 'flex flex-col gap-space-sm'
                }
              >
                {otherNotes.map((note) => (
                  <NoteCard key={note.id} note={note} isListView={viewMode === 'list'} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
