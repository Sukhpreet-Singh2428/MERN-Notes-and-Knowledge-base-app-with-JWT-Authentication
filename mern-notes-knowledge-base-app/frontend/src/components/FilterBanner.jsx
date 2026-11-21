import React from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import { NOTE_COLORS } from '../utils/formatDate.js';

export default function FilterBanner() {
  const {
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    selectedColor,
    setSelectedColor,
    clearFilters,
    isFiltering,
  } = useNotes();

  if (!isFiltering) return null;

  return (
    <div className="flex items-center justify-between gap-2 p-3 mb-space-md rounded-xl bg-primary-fixed/40 text-primary font-body-sm text-body-sm shadow-xs border border-primary-container/10">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="material-symbols-outlined text-base">filter_alt</span>
        <span className="font-medium text-primary">Active filters:</span>

        {/* Search Query Pill */}
        {searchQuery.trim() && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium text-xs shadow-xs">
            <span className="text-on-surface-variant font-normal">Search:</span>
            <span>“{searchQuery.trim()}”</span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="hover:text-error text-on-surface-variant hover:text-on-surface flex items-center ml-0.5 cursor-pointer"
              title="Clear search query"
              aria-label="Clear search query"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        )}

        {/* Selected Tag Pill */}
        {selectedTag && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium text-xs shadow-xs">
            <span className="text-on-surface-variant font-normal">Tag:</span>
            <span className="text-primary font-medium">#{selectedTag}</span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="hover:text-error text-on-surface-variant hover:text-on-surface flex items-center ml-0.5 cursor-pointer"
              title="Clear tag filter"
              aria-label="Clear tag filter"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        )}

        {/* Selected Color Pill */}
        {selectedColor && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium text-xs shadow-xs">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-black/15"
              style={{ backgroundColor: NOTE_COLORS[selectedColor]?.swatch || '#ffffff' }}
            />
            <span className="text-on-surface-variant font-normal">Color:</span>
            <span>{NOTE_COLORS[selectedColor]?.name || selectedColor}</span>
            <button
              type="button"
              onClick={() => setSelectedColor(null)}
              className="hover:text-error text-on-surface-variant hover:text-on-surface flex items-center ml-0.5 cursor-pointer"
              title="Clear color filter"
              aria-label="Clear color filter"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        )}
      </div>

      {/* Combined Clear Action */}
      <button
        type="button"
        onClick={clearFilters}
        className="text-xs uppercase font-semibold hover:underline text-primary cursor-pointer shrink-0 ml-2"
        title="Clear all active filters"
      >
        Clear all filters
      </button>
    </div>
  );
}
