import React, { useRef, useEffect, useState } from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const {
    searchQuery,
    setSearchQuery,
    profile,
    activeView,
    setActiveView,
    setIsMobileNavOpen,
  } = useNotes();
  const { theme, toggleTheme, isDark } = useTheme();
  const searchInputRef = useRef(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Global keyboard shortcut: Ctrl+K / Cmd+K focuses search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-[248px] right-0 h-[72px] bg-surface/85 backdrop-blur-xl z-30 flex items-center justify-between px-3 sm:px-6 lg:px-8 border-b border-surface-container/60 shadow-sm transition-all duration-200">
        {/* Mobile Menu Toggle & Brand Icon */}
        <div className="flex items-center gap-1 sm:gap-2 mr-2">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <div
            onClick={() => setActiveView('all')}
            className="lg:hidden flex items-center gap-1.5 cursor-pointer select-none"
            title="Hearth Notes"
          >
            <div className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-serif text-base font-bold shadow-sm">
              H
            </div>
            <span className="hidden sm:inline font-headline-sm text-base text-primary font-medium tracking-tight">
              Hearth
            </span>
          </div>
        </div>

        {/* Search Bar Container */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-xl pointer-events-none">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim() && activeView !== 'all') {
                  setActiveView('all');
                }
              }}
              placeholder="Search notes, tags, ideas..."
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-24 py-2 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:ring-1 focus:ring-primary shadow-sm border border-surface-container/60 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            ) : (
              <div className="absolute right-2.5 hidden sm:flex items-center px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption pointer-events-none">
                Ctrl + K
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Profile Avatar */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-space-sm shrink-0">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all cursor-pointer relative"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (Current: ${theme})`}
            aria-label="Toggle Theme"
          >
            <span className="material-symbols-outlined text-xl transition-transform duration-300 hover:rotate-45">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Quick Help Dialog Trigger */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            title="Shortcuts & System Help"
            aria-label="Help"
          >
            <span className="material-symbols-outlined text-xl">help_outline</span>
          </button>

          {/* Author Avatar with Online Indicator */}
          <div
            className="relative cursor-pointer ml-1"
            onClick={() => setActiveView('settings')}
            title="Profile & Settings"
          >
            <img
              alt={profile.displayName || 'Author'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/20 hover:ring-primary-container transition-all"
              src={profile.avatarUrl}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface"></span>
          </div>
        </div>
      </header>

      {/* Help & Shortcuts Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 bg-[#2b322a]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-6 flex flex-col gap-4 text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-primary">Hearth Notes Help</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <p>
                <strong className="text-on-surface">Hearth Notes</strong> is a quiet, contemplative knowledge base and note-taking environment crafted for deep research, writing, and reflection.
              </p>

              <div className="bg-surface-container-low p-3 rounded-xl space-y-2">
                <div className="text-xs uppercase font-semibold text-primary">Keyboard Shortcuts</div>
                <div className="flex items-center justify-between">
                  <span>Global Search</span>
                  <kbd className="px-2 py-0.5 rounded bg-surface-container font-mono text-xs text-on-surface">Ctrl + K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dismiss Dialogs</span>
                  <kbd className="px-2 py-0.5 rounded bg-surface-container font-mono text-xs text-on-surface">Esc</kbd>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl space-y-1">
                <div className="text-xs uppercase font-semibold text-tertiary">CE1 Architecture</div>
                <p className="text-xs">
                  Full Stack React + Express running with durable File System JSON persistence, color whitelisting, and tag classification.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
