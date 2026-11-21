import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useNotes } from './context/NotesContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import NoteModal from './components/NoteModal.jsx';
import DeleteModal from './components/DeleteModal.jsx';
import Toast from './components/Toast.jsx';

import LoginView from './views/LoginView.jsx';
import RegisterView from './views/RegisterView.jsx';

import AllNotesView from './views/AllNotesView.jsx';
import PinnedView from './views/PinnedView.jsx';
import ArchivedView from './views/ArchivedView.jsx';
import TrashView from './views/TrashView.jsx';
import TagsView from './views/TagsView.jsx';
import SettingsView from './views/SettingsView.jsx';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const { activeView, openCreateModal } = useNotes();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-serif text-2xl font-bold shadow-sm mb-4">
          H
        </div>
        <div className="flex items-center gap-2.5 text-on-surface-variant font-body-sm">
          <span className="material-symbols-outlined text-primary text-xl animate-spin">
            progress_activity
          </span>
          <span>Loading Hearth Notes...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterView onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginView onSwitchToRegister={() => setAuthView('register')} />;
  }

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
