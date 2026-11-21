import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import { formatRelativeDate, getDaysRemainingInTrash, NOTE_COLORS } from '../utils/formatDate.js';

export default function NoteCard({ note, isListView = false }) {
  const {
    openEditModal,
    togglePin,
    toggleArchive,
    deleteNote,
    restoreNote,
    setDeleteDialog,
    setSelectedTag,
    activeView,
  } = useNotes();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const colorMeta = NOTE_COLORS[note.color] || NOTE_COLORS.default;
  const isTrash = Boolean(note.isTrash || note.isDeleted || activeView === 'trash');
  const isArchived = Boolean(note.isArchived);

  // Clean markdown for excerpt preview
  const plainTextExcerpt = (note.content || '')
    .replace(/#+\s+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/g, '')
    .trim();

  const primaryCategory = note.tags?.[0] || 'General';

  return (
    <article
      tabIndex={isTrash ? undefined : 0}
      role={isTrash ? undefined : 'button'}
      aria-label={isTrash ? undefined : `Open note: ${note.title || 'Untitled Note'}`}
      onClick={() => {
        if (!isTrash) openEditModal(note);
      }}
      onKeyDown={(e) => {
        if (!isTrash && (e.key === 'Enter' || e.key === ' ')) {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            openEditModal(note);
          }
        }
      }}
      className={`group relative flex flex-col justify-between bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-surface-container cursor-pointer ${
        menuOpen ? 'z-30' : 'hover:z-10'
      } ${
        isListView ? 'p-space-md sm:flex-row sm:items-center gap-space-md' : 'p-space-md'
      }`}
    >
      {/* Left Colored Accent Strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition-colors pointer-events-none"
        style={{ backgroundColor: `var(--note-accent-${note.color || 'default'}, ${colorMeta.accent})` }}
      ></div>

      <div className={`flex flex-col gap-space-sm pl-2 ${isListView ? 'flex-1 min-w-0' : ''}`}>
        {/* Top Meta Header */}
        <div className="flex items-start justify-between gap-space-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (note.tags?.[0]) setSelectedTag(note.tags[0]);
              }}
              className="px-2.5 py-1 rounded-full text-caption font-caption font-medium transition-colors hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: `color-mix(in srgb, var(--note-accent-${note.color || 'default'}, ${colorMeta.accent}) 18%, transparent)`,
                color: `var(--note-accent-${note.color || 'default'}, ${colorMeta.accent})`,
              }}
            >
              {primaryCategory}
            </span>

            {isArchived && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-caption bg-surface-container text-on-surface-variant"
                title="Archived note"
              >
                <span className="material-symbols-outlined text-xs">archive</span>
                <span>Archived</span>
              </span>
            )}
          </div>

          {/* Pin & Card Options Menu */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {!isTrash && (
              <button
                type="button"
                onClick={() => togglePin(note.id || note._id)}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  note.isPinned
                    ? 'text-secondary'
                    : 'text-on-surface-variant/40 hover:text-on-surface'
                }`}
                title={note.isPinned ? 'Unpin note' : 'Pin note'}
                aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
              >
                <span
                  className={`material-symbols-outlined text-base ${
                    note.isPinned ? 'material-symbols-filled' : ''
                  }`}
                >
                  push_pin
                </span>
              </button>
            )}

            {/* Menu Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors cursor-pointer"
                title="Options"
                aria-label="Note options"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <span className="material-symbols-outlined text-lg leading-none">more_horiz</span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container py-1.5 z-50 animate-in fade-in select-none text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!isTrash ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          openEditModal(note);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-on-surface hover:bg-surface-container font-body-sm text-body-sm transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        <span>Edit Note</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          togglePin(note.id || note._id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-on-surface hover:bg-surface-container font-body-sm text-body-sm transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">push_pin</span>
                        <span>{note.isPinned ? 'Unpin' : 'Pin to top'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          toggleArchive(note.id || note._id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-on-surface hover:bg-surface-container font-body-sm text-body-sm transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">archive</span>
                        <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
                      </button>
                      <div className="h-px bg-surface-container my-1"></div>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          deleteNote(note.id || note._id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-error hover:bg-error-container/40 font-body-sm text-body-sm transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                        <span>Delete Note</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          restoreNote(note.id || note._id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-primary hover:bg-surface-container font-body-sm text-body-sm transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          settings_backup_restore
                        </span>
                        <span>Restore Note</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setDeleteDialog({ note, type: 'permanent' });
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-error hover:bg-error-container/40 font-body-sm text-body-sm transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete_forever
                        </span>
                        <span>Delete Permanently</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note Headline Title */}
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium group-hover:text-primary transition-colors leading-snug line-clamp-2 break-words">
          {note.title || 'Untitled Note'}
        </h3>

        {/* Note Excerpt */}
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed line-clamp-3 break-words">
          {plainTextExcerpt || <span className="italic text-outline">Empty note...</span>}
        </p>
      </div>

      {/* Bottom Footer Section */}
      <div
        className={`flex flex-col gap-space-xs pt-space-md pl-2 mt-auto ${
          isListView ? 'sm:mt-0 sm:pt-0 sm:items-end' : ''
        }`}
      >
        {/* Tags Row */}
        {Array.isArray(note.tags) && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                role="button"
                tabIndex={0}
                aria-label={`Filter by tag ${tag}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTag(tag);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedTag(tag);
                  }
                }}
                className="font-caption text-caption text-on-surface-variant bg-surface-container-low hover:bg-surface-container px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Trash Status Bar */}
        {isTrash && (
          <div className="w-full pt-2 border-t border-surface-container text-outline font-caption text-caption flex items-center justify-between">
            <span>Purge in {getDaysRemainingInTrash(note.deletedAt)}d</span>
            <div className="w-16 bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full"
                style={{
                  width: `${Math.round(((30 - getDaysRemainingInTrash(note.deletedAt)) / 30) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Trash Action Buttons or Updated Timestamp */}
        {isTrash ? (
          <div
            className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container/60 mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => restoreNote(note.id || note._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary bg-primary-fixed/40 hover:bg-primary-fixed transition-colors font-label-sm text-label-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
              <span>Restore</span>
            </button>
            <button
              type="button"
              onClick={() => setDeleteDialog({ note, type: 'permanent' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-error bg-error-container/30 hover:bg-error-container transition-colors font-label-sm text-label-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              <span>Delete Permanently</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-on-surface-variant font-caption text-caption pt-1">
            <span className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-xs">schedule</span>
              <span>Updated {formatRelativeDate(note.updatedAt)}</span>
            </span>
            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity text-primary">
              arrow_forward
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
