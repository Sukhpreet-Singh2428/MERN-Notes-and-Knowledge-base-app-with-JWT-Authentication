import React from 'react';
import { useNotes } from '../context/NotesContext.jsx';

export default function Sidebar() {
  const {
    activeView,
    setActiveView,
    counts,
    openCreateModal,
    profile,
    setSelectedTag,
    setSearchQuery,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useNotes();

  const handleNavClick = (view) => {
    setActiveView(view);
    setSearchQuery('');
    if (view !== 'tags') {
      setSelectedTag(null);
    }
    setIsMobileNavOpen(false);
  };

  const handleCreateNote = () => {
    openCreateModal();
    setIsMobileNavOpen(false);
  };

  const navItems = [
    { id: 'all', label: 'All Notes', icon: 'description', count: counts.all },
    { id: 'pinned', label: 'Pinned', icon: 'push_pin', count: counts.pinned },
    { id: 'archived', label: 'Archived', icon: 'archive', count: counts.archived },
    { id: 'trash', label: 'Trash', icon: 'delete', count: counts.trash },
    { id: 'tags', label: 'Tags', icon: 'label', count: counts.tags },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-[#171d16]/50 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Navigation Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-[280px] lg:w-[248px] bg-surface-container-low flex flex-col justify-between p-space-md z-50 lg:z-40 shadow-xl lg:shadow-[0_1px_8px_rgba(48,55,47,0.04)] select-none border-r border-surface-container transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-space-md">
          {/* Brand Logo & Mobile Close Trigger */}
          <div className="flex items-center justify-between px-space-xs">
            <div
              className="flex items-center gap-space-sm cursor-pointer"
              onClick={() => handleNavClick('all')}
            >
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-serif text-lg font-bold shadow-sm">
                H
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none">
                  Hearth Notes
                </span>
                <span className="font-caption text-caption text-on-surface-variant">
                  Your quiet space for ideas
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Primary Action: New Note Button */}
          <button
            onClick={handleCreateNote}
            className="w-full flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-[0_1px_2px_rgba(48,55,47,0.12)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none">add</span>
            <span>New Note</span>
          </button>

          {/* Primary Navigation List */}
          <nav className="flex flex-col gap-space-xs" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-label-md'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
                  }`}
                >
                  <span className="flex items-center gap-space-sm">
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isActive && item.id === 'pinned' ? 'material-symbols-filled text-secondary' : ''
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  <span
                    className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Section: Settings & Author Profile Card */}
        <div className="flex flex-col gap-space-sm pt-space-sm">
          <div className="h-px w-full bg-surface-container-high"></div>

          <nav className="flex flex-col">
            <button
              onClick={() => handleNavClick('settings')}
              className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors cursor-pointer text-left ${
                activeView === 'settings'
                  ? 'bg-primary-container text-on-primary font-label-md'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
              }`}
            >
              <span className="material-symbols-outlined text-xl">settings</span>
              <span>Settings</span>
            </button>
          </nav>

          {/* Profile Card */}
          <div
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-space-sm p-space-xs rounded-xl bg-surface-container-lowest shadow-[0_1px_3px_-1px_rgba(48,55,47,0.03)] cursor-pointer hover:bg-surface-container-high transition-colors"
            title="Open Profile Settings"
          >
            <img
              alt={profile.displayName || 'Profile'}
              className="w-8 h-8 rounded-full object-cover"
              src={profile.avatarUrl}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface truncate">
                {profile.displayName || 'Elena Rostova'}
              </span>
              <span className="font-caption text-caption text-on-surface-variant truncate">
                {profile.bio || 'Writer & Researcher'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

