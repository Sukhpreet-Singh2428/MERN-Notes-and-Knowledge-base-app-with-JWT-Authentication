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
  const { activeView } = useNotes();

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
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      {/* Fixed Left Navigation Drawer */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="pl-[248px]">
        {/* Fixed Top Header */}
        <Header />

        {/* Dynamic Editorial Content Horizon */}
        <main className="w-full pt-[72px] px-gutter max-w-[1400px] mx-auto min-h-screen">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <NoteModal />
      <DeleteModal />
      <Toast />
    </div>
  );
}
