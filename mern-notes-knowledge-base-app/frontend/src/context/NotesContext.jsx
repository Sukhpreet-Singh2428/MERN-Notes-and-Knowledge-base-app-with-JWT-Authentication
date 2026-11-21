import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import notesApi from '../api/notesApi.js';
import { useAuth } from './AuthContext.jsx';

const NotesContext = createContext();

export const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzu77tUsTobDgPKPcxam-Jtqr4Fu8NI1cTkdcoLdWdQu4iOafb1bLOSdD2DT3Qpea3as5Qjhgv-L5ZdghXwY-iz8hTTt9GzMVkCdqD-ZYj9JyFIcV5Z2qW4hJJ0_x0U5hdldOjehtgUiVfd8tS8nE6qYFywwwFmbYzp9zMerxJNHLzUX0r5g8eXqavwE1Q0giuhAtn8bnLOjtv5kwrfoVfKS06pikJ5coQhrKKRn5GSQkUL6rGQpal';

export function NotesProvider({ children }) {
  const { user: authUser, isAuthenticated, updateUser: updateAuthUser } = useAuth();

  // All notes across all views fetched from backend (source of truth for client filtering & counts)
  const [allNotesData, setAllNotesData] = useState([]);
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
          if (updateAuthUser) {
            updateAuthUser(res.data);
          }
        }
      })
      .catch((err) => {
        console.warn('Profile fetch warning:', err.message);
      });
  }, [isAuthenticated, updateAuthUser]);

  // Fetch all notes from backend across workspaces
  const loadNotes = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

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
    } catch (err) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Backward-compatible alias for refreshing counts/data
  const refreshGlobalCounts = loadNotes;

  // Only load notes when authenticated; clear state completely when logged out
  useEffect(() => {
    if (isAuthenticated) {
      loadNotes();
    } else {
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

  // Filter state helpers
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTag(null);
    setSelectedColor(null);
  }, []);

  const isFiltering = useMemo(
    () => Boolean(searchQuery.trim() || selectedTag || selectedColor),
    [searchQuery, selectedTag, selectedColor]
  );

  // Compute live filtered and sorted notes based on active workspace, search, tag, and color
  const notes = useMemo(() => {
    // 1. Current workspace / view filtering
    let viewNotes = [];
    if (activeView === 'pinned') {
      viewNotes = allNotesData.filter(
        (n) => !n.isTrash && !n.isDeleted && !n.isArchived && n.isPinned
      );
    } else if (activeView === 'archived') {
      viewNotes = allNotesData.filter(
        (n) => !n.isTrash && !n.isDeleted && n.isArchived
      );
    } else if (activeView === 'trash') {
      viewNotes = allNotesData.filter(
        (n) => n.isTrash || n.isDeleted
      );
    } else {
      // Default / 'all' view: active notes that are not archived and not in trash
      viewNotes = allNotesData.filter(
        (n) => !n.isTrash && !n.isDeleted && !n.isArchived
      );
    }

    // 2. Global note search: title, content, or tags case-insensitively with sensible whitespace handling
    const rawSearch = searchQuery.trim();
    if (rawSearch) {
      const q = rawSearch.toLowerCase().replace(/^#+/, '').replace(/\s+/g, ' ');
      viewNotes = viewNotes.filter((n) => {
        const title = (n.title || '').toLowerCase().replace(/\s+/g, ' ');
        const content = (n.content || '').toLowerCase().replace(/\s+/g, ' ');
        const tagMatch =
          Array.isArray(n.tags) &&
          n.tags.some((t) => t.toLowerCase().replace(/^#+/, '').includes(q));
        return title.includes(q) || content.includes(q) || tagMatch;
      });
    }

    // 3. Tag filtering: case-insensitive normalized tag matching
    if (selectedTag) {
      const normalizedTag = selectedTag.trim().toLowerCase().replace(/^#+/, '');
      viewNotes = viewNotes.filter(
        (n) =>
          Array.isArray(n.tags) &&
          n.tags.some(
            (t) => t.trim().toLowerCase().replace(/^#+/, '') === normalizedTag
          )
      );
    }

    // 4. Color filtering: matches note color
    if (selectedColor) {
      viewNotes = viewNotes.filter((n) => {
        const c = n.color || 'default';
        return c === selectedColor;
      });
    }

    // 5. Sorting
    const sorted = [...viewNotes].sort((a, b) => {
      if (sort === 'updated_asc') {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateA - dateB;
      }
      if (sort === 'created_desc') {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      if (sort === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // Default: 'updated_desc'
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return sorted;
  }, [allNotesData, activeView, searchQuery, selectedTag, selectedColor, sort]);

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
      const updatedData = res.data;
      setProfile((prev) => ({
        ...prev,
        ...updatedData,
        avatarUrl: updatedData?.avatarUrl || prev.avatarUrl || DEFAULT_AVATAR,
      }));
      if (updateAuthUser) {
        updateAuthUser(updatedData);
      }
      showToast('Preferences saved successfully', 'success');
      return updatedData;
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
        allNotesData,
        isFiltering,
        clearFilters,
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
