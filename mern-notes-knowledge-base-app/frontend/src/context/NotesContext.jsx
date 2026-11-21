import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import notesApi from '../api/notesApi.js';
import { useAuth } from './AuthContext.jsx';

const NotesContext = createContext();

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzu77tUsTobDgPKPcxam-Jtqr4Fu8NI1cTkdcoLdWdQu4iOafb1bLOSdD2DT3Qpea3as5Qjhgv-L5ZdghXwY-iz8hTTt9GzMVkCdqD-ZYj9JyFIcV5Z2qW4hJJ0_x0U5hdldOjehtgUiVfd8tS8nE6qYFywwwFmbYzp9zMerxJNHLzUX0r5g8eXqavwE1Q0giuhAtn8bnLOjtv5kwrfoVfKS06pikJ5coQhrKKRn5GSQkUL6rGQpal';

export function NotesProvider({ children }) {
  const { user: authUser, isAuthenticated } = useAuth();

  const [notes, setNotes] = useState([]);
  const [activeView, setActiveView] = useState('all'); // 'all' | 'pinned' | 'archived' | 'trash' | 'tags' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sort, setSort] = useState('updated_desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [profile, setProfile] = useState(() => ({
    displayName: authUser?.displayName || '',
    bio: authUser?.bio || '',
    email: authUser?.email || '',
    avatarUrl: authUser?.avatarUrl || DEFAULT_AVATAR,
  }));

  // Synchronize profile state with authenticated user lifecycle
  useEffect(() => {
    if (authUser) {
      setProfile({
        displayName: authUser.displayName || '',
        bio: authUser.bio !== undefined ? authUser.bio : '',
        email: authUser.email || '',
        avatarUrl: authUser.avatarUrl || DEFAULT_AVATAR,
      });
    } else {
      setProfile({
        displayName: '',
        bio: '',
        email: '',
        avatarUrl: DEFAULT_AVATAR,
      });
    }
  }, [authUser]);

  // Mobile responsive drawer state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const toggleMobileNav = useCallback(() => {
    setIsMobileNavOpen((prev) => !prev);
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal states
  const [modalNote, setModalNote] = useState(null); // null or note object
  const [deleteDialog, setDeleteDialog] = useState(null); // null or { note, type: 'soft' | 'permanent' | 'empty_trash' }

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch author profile only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    notesApi
      .getProfile()
      .then((res) => {
        if (res.data) {
          setProfile((prev) => ({
            ...prev,
            ...res.data,
            avatarUrl: res.data.avatarUrl || prev.avatarUrl || DEFAULT_AVATAR,
          }));
        }
      })
      .catch((err) => {
        console.warn('Profile fetch warning:', err.message);
      });
  }, [isAuthenticated]);

  // Global counts across all states
  const [allNotesData, setAllNotesData] = useState([]);
  const refreshGlobalCounts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const [allActive, archived, trash] = await Promise.all([
        notesApi.getNotes({ view: 'all' }),
        notesApi.getNotes({ view: 'archived' }),
        notesApi.getNotes({ view: 'trash' }),
      ]);
      const combined = [
        ...(allActive.data || []),
        ...(archived.data || []),
        ...(trash.data || []),
      ];
      setAllNotesData(combined);
    } catch {
      // Ignore background badge error
    }
  }, [isAuthenticated]);

  // Fetch notes from backend
  const loadNotes = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      // Determine view param for backend
      let backendView = 'all';
      if (activeView === 'pinned') backendView = 'pinned';
      if (activeView === 'archived') backendView = 'archived';
      if (activeView === 'trash') backendView = 'trash';

      const params = {
        view: backendView,
        sort,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedTag) {
        params.tag = selectedTag;
      }
      if (selectedColor) {
        params.color = selectedColor;
      }

      const res = await notesApi.getNotes(params);
      setNotes(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeView, searchQuery, selectedTag, selectedColor, sort]);

  // Only load notes when authenticated; clear state completely when logged out
  useEffect(() => {
    if (isAuthenticated) {
      loadNotes();
    } else {
      setNotes([]);
      setAllNotesData([]);
      setActiveView('all');
      setSearchQuery('');
      setSelectedTag(null);
      setSelectedColor(null);
      setModalNote(null);
      setDeleteDialog(null);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, loadNotes]);

  // Initial count load upon authentication (mutations refresh explicitly)
  useEffect(() => {
    if (isAuthenticated) {
      refreshGlobalCounts();
    }
  }, [isAuthenticated, refreshGlobalCounts]);

  // Compute live counts
  const counts = useMemo(() => {
    let all = 0;
    let pinned = 0;
    let archived = 0;
    let trash = 0;
    const tagsSet = new Set();

    allNotesData.forEach((n) => {
      const isTrashed = Boolean(n.isTrash || n.isDeleted);
      const isArchived = Boolean(n.isArchived);

      if (isTrashed) {
        trash += 1;
      } else if (isArchived) {
        archived += 1;
      } else {
        all += 1;
        if (n.isPinned) pinned += 1;
        if (Array.isArray(n.tags)) {
          n.tags.forEach((t) => tagsSet.add(t.toLowerCase()));
        }
      }
    });

    return {
      all,
      pinned,
      archived,
      trash,
      tags: tagsSet.size,
    };
  }, [allNotesData]);

  // Tag taxonomy summary for Tags Library view
  const tagsSummary = useMemo(() => {
    const map = new Map();
    allNotesData
      .filter((n) => !(n.isTrash || n.isDeleted) && !n.isArchived)
      .forEach((note) => {
        if (Array.isArray(note.tags)) {
          note.tags.forEach((t) => {
            const key = t.toLowerCase();
            if (!map.has(key)) {
              map.set(key, { tag: key, count: 0, notes: [] });
            }
            const item = map.get(key);
            item.count += 1;
            if (item.notes.length < 3) {
              item.notes.push(note);
            }
          });
        }
      });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allNotesData]);

  // Note actions
  const createNote = async (noteData) => {
    try {
      const res = await notesApi.createNote(noteData);
      showToast('Note created successfully', 'success');
      setModalNote(null);
      await loadNotes();
      await refreshGlobalCounts();
      return res.data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      const targetId = id || (noteData && (noteData.id || noteData._id));
      const res = await notesApi.updateNote(targetId, noteData);
      showToast('Note updated', 'success');
      setModalNote(null);
      await loadNotes();
      await refreshGlobalCounts();
      return res.data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const togglePin = async (id) => {
    try {
      const res = await notesApi.togglePin(id);
      const isPinned = res.data?.isPinned;
      showToast(isPinned ? 'Note pinned to top' : 'Note unpinned', 'info');
      await loadNotes();
      await refreshGlobalCounts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleArchive = async (id) => {
    try {
      const res = await notesApi.toggleArchive(id);
      const isArchived = res.data?.isArchived;
      showToast(isArchived ? 'Note moved to archive' : 'Note restored from archive', 'info');
      await loadNotes();
      await refreshGlobalCounts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteNote = async (id) => {
    try {
      await notesApi.softDelete(id);
      showToast('Note moved to Trash', 'info');
      setDeleteDialog(null);
      await loadNotes();
      await refreshGlobalCounts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const restoreNote = async (id) => {
    try {
      await notesApi.restoreNote(id);
      showToast('Note restored to library', 'success');
      await loadNotes();
      await refreshGlobalCounts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const permanentDelete = async (id) => {
    try {
      await notesApi.permanentDelete(id);
      showToast('Note permanently removed', 'info');
      setDeleteDialog(null);
      await loadNotes();
      await refreshGlobalCounts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const emptyTrash = async () => {
    try {
      const trashNotes = allNotesData.filter((n) => n.isTrash || n.isDeleted);
      await Promise.all(trashNotes.map((n) => notesApi.permanentDelete(n.id || n._id)));
      showToast('Trash emptied permanently', 'info');
      setDeleteDialog(null);
      await loadNotes();
      await refreshGlobalCounts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateAuthorProfile = async (profileData) => {
    try {
      const res = await notesApi.updateProfile(profileData);
      setProfile((prev) => ({
        ...prev,
        ...res.data,
        avatarUrl: res.data?.avatarUrl || prev.avatarUrl || DEFAULT_AVATAR,
      }));
      showToast('Preferences saved successfully', 'success');
      return res.data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const openCreateModal = () => {
    setModalNote({
      isNew: true,
      title: '',
      content: '',
      tags: selectedTag ? [selectedTag] : [],
      color: selectedColor || 'default',
      isPinned: activeView === 'pinned',
    });
  };

  const openEditModal = (note) => {
    setModalNote({ ...note, isNew: false, id: note.id || note._id });
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        selectedColor,
        setSelectedColor,
        sort,
        setSort,
        viewMode,
        setViewMode,
        profile,
        loading,
        error,
        toast,
        counts,
        tagsSummary,
        modalNote,
        setModalNote,
        deleteDialog,
        setDeleteDialog,
        loadNotes,
        refreshGlobalCounts,
        createNote,
        updateNote,
        togglePin,
        toggleArchive,
        deleteNote,
        restoreNote,
        permanentDelete,
        emptyTrash,
        updateAuthorProfile,
        openCreateModal,
        openEditModal,
        isMobileNavOpen,
        setIsMobileNavOpen,
        toggleMobileNav,
        showToast,
        hideToast,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
