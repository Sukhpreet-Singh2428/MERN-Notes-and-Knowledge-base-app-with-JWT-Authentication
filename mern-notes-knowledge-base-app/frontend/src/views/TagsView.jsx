import React, { useState, useMemo } from 'react';
import { useNotes } from '../context/NotesContext.jsx';

export default function TagsView() {
  const { tagsSummary, counts, setActiveView, setSelectedTag, openCreateModal } = useNotes();
  const [tagSearch, setTagSearch] = useState('');
  const [tagSort, setTagSort] = useState('count_desc');

  const filteredTags = useMemo(() => {
    let list = tagsSummary.filter((t) =>
      t.tag.toLowerCase().includes(tagSearch.trim().toLowerCase())
    );

    if (tagSort === 'count_desc') {
      list.sort((a, b) => b.count - a.count);
    } else if (tagSort === 'count_asc') {
      list.sort((a, b) => a.count - b.count);
    } else if (tagSort === 'alpha_asc') {
      list.sort((a, b) => a.tag.localeCompare(b.tag));
    }

    return list;
  }, [tagsSummary, tagSearch, tagSort]);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setActiveView('all');
  };

  const handleCreateNewTag = () => {
    const newTagName = window.prompt('Enter new tag name (e.g. research, epistemology, gardening):');
    if (newTagName && newTagName.trim()) {
      const cleanTag = newTagName.trim().toLowerCase().replace(/^#/, '');
      setSelectedTag(cleanTag);
      openCreateModal();
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Editorial Header & Knowledge Horizon */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-space-lg pt-space-md mb-space-xl">
        <div className="flex flex-col max-w-2xl">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption uppercase tracking-wider mb-space-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container"></span>
            <span>Ontology & Taxonomy</span>
            <span>/</span>
            <span>Index Collection</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Tags Library
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
            Browse and organize your knowledge base through {counts.tags} thematic classification tags.
          </p>
        </div>

        {/* Quick Metrics Ribbon */}
        <div className="flex items-center gap-space-md self-start md:self-auto bg-surface-container-low/90 backdrop-blur-sm px-space-md py-space-sm rounded-xl shadow-sm">
          <div className="flex flex-col pr-space-md">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">
              Indexed Taxonomy
            </span>
            <span className="font-title-md text-title-md text-primary">
              {counts.tags} Active Tags
            </span>
          </div>
          <div className="w-px h-8 bg-surface-container-high"></div>
          <div className="flex flex-col pl-space-xs">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">
              Referenced Scope
            </span>
            <span className="font-title-md text-title-md text-on-surface">
              {counts.all} Notes
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Workspace Control Bar */}
      <div className="relative z-10 bg-surface-container-lowest p-space-sm md:p-space-md rounded-xl shadow-[0_2px_8px_-2px_rgba(48,55,47,0.05),0_1px_3px_-1px_rgba(48,55,47,0.03)] border border-surface-container/60 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md mb-space-lg">
        {/* Search Filter */}
        <div className="flex-1 max-w-lg relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-xl pointer-events-none">
            filter_list
          </span>
          <input
            type="text"
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            id="tag-search-input"
            placeholder="Filter tags by name..."
            className="w-full pl-11 pr-space-md py-2.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
          />
          {tagSearch && (
            <button
              onClick={() => setTagSearch('')}
              className="absolute right-3 p-1 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Controls: Sort & Create */}
        <div className="flex flex-wrap items-center gap-space-sm justify-between lg:justify-end">
          <div className="relative flex items-center">
            <label className="sr-only" htmlFor="sort-tags">Sort Tags</label>
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-2 rounded-lg text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-lg">swap_vert</span>
              <select
                id="sort-tags"
                value={tagSort}
                onChange={(e) => setTagSort(e.target.value)}
                className="bg-transparent text-on-surface font-label-md text-label-md outline-none cursor-pointer pr-1"
              >
                <option value="count_desc">Sort by note count (high to low)</option>
                <option value="count_asc">Sort by note count (low to high)</option>
                <option value="alpha_asc">Alphabetical (A – Z)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateNewTag}
            className="flex items-center justify-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all shadow-[0_1px_2px_rgba(48,55,47,0.12)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">bookmark_add</span>
            <span>+ Create Tag</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredTags.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl">label_off</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            No tags found
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
            {tagSearch ? 'No tags match your search query.' : 'Add tags to your notes to start categorizing your knowledge base.'}
          </p>
        </div>
      )}

      {/* Tags Dynamic Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
        {filteredTags.map((item) => (
          <div
            key={item.tag}
            onClick={() => handleTagClick(item.tag)}
            className="group relative bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-surface-container shadow-sm cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl bg-primary-container"></div>
            <div>
              <div className="flex items-start justify-between gap-space-sm pl-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container shrink-0"></span>
                  <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight group-hover:text-primary-container transition-colors">
                    #{item.tag}
                  </h2>
                </div>
                <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed shrink-0">
                  {item.count} {item.count === 1 ? 'note' : 'notes'}
                </span>
              </div>

              <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mt-space-sm pl-space-xs">
                Recent Notes
              </p>
              <div className="flex flex-col gap-1.5 mt-space-xs pl-space-xs">
                {item.notes.map((n) => (
                  <div
                    key={n.id}
                    className="text-on-surface font-body-sm text-body-sm truncate flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm text-primary-container">
                      drafts
                    </span>
                    <span className="truncate">{n.title || 'Untitled Note'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pl-space-xs pt-space-md flex items-center justify-between text-caption font-caption text-primary">
              <span>View collection</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
