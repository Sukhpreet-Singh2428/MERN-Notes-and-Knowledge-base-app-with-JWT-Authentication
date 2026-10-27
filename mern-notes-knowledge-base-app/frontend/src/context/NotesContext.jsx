import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import notesApi from '../api/notesApi.js';

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [activeView, setActiveView] = useState('all'); // 'all' | 'pinned' | 'archived' | 'trash' | 'tags' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sort, setSort] = useState('updated_desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [profile, setProfile] = useState({
    displayName: 'Elena Rostova',
    bio: 'Writer & Botanical Researcher',
    email: 'elena.rostova@hearthnotes.local',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzu77tUsTobDgPKPcxam-Jtqr4Fu8NI1cTkdcoLdWdQu4iOafb1bLOSdD2DT3Qpea3as5Qjhgv-L5ZdghXwY-iz8hTTt9GzMVkCdqD-ZYj9JyFIcV5Z2qW4hJJ0_x0U5hdldOjehtgUiVfd8tS8nE6qYFywwwFmbYzp9zMerxJNHLzUX0r5g8eXqavwE1Q0giuhAtn8bnLOjtv5kwrfoVfKS06pikJ5coQhrKKRn5GSQkUL6rGQpal',
  });

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

  // Fetch initial profile
  useEffect(() => {
    notesApi
      .getProfile()
      .then((res) => {
        if (res.data) setProfile(res.data);
      })
      .catch((err) => {
        console.warn('Profile fetch warning:', err.message);
      });
  }, []);

  // Global counts across all states
  const [allNotesData, setAllNotesData] = useState([]);
  const refreshGlobalCounts = useCallback(async () => {
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
  }, []);

  // Fetch notes from backend
  const loadNotes = useCallback(async () => {
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
  }, [activeView, searchQuery, selectedTag, selectedColor, sort]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    refreshGlobalCounts();
  }, [notes, refreshGlobalCounts]);

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
      const res = await notesApi.updateNote(id, noteData);
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
      await Promise.all(trashNotes.map((n) => notesApi.permanentDelete(n.id)));
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
      setProfile(res.data);
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
    setModalNote({ ...note, isNew: false });
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
