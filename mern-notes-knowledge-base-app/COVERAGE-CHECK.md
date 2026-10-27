# Hearth Notes — CE1 Requirements & Traceability Matrix (COVERAGE-CHECK.md)

> **Evaluation:** CE1 (Continuous Evaluation 1) — Monday, 26 October 2026  
> **Official Project Title:** MERN Notes & Knowledge Base App with JWT Authentication  
> **Frontend Brand:** Hearth Notes (*Your quiet space for ideas*)  
> **Architecture (CE1):** React 19 Frontend (Vite) + Node.js / Express Backend + Durable File System JSON Persistence  

---

## Executive Summary

This document serves as the formal **Traceability & Requirements Coverage Matrix** for Continuous Evaluation 1 (CE1). 

In accordance with explicit academic instructions:
- **CE1 Focus**: Demonstrates a functional, presentable full-stack application covering React frontend architecture, Express REST API modularization, component state management, responsive UI design adhering to Stitch AI references, and thread-safe Node.js File System (`fs/promises`) JSON persistence.
- **Explicitly Deferred to CE2**: Multi-user registration/login, JWT token signing/verification, bcrypt password hashing, MongoDB Atlas / Mongoose ORM, and protected route guards have **not** been covered in current training curriculum and are scheduled for CE2. These features are documented with architectural roadmaps rather than simulated with mock security.

---

## Requirements Traceability Matrix

