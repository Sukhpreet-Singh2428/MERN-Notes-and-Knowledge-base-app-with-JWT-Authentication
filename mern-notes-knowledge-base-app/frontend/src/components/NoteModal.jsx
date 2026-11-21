import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNotes } from '../context/NotesContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { NOTE_COLORS } from '../utils/formatDate.js';

export default function NoteModal() {
  const { modalNote, setModalNote, createNote, updateNote, deleteNote, toggleArchive } = useNotes();
  const { editorFont } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (modalNote) {
      setTitle(modalNote.title || '');
      setContent(modalNote.content || '');
      setTags(Array.isArray(modalNote.tags) ? [...modalNote.tags] : []);
      setColor(modalNote.color || 'default');
      setIsPinned(Boolean(modalNote.isPinned));
      setIsArchived(Boolean(modalNote.isArchived));
      setActiveTab('write');
      setHasUnsavedChanges(false);
      setValidationError(null);
      setSaveError(null);

      // Auto-focus title on open
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [modalNote]);

  // Close on Escape key press
  useEffect(() => {
    if (!modalNote) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) {
        setModalNote(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalNote, saving, setModalNote]);

  if (!modalNote) return null;

  const colorMeta = NOTE_COLORS[color] || NOTE_COLORS.default;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setHasUnsavedChanges(true);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (saving) return;

    if (!title.trim()) {
      setValidationError('Title is required to save a note.');
      titleInputRef.current?.focus();
      return;
    }

    if (title.trim().length > 200) {
      setValidationError('Title must be 200 characters or fewer.');
      titleInputRef.current?.focus();
      return;
    }

    try {
      setSaving(true);
      setValidationError(null);
      setSaveError(null);
      const payload = {
        title: title.trim(),
        content,
        tags,
        color,
        isPinned,
        isArchived,
      };

      if (modalNote.isNew) {
        await createNote(payload);
      } else {
        await updateNote(modalNote.id || modalNote._id, payload);
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save note. Please check inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const getFontFamilyClass = () => {
    if (editorFont === 'newsreader') return 'font-serif';
    if (editorFont === 'jetbrains-mono') return 'font-mono';
    return 'font-sans';
  };

  return (
    <div
      className="fixed inset-0 bg-[#171d16]/50 dark:bg-black/75 backdrop-blur-[6px] z-50 flex items-center justify-center p-2.5 sm:p-space-md overflow-y-auto animate-in fade-in"
      onClick={() => setModalNote(null)}
    >
      <section
        aria-labelledby="editor-title"
        aria-modal="true"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[780px] my-auto bg-surface-container-lowest rounded-2xl sm:rounded-[20px] shadow-2xl border border-surface-container flex flex-col overflow-hidden relative max-h-[94vh] sm:max-h-[90vh]"
      >
        {/* Left Color Accent Strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300"
          style={{ backgroundColor: `var(--note-accent-${color || 'default'}, ${colorMeta.accent})` }}
        ></div>

        {/* Top Header Row */}
        <header className="px-4 sm:px-space-lg pt-3 sm:pt-space-md pb-2.5 sm:pb-space-sm flex items-center justify-between pl-5 sm:pl-7 border-b border-surface-container/60">
          <div className="flex items-center gap-2 sm:gap-space-sm">
            <button
              type="button"
              onClick={() => setModalNote(null)}
              aria-label="Close modal"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-sm">
                {modalNote.isNew ? 'post_add' : 'edit_note'}
              </span>
              <span>{modalNote.isNew ? 'New Note' : 'Editing Note'}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-space-md">
            <div className="hidden sm:flex items-center gap-1.5 font-caption text-caption text-outline">
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  hasUnsavedChanges ? 'bg-secondary animate-pulse' : 'bg-primary-container'
                }`}
              ></span>
              <span>{hasUnsavedChanges ? 'Unsaved edits' : 'Synced'}</span>
            </div>

            {/* Archive State Toggle in Edit Mode */}
            {!modalNote.isNew && (
              <button
                type="button"
                onClick={() => {
                  setIsArchived(!isArchived);
                  setHasUnsavedChanges(true);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-colors cursor-pointer ${
                  isArchived
                    ? 'bg-surface-container-highest text-on-surface font-medium'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
                title={isArchived ? 'Note is archived' : 'Archive note'}
                aria-label={isArchived ? 'Note is archived' : 'Archive note'}
              >
                <span className="material-symbols-outlined text-base">archive</span>
                <span className="font-medium">{isArchived ? 'Archived' : 'Archive'}</span>
              </button>
            )}

            {/* Pinned State Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsPinned(!isPinned);
                setHasUnsavedChanges(true);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-colors cursor-pointer ${
                isPinned
                  ? 'bg-secondary-fixed text-on-secondary-container'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              title={isPinned ? 'Note is pinned' : 'Pin note'}
              aria-label={isPinned ? 'Note is pinned' : 'Pin note'}
            >
              <span
                className={`material-symbols-outlined text-base ${
                  isPinned ? 'material-symbols-filled text-secondary' : ''
                }`}
              >
                push_pin
              </span>
              <span className="font-medium">{isPinned ? 'Pinned' : 'Pin'}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Body Canvas */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Note Title Field */}
          <div className="px-4 sm:px-space-lg pt-3 sm:pt-space-md pb-1 sm:pb-space-xs pl-5 sm:pl-7">
            <input
              ref={titleInputRef}
              type="text"
              id="editor-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
                if (validationError) setValidationError(null);
                if (saveError) setSaveError(null);
              }}
              placeholder="Note title (required)..."
              aria-label="Note title"
              className="w-full font-headline-md text-xl sm:text-headline-md text-on-surface placeholder:text-outline-variant bg-transparent outline-none py-1"
            />
          </div>

          {/* Validation or Save Error Banner */}
          {(validationError || saveError) && (
            <div className="mx-4 sm:mx-space-lg ml-5 sm:ml-7 mb-2 px-3 py-1.5 rounded-lg bg-error-container text-error font-body-sm text-xs flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">
                  {validationError ? 'warning' : 'error'}
                </span>
                <span>{validationError || saveError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setSaveError(null);
                }}
                className="hover:opacity-80 p-0.5 rounded cursor-pointer"
                aria-label="Dismiss message"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          )}

          {/* Metadata & Classification Row */}
          <div className="px-4 sm:px-space-lg py-2.5 pl-5 sm:pl-7 flex flex-wrap items-center justify-between gap-y-2.5 gap-x-space-md bg-surface-container-low/50 border-y border-surface-container/60">
            {/* Tag System */}
            <div className="flex items-center flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-primary-fixed/60 text-primary font-caption text-caption"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="hover:text-error transition-colors flex items-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}

              {/* Tag Input Pill */}
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-caption text-caption shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-xs">add</span>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add Tag"
                  aria-label="Add new tag"
                  className="bg-transparent outline-none w-20 text-on-surface placeholder:text-outline text-caption py-0.5"
                />
              </div>
            </div>

            {/* Note Color Swatches (Physical Paper Tones) */}
            <div className="flex items-center gap-1.5" aria-label="Note accent color">
              {Object.entries(NOTE_COLORS).map(([key, val]) => {
                const isSelected = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={val.name}
                    aria-label={`Select color ${val.name}`}
                    onClick={() => {
                      setColor(key);
                      setHasUnsavedChanges(true);
                    }}
                    style={{ backgroundColor: val.swatch }}
                    className={`w-6 h-6 rounded-full shadow-sm hover:scale-110 transition-transform relative focus:outline-none flex items-center justify-center cursor-pointer border ${
                      isSelected ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'border-black/10'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-xs text-primary leading-none">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Mode Tabs (Write vs Preview) */}
          <div className="px-4 sm:px-space-lg pl-5 sm:pl-7 pt-2 flex items-center justify-between text-caption font-caption text-on-surface-variant">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'write'
                    ? 'bg-surface-container text-primary font-medium'
                    : 'hover:text-on-surface'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-surface-container text-primary font-medium'
                    : 'hover:text-on-surface'
                }`}
              >
                Markdown Preview
              </button>
            </div>

            <div className="hidden sm:block text-outline text-xs">
              Supports Markdown (**bold**, _italic_, lists, code)
            </div>
          </div>

          {/* Main Content Area */}
          <div className="px-4 sm:px-space-lg py-space-sm pl-5 sm:pl-7 flex-1 min-h-[200px] sm:min-h-[240px]">
            {activeTab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Begin your reflection, draft, citation, or observation..."
                aria-label="Note content"
                rows={10}
                className={`w-full h-full min-h-[200px] sm:min-h-[240px] bg-transparent outline-none resize-none font-body-md text-body-md text-on-surface placeholder:text-outline-variant leading-relaxed ${getFontFamilyClass()}`}
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none min-h-[200px] sm:min-h-[240px] py-1 text-on-surface leading-relaxed">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="italic text-outline">Nothing to preview yet...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <footer className="px-4 sm:px-space-lg py-2.5 sm:py-space-sm pl-5 sm:pl-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-0 border-t border-surface-container bg-surface-container-low/40">
          <div className="flex items-center gap-space-md text-caption font-caption text-outline">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>~{readingTime} min read</span>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-space-sm">
            {!modalNote.isNew && (
              <button
                type="button"
                onClick={() => {
                  deleteNote(modalNote.id || modalNote._id);
                  setModalNote(null);
                }}
                className="px-3 py-2 rounded-lg text-error hover:bg-error-container/40 font-label-md text-label-md transition-colors cursor-pointer"
              >
                Move to Trash
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalNote(null)}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-dark font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>{saving ? 'Saving...' : modalNote.isNew ? 'Create Note' : 'Save Changes'}</span>
            </button>
          </div>
        </footer>
      </section>
    </div>
  );

}
