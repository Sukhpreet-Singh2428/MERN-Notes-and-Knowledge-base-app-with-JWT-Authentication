import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function SettingsView() {
  const { profile, updateAuthorProfile, showToast } = useNotes();
  const {
    theme,
    setTheme,
    editorFont,
    setEditorFont,
    defaultColor,
    setDefaultColor,
  } = useTheme();

  const [displayName, setDisplayName] = useState(profile.displayName || 'Elena Rostova');
  const [bio, setBio] = useState(profile.bio || 'Writer & Botanical Researcher');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateAuthorProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
    } catch {
      // toast shown in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Editorial Page Header */}
      <div className="max-w-[880px] mx-auto w-full mb-8 pt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-caption text-caption uppercase tracking-wider text-tertiary">
              Workspace Preferences
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary/40"></span>
            <span className="font-caption text-caption text-on-surface-variant">
              Version 1.0 (CE1 Evaluation)
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Settings & Preferences
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage your personal profile, reading atmosphere, and system roadmap configurations.
          </p>
        </div>
      </div>

      {/* Primary Settings Canvas / Card */}
      <div className="max-w-[880px] mx-auto w-full bg-surface-container-lowest rounded-xl shadow-[0_1px_4px_rgba(48,55,47,0.06)] border border-surface-container/60 p-8 md:p-10 flex flex-col gap-10">
        {/* Section 1: Profile Information */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <span>Profile Information</span>
              </h2>
              <span className="font-caption text-caption text-primary px-2.5 py-1 rounded-full bg-surface-container-low font-label-sm">
                Active Session
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Personalize how your notes, bibliographic citations, and entries are labeled.
            </p>
          </div>

          {/* Avatar & Actions */}
          <div className="p-5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-sm flex-shrink-0 ring-2 ring-surface">
                <img
                  alt={displayName}
                  className="w-full h-full object-cover"
                  src={profile.avatarUrl}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface">{displayName}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Author identifier #HRTH-8492
                </span>
                <span className="font-caption text-caption text-primary flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Verified Researcher
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form Fields */}
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="display-name">
                Display Name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container transition-all"
              />
              <span className="font-caption text-caption text-on-surface-variant">
                Appears at the header of all notebooks.
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="workspace-role">
                Bio / Workspace Role
              </label>
              <input
                id="workspace-role"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container transition-all"
              />
              <span className="font-caption text-caption text-on-surface-variant">
                Short descriptive subtitle for your research repository.
              </span>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                htmlFor="email-address"
              >
                <span>Primary Email</span>
                <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span> Read-only in local profile
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="email-address"
                  readOnly
                  type="email"
                  value={profile.email || 'elena.rostova@hearthnotes.local'}
                  className="w-full px-4 py-2.5 bg-surface-container/60 cursor-not-allowed rounded-lg font-body-md text-body-md text-on-surface-variant/80 focus:outline-none"
                />
                <span className="material-symbols-outlined text-base absolute right-3 text-outline">
                  verified_user
                </span>
              </div>
            </div>
          </form>
        </section>

        {/* Visual Divider */}
        <div className="h-1.5 w-full bg-surface-container-low rounded-full"></div>

        {/* Section 2: Workspace Appearance & Theme */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Workspace Appearance & Theme
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Choose the visual tone that best comforts your eyes during lengthy contemplative sessions.
            </p>
          </div>

          {/* Theme Selection Cards (3 options) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Theme */}
            <div
              onClick={() => setTheme('light')}
              className={`group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border ${
                theme === 'light'
                  ? 'bg-surface-container-low border-primary shadow-sm'
                  : 'bg-surface-container-low/60 hover:bg-surface-container-low border-transparent'
              }`}
            >
              <div className="w-full h-20 rounded-lg bg-[#F7F5EF] p-2.5 flex flex-col justify-between mb-3 shadow-[0_1px_3px_rgba(48,55,47,0.08)]">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-2.5 bg-[#476653] rounded-full"></div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#304E3C]/30"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#304E3C]/30"></div>
                  </div>
                </div>
                <div className="bg-white rounded p-1.5 flex flex-col gap-1 shadow-[0_1px_2px_rgba(48,55,47,0.05)]">
                  <div className="w-16 h-1 bg-[#424843] rounded"></div>
                  <div className="w-24 h-1 bg-[#424843]/40 rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-primary">Light Theme</span>
                  <span className="font-caption text-caption text-on-surface-variant">Warm ivory & sage</span>
                </div>
                {theme === 'light' ? (
                  <span className="material-symbols-outlined text-primary text-xl material-symbols-filled">
                    check_circle
                  </span>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-surface-container"></div>
                )}
              </div>
            </div>

            {/* Dark Theme */}
            <div
              onClick={() => setTheme('dark')}
              className={`group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border ${
                theme === 'dark'
                  ? 'bg-surface-container-low border-primary shadow-sm'
                  : 'bg-surface-container-low/60 hover:bg-surface-container-low border-transparent'
              }`}
            >
              <div className="w-full h-20 rounded-lg bg-[#202620] p-2.5 flex flex-col justify-between mb-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-2.5 bg-[#9CB89F] rounded-full"></div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9CB89F]/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9CB89F]/40"></div>
                  </div>
                </div>
                <div className="bg-[#2B322A] rounded p-1.5 flex flex-col gap-1">
                  <div className="w-16 h-1 bg-[#ECF3E7] rounded"></div>
                  <div className="w-24 h-1 bg-[#ECF3E7]/40 rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface">Dark Theme</span>
                  <span className="font-caption text-caption text-on-surface-variant">Deep muted forest</span>
                </div>
                {theme === 'dark' ? (
                  <span className="material-symbols-outlined text-primary text-xl material-symbols-filled">
                    check_circle
                  </span>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-surface-container"></div>
                )}
              </div>
            </div>

            {/* System Preference */}
            <div
              onClick={() => setTheme('system')}
              className={`group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border ${
                theme === 'system'
                  ? 'bg-surface-container-low border-primary shadow-sm'
                  : 'bg-surface-container-low/60 hover:bg-surface-container-low border-transparent'
              }`}
            >
              <div className="w-full h-20 rounded-lg overflow-hidden flex mb-3 shadow-sm">
                <div className="w-1/2 h-full bg-[#F7F5EF] p-2 flex flex-col justify-between">
                  <div className="w-8 h-2 bg-[#476653] rounded-full"></div>
                  <div className="bg-white rounded p-1 flex flex-col gap-1">
                    <div className="w-10 h-1 bg-[#424843] rounded"></div>
                  </div>
                </div>
                <div className="w-1/2 h-full bg-[#202620] p-2 flex flex-col justify-between">
                  <div className="w-8 h-2 bg-[#9CB89F] rounded-full ml-auto"></div>
                  <div className="bg-[#2B322A] rounded p-1 flex flex-col gap-1">
                    <div className="w-10 h-1 bg-[#ECF3E7] rounded"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface">System</span>
                  <span className="font-caption text-caption text-on-surface-variant">Matches OS setting</span>
                </div>
                {theme === 'system' ? (
                  <span className="material-symbols-outlined text-primary text-xl material-symbols-filled">
                    check_circle
                  </span>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-surface-container"></div>
                )}
              </div>
            </div>
          </div>

          {/* Typography Choice & Default Note Tint */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Editor Font Family */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface">Editor Typography</span>
                <span className="font-caption text-caption text-on-surface-variant">
                  Default rendering for long-form note bodies.
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'dm-sans', name: 'DM Sans', label: 'Default Sans-serif', fontClass: 'font-sans' },
                  { id: 'newsreader', name: 'Newsreader / Lora', label: 'Editorial Serif', fontClass: 'font-serif' },
                  { id: 'jetbrains-mono', name: 'JetBrains Mono', label: 'Monospace', fontClass: 'font-mono' },
                ].map((f) => (
                  <label
                    key={f.id}
                    onClick={() => setEditorFont(f.id)}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-lg ${
                          editorFont === f.id ? 'text-primary material-symbols-filled' : 'text-outline'
                        }`}
                      >
                        {editorFont === f.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <span className={`text-on-surface ${f.fontClass}`}>{f.name}</span>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Default Note Accent Tint */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface">Default Note Tint</span>
                <span className="font-caption text-caption text-on-surface-variant">
                  Natural archival tone applied when creating quick entries.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'default', name: 'Warm Ivory', swatch: '#F7F5EF', subtitle: 'Warm Paper' },
                  { id: 'sage', name: 'Soft Sage', swatch: '#E0E9DE', subtitle: 'Botanical' },
                  { id: 'terracotta', name: 'Terracotta', swatch: '#F6DED4', subtitle: 'Earth Tone' },
                  { id: 'mustard', name: 'Soft Mustard', swatch: '#F9EEC9', subtitle: 'Highlight' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setDefaultColor(c.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all border ${
                      defaultColor === c.id
                        ? 'bg-surface-container border-primary shadow-sm'
                        : 'bg-surface-container-low/60 hover:bg-surface-container border-transparent'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: c.swatch }}
                      className="w-5 h-5 rounded-full shadow-sm flex items-center justify-center border border-black/10"
                    >
                      {defaultColor === c.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface font-medium">
                        {c.name}
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        {c.subtitle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Visual Divider */}
        <div className="h-1.5 w-full bg-surface-container-low rounded-full"></div>

        {/* Section 3: Account Security (Academic CE2 Roadmap Callout) */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Security & Storage Architecture
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Current state and verified technical milestones for authentication and record durability.
            </p>
          </div>

          {/* Refined Informational Roadmap Callout Card */}
          <div className="p-6 md:p-7 rounded-xl bg-surface-container-low relative overflow-hidden flex flex-col gap-4 border border-surface-container">
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-primary/5 text-9xl pointer-events-none select-none">
              shield
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-sm">flag</span>
                Academic Project Roadmap • CE2 Planned
              </span>
              <span className="font-caption text-caption text-on-surface-variant">
                Active Architecture: Single-User CE1 (File System JSON)
              </span>
            </div>

            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-2xl">security</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-title-lg text-title-lg text-on-surface">
                  JWT Authentication & Secure Password Management
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Real MongoDB user isolation, encrypted password hashing (<code className="font-mono text-body-sm bg-surface-container px-1.5 py-0.5 rounded text-primary">bcrypt</code>), and JSON Web Token (<code className="font-mono text-body-sm bg-surface-container px-1.5 py-0.5 rounded text-primary">JWT</code>) session issuance are scheduled for the next development sprint. In this CE1 prototype, durable local state with JSON file persistence is active.
                </p>
              </div>
            </div>

            {/* Disabled Placeholder for CE2 */}
            <div className="mt-2 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 border-t border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-lg">lock_clock</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Password rotation & cryptographic token revoking
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-outline cursor-not-allowed font-label-md text-label-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">key_off</span>
                  <span>Update Password</span>
                </button>
                <span className="font-caption text-caption text-outline italic">
                  (Available upon CE2 deployment)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Action Footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-container">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-base">cloud_done</span>
            <span className="font-caption text-caption">
              Changes persisted to backend repository
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">check</span>
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