| # | Requirement Category | Detailed Specification | CE1 Status | Relevant Files / Endpoints | Verification Method | Notes / Deferred Rationale |
|:---|:---|:---|:---:|:---|:---|:---|
| **1** | **Full Note CRUD** | Create note with title, content, tags, color, pin state | **Implemented** | `POST /api/notes`<br>`frontend/src/components/NoteModal.jsx`<br>`backend/src/controllers/notes.controller.js` | Tested creating notes via UI modal and verified atomic append into `backend/data/notes.json`. | Generates UUID v4, trims input, validates fields. |
| **2** | **Full Note CRUD** | Read single note by ID and list all notes | **Implemented** | `GET /api/notes`<br>`GET /api/notes/:id`<br>`backend/src/repositories/notes.repository.js` | Verified response status 200 with 8 initial seeded notes on both `/api/notes` and port 3000 proxy. | Supports view filters (`all`, `pinned`, `archived`, `trash`). |
| **3** | **Full Note CRUD** | Update existing note title, body, tags, color | **Implemented** | `PUT /api/notes/:id`<br>`frontend/src/components/NoteModal.jsx`<br>`backend/src/services/notes.service.js` | Edited note in modal, saved, confirmed `updatedAt` timestamp bumped and disk updated. | Automatic date tracking with ISO strings. |
| **4** | **Trash & Retention** | Soft-delete note to trash (30-day retention indicator) | **Implemented** | `DELETE /api/notes/:id`<br>`frontend/src/views/TrashView.jsx`<br>`backend/src/services/notes.service.js` | Clicked trash icon; card moved from dashboard to Trash view with `isTrash: true`. | Preserves note data without immediate data destruction. |
| **5** | **Trash & Retention** | Restore note from Trash back to active deck | **Implemented** | `PATCH /api/notes/:id/restore`<br>`frontend/src/views/TrashView.jsx` | Clicked "Restore" button; note reinstated into active deck with `isTrash: false`. | Instantly updates global notes state and sidebar badge. |
| **6** | **Trash & Retention** | Permanent deletion & Empty Trash | **Implemented** | `DELETE /api/notes/:id/permanent`<br>`frontend/src/components/DeleteModal.jsx` | Tested single permanent delete and empty trash modal; item permanently excised from `notes.json`. | Modal provides defensive two-step confirmation. |
| **7** | **Pinning & Priority** | Pin/unpin high-priority notes with dedicated deck | **Implemented** | `PATCH /api/notes/:id/pin`<br>`frontend/src/views/PinnedView.jsx`<br>`frontend/src/components/NoteCard.jsx` | Toggled pin icon on note card; pinned section updates dynamically at top of dashboard. | Separate Pinned navigation view with live badge. |
| **8** | **Archive System** | Quiet archive vault for inactive project notes | **Implemented** | `PATCH /api/notes/:id/archive`<br>`frontend/src/views/ArchivedView.jsx`<br>`backend/src/routes/notes.routes.js` | Archived note; verified note is filtered out of main dashboard and accessible in Archive tab. | Can be unarchived at any time with single click. |
| **9** | **Markdown Support** | Markdown editing and rich preview formatting | **Implemented** | `frontend/src/components/NoteModal.jsx`<br>`frontend/src/components/NoteCard.jsx`<br>Package: `react-markdown` | Edited note with `# Headers`, `**bold**`, lists, and code blocks; verified live Markdown preview toggle. | Supports side-by-side edit/preview toggle tabs. |
| **10** | **Tagging & Ontology** | Add custom tags, filter by tag, taxonomy overview | **Implemented** | `GET /api/notes?tag=...`<br>`frontend/src/views/TagsView.jsx`<br>`backend/src/services/notes.service.js` | Added tags like `philosophy`, `reading`; verified Bento grid taxonomy view and pill filtering. | Case-insensitive tag indexing with count metrics. |
| **11** | **Color Palette** | Whitelisted editorial color swatches | **Implemented** | `backend/src/validators/note.validation.js`<br>`frontend/src/utils/formatDate.js`<br>`frontend/src/styles/tokens.css` | Selected Ivory, Sage, Terracotta, Mustard, Slate; verified card accent strip and background tinting. | Strict server-side whitelist rejects unapproved hex colors. |
| **12** | **Full-Text Search** | Live substring search across title, body, and tags | **Implemented** | `GET /api/notes?search=...`<br>`frontend/src/components/Header.jsx`<br>`backend/src/services/notes.service.js` | Pressed `Ctrl + K`, typed keywords ("Aurelius", "design"); matches highlighted instantly. | Global shortcut listener with instant debounce. |
| **13** | **Date Filtering & Sort** | Relative time indicators and multiple sort orders | **Implemented** | `frontend/src/utils/formatDate.js`<br>`frontend/src/views/AllNotesView.jsx` | Sorted by Updated (Newest/Oldest), Created Date, and Title A-Z; displayed "Updated 2h ago". | Gracefully handles relative and absolute date formats. |
| **14** | **Author Profile** | Single-workspace author settings and bio persistence | **Implemented** | `GET /api/profile`<br>`PUT /api/profile`<br>`backend/data/profile.json`<br>`frontend/src/views/SettingsView.jsx` | Updated author name and bio in Settings; verified persistence in `profile.json` on restart. | Pre-populated with author `Elena Rostova`. |
| **15** | **Theming & Aesthetics** | Dark mode, Light mode, System theme, Stitch design | **Implemented** | `frontend/src/context/ThemeContext.jsx`<br>`frontend/src/styles/tokens.css`<br>`frontend/src/components/Header.jsx` | Switched between Light, Dark, and System; colors dynamically shift using CSS variables. | Newsreader serif + DM Sans fonts matched to Stitch reference. |
| **16** | **Responsive Layout** | Mobile collapsible navigation and desktop sidebar | **Implemented** | `frontend/src/components/Sidebar.jsx`<br>`frontend/src/components/Header.jsx`<br>`frontend/src/styles/global.css` | Verified fluid layout at desktop (1440px), tablet (768px), and mobile (375px) with backdrop drawer. | Clean touch-friendly action targets. |
| **17** | **Durable Persistence** | Server-side file persistence with atomic writes | **Implemented** | `backend/src/utils/fileStore.js`<br>`backend/src/repositories/notes.repository.js` | Server restarted while running; notes remained fully intact with no data loss or corruption. | Uses temp file write + atomic rename (`fs.rename`). |
| **18** | **Error & State Handling** | Centralized backend error handler, 404, UI toasts | **Implemented** | `backend/src/middleware/errorHandler.js`<br>`backend/src/middleware/notFound.js`<br>`frontend/src/components/Toast.jsx` | Triggered invalid inputs and 404 routes; verified structured JSON error response and UI toast banner. | Production mode suppresses stack traces. |
| **19** | **Database (MongoDB)** | Cloud MongoDB Atlas cluster & Mongoose ODM | **Deferred (CE2)** | `backend/src/repositories/` (Prepared for Mongoose adapter) | N/A | **Deferred per trainer guidance**: MongoDB and Mongoose have not yet been taught in curriculum. |
| **20** | **Authentication (JWT)** | User registration, login, bcrypt hashing, JWT tokens | **Deferred (CE2)** | `frontend/src/views/SettingsView.jsx` (Roadmap card visible) | N/A | **Deferred per trainer guidance**: Authentication, password hashing, and token storage deferred to CE2. |
| **21** | **Protected Routes** | JWT authorization headers and Route guards | **Deferred (CE2)** | Frontend and backend route architecture ready for middleware injection | N/A | **Deferred per trainer guidance**: Requires JWT auth module from CE2. |
| **22** | **Production Build** | Frontend static asset compilation with Vite | **Implemented** | `frontend/vite.config.js`<br>`frontend/package.json` | Ran `npm run build` in `frontend`; bundle built cleanly with zero compilation errors. | Assets emitted to `frontend/dist`. |

---

## Architectural Verification Summary

### 1. Backend Service Verification
- **Endpoint**: `http://localhost:5000/api/health`
  - Response: `{"status":"ok","uptime":...,"notesCount":8,"timestamp":...}`
- **Root Endpoint**: `http://localhost:5000/`
  - Returns friendly API index and available endpoints.
- **Data Persistence**:
  - `backend/data/notes.json`: Seeded with 8 realistic knowledge base notes across philosophy, literature, architecture, and biology.
  - `backend/data/profile.json`: Seeded author workspace preferences.

### 2. Frontend Application Verification
- **Host**: `http://localhost:3000`
- **Reverse Proxy**: Vite proxy redirects `/api/*` to `http://localhost:5000/api/*`, resolving cross-origin (CORS) constraints cleanly.
- **Design System Fidelity**: Full visual fidelity to the Stitch AI reference with warm ivory background, olive sidebar accents, card color tabs, serif titles, and tag badges.

---

## Conclusion

All trainer-approved requirements for the **Continuous Evaluation 1 (CE1)** milestone have been implemented, tested, and verified end-to-end. Unlearned features (MongoDB, JWT, bcrypt, and multi-tenancy) are explicitly framed as upcoming CE2 deliverables with an established architectural migration path.
