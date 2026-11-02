import React from 'react';
import { useNotes } from './context/NotesContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import NoteModal from './components/NoteModal.jsx';
import DeleteModal from './components/DeleteModal.jsx';
import Toast from './components/Toast.jsx';

import AllNotesView from './views/AllNotesView.jsx';
import PinnedView from './views/PinnedView.jsx';
import ArchivedView from './views/ArchivedView.jsx';
import TrashView from './views/TrashView.jsx';
import TagsView from './views/TagsView.jsx';
import SettingsView from './views/SettingsView.jsx';

export default function App() {
  const { activeView, openCreateModal } = useNotes();

  const renderActiveView = () => {
    switch (activeView) {
      case 'pinned':
        return <PinnedView />;
      case 'archived':
        return <ArchivedView />;
      case 'trash':
        return <TrashView />;
      case 'tags':
        return <TagsView />;
      case 'settings':
        return <SettingsView />;
      case 'all':
      default:
        return <AllNotesView />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased transition-colors duration-200">
      {/* Navigation Drawer (Desktop Fixed / Mobile Slide-in) */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="lg:pl-[248px] min-h-screen flex flex-col transition-all duration-200">
        {/* Fixed Top Header */}
        <Header />

        {/* Dynamic Editorial Content Horizon */}
        <main className="w-full pt-[72px] px-3.5 sm:px-6 lg:px-8 max-w-[1400px] mx-auto min-h-screen flex-1">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) for Quick Note Creation */}
      <button
        type="button"
        onClick={openCreateModal}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl hover:bg-primary-dark flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-surface"
        title="Create New Note"
        aria-label="Create New Note"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {/* Global Interactive Overlays */}
      <NoteModal />
      <DeleteModal />
      <Toast />
    </div>
  );
}

