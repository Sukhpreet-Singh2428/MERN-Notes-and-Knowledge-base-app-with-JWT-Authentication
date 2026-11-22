# Hearth Notes — CE-2 Requirements & Traceability Matrix (COVERAGE-CHECK.md)

> **Evaluation:** CE-2 (Continuous Evaluation 2)  
> **Official Project Title:** MERN Notes & Knowledge Base App with JWT Authentication  
> **Frontend Brand:** Hearth Notes (*Your quiet space for ideas*)  
> **Architecture:** React 19 Frontend (Vite) + Node.js / Express Backend + MongoDB Atlas (Mongoose ODM) + JWT Authentication  

---

## Executive Summary

This document serves as the formal **Traceability & Requirements Coverage Matrix** for Continuous Evaluation 2 (CE-2). 

All major requirements across authentication, database persistence, multi-tenant data ownership, REST API modularization, state management, and user experience have been fully implemented, verified, and integrated end-to-end.

---

## Requirements Traceability Matrix

| # | Requirement Category | Detailed Specification | CE-2 Status | Relevant Files / Endpoints | Verification Method | Notes / Implementation Detail |
|:---|:---|:---|:---:|:---|:---|:---|
| **1** | **Full Note CRUD** | Create note with title, content, tags, color, pin state | **Implemented** | `POST /api/notes`<br>`frontend/src/components/NoteModal.jsx`<br>`backend/src/controllers/notes.controller.js` | Verified note creation via UI and automated API test suites (`notes.crud.test.js`). | Automatic owner ID assignment via verified JWT. |
| **2** | **Full Note CRUD** | Read single note by ID and list all user-owned notes | **Implemented** | `GET /api/notes`<br>`GET /api/notes/:id`<br>`backend/src/repositories/notes.repository.js` | Verified response status 200 with user-scoped queries. | Strictly enforces `{ user: req.user.id }`. |
| **3** | **Full Note CRUD** | Update existing note title, body, tags, color | **Implemented** | `PUT /api/notes/:id`<br>`frontend/src/components/NoteModal.jsx`<br>`backend/src/services/notes.service.js` | Edited note in modal, saved, confirmed `updatedAt` timestamp bumped and MongoDB updated. | Validates non-empty title, sanitized tags, whitelisted colors. |
| **4** | **Trash & Retention** | Soft-delete note to trash (30-day retention indicator) | **Implemented** | `DELETE /api/notes/:id`<br>`frontend/src/views/TrashView.jsx`<br>`backend/src/services/notes.service.js` | Clicked trash icon; card moved from dashboard to Trash view with `isDeleted: true`. | Preserves note data without immediate data destruction. |
| **5** | **Trash & Retention** | Restore note from Trash back to active deck | **Implemented** | `PATCH /api/notes/:id/restore`<br>`frontend/src/views/TrashView.jsx` | Clicked "Restore" button; note reinstated into active deck with `isDeleted: false`. | Instantly updates global notes state and sidebar badge. |
| **6** | **Trash & Retention** | Permanent deletion & Empty Trash | **Implemented** | `DELETE /api/notes/:id/permanent`<br>`frontend/src/components/DeleteModal.jsx` | Tested single permanent delete; item permanently excised from MongoDB collection. | Requires note to be in trash first (defensive guard). |
| **7** | **Pinning & Priority** | Pin/unpin high-priority notes with dedicated deck | **Implemented** | `PATCH /api/notes/:id/pin`<br>`frontend/src/views/PinnedView.jsx`<br>`frontend/src/components/NoteCard.jsx` | Toggled pin icon on note card; pinned section updates dynamically at top of dashboard. | Separate Pinned navigation view with live badge. |
| **8** | **Archive System** | Quiet archive vault for inactive project notes | **Implemented** | `PATCH /api/notes/:id/archive`<br>`frontend/src/views/ArchivedView.jsx`<br>`backend/src/routes/notes.routes.js` | Archived note; verified note is filtered out of main dashboard and accessible in Archive tab. | Can be unarchived at any time with single click. |
| **9** | **Markdown Support** | Markdown editing and rich preview formatting | **Implemented** | `frontend/src/components/NoteModal.jsx`<br>`frontend/src/components/NoteCard.jsx`<br>Package: `react-markdown` | Edited note with `# Headers`, `**bold**`, lists, and code blocks; verified live Markdown preview toggle. | Supports side-by-side edit/preview toggle tabs. |
| **10** | **Tagging & Ontology** | Add custom tags, filter by tag, taxonomy overview | **Implemented** | `GET /api/notes?tag=...`<br>`frontend/src/views/TagsView.jsx`<br>`backend/src/services/notes.service.js` | Added tags like `philosophy`, `reading`; verified Bento grid taxonomy view and pill filtering. | Case-insensitive tag indexing with count metrics. |
| **11** | **Color Palette** | Whitelisted editorial color swatches | **Implemented** | `backend/src/validators/note.validation.js`<br>`frontend/src/utils/formatDate.js`<br>`frontend/src/styles/tokens.css` | Selected Ivory, Sage, Terracotta, Mustard, Slate; verified card accent strip and background tinting. | Strict server-side whitelist rejects unapproved hex colors. |
| **12** | **Full-Text Search** | Live substring search across title, body, and tags | **Implemented** | `GET /api/notes?search=...`<br>`frontend/src/components/Header.jsx`<br>`backend/src/services/notes.service.js` | Pressed `Ctrl + K`, typed keywords; matches filtered instantly. | Global shortcut listener with instant debounce. |
| **13** | **Date Filtering & Sort** | Relative time indicators and multiple sort orders | **Implemented** | `frontend/src/utils/formatDate.js`<br>`frontend/src/views/AllNotesView.jsx` | Sorted by Updated (Newest/Oldest), Created Date, and Title A-Z; displayed relative dates. | Clean formatting with fallback to absolute date. |
| **14** | **Author Profile** | Authenticated user profile and settings management | **Implemented** | `GET /api/profile`<br>`PUT /api/profile`<br>`frontend/src/views/SettingsView.jsx` | Updated display name, bio, avatar, and theme; persisted to MongoDB `User` document. | Read-only email protected from unauthorized modification. |
| **15** | **Theming & Aesthetics** | Dark mode, Light mode, System theme, Stitch design | **Implemented** | `frontend/src/context/ThemeContext.jsx`<br>`frontend/src/styles/tokens.css`<br>`frontend/src/components/Header.jsx` | Switched between Light, Dark, and System; colors dynamically shift using CSS variables. | Newsreader serif + DM Sans fonts matched to Stitch reference. |
| **16** | **Responsive Layout** | Mobile collapsible navigation and desktop sidebar | **Implemented** | `frontend/src/components/Sidebar.jsx`<br>`frontend/src/components/Header.jsx`<br>`frontend/src/styles/global.css` | Verified fluid layout at desktop (1440px), tablet (768px), and mobile (375px) with backdrop drawer. | Clean touch-friendly action targets. |
| **17** | **Durable Persistence** | Cloud MongoDB Atlas / Mongoose ODM with memory fallback | **Implemented** | `backend/src/config/database.js`<br>`backend/src/models/` | Verified database connectivity and Mongoose model CRUD. | Zero-config automatic fallback to `mongodb-memory-server` if `MONGO_URI` is unset. |
| **18** | **Error & State Handling** | Centralized backend error handler, 404, UI toasts | **Implemented** | `backend/src/middleware/errorHandler.js`<br>`backend/src/middleware/notFound.js`<br>`frontend/src/components/Toast.jsx` | Triggered invalid inputs and 404 routes; verified structured JSON error response and UI toast banner. | Maps Mongoose `ValidationError` and `CastError` to HTTP 400. |
| **19** | **Database (MongoDB)** | Mongoose ODM schemas, indexes, timestamps | **Implemented** | `backend/src/models/User.js`<br>`backend/src/models/Note.js` | Verified compound indexes `{ user: 1, isDeleted: 1, isArchived: 1, updatedAt: -1 }`. | Automatic `createdAt` and `updatedAt` tracking. |
| **20** | **Authentication (JWT)** | Multi-user registration, login, bcrypt hashing, JWT | **Implemented** | `backend/src/services/auth.service.js`<br>`backend/src/controllers/auth.controller.js`<br>`frontend/src/context/AuthContext.jsx` | Tested full auth lifecycle: registration, login, token issuance, bcrypt hashing (12 rounds). | Passwords configured with `select: false` and safe DTO serialization. |
| **21** | **Protected Routes & Security** | JWT authorization headers, middleware & owner isolation | **Implemented** | `backend/src/middleware/auth.middleware.js`<br>`frontend/src/api/notesApi.js` | Tested cross-user isolation: User B cannot access User A's notes (HTTP 404). | Automatic Bearer token attachment and 401 logout trigger. |
| **22** | **Production Build** | Frontend static asset compilation with Vite | **Implemented** | `frontend/vite.config.js`<br>`frontend/package.json` | Ran `npm run build` in `frontend`; bundle built cleanly with zero compilation errors. | Assets emitted to `frontend/dist`. |

---

## Architectural Verification Summary

### 1. Backend Service Verification
- **Endpoint**: `http://localhost:5000/api/health`
  - Response: `{"status":"ok","uptime":...,"database":"connected","timestamp":...}`
- **Root Endpoint**: `http://localhost:5000/`
  - Returns friendly API index and available endpoints.
- **Database Persistence**:
  - MongoDB Atlas via Mongoose ORM with automated in-memory fallback for local zero-config evaluation.
  - Multi-user data model with authenticated ownership isolation.

### 2. Frontend Application Verification
- **Host**: `http://localhost:3000`
- **Reverse Proxy**: Vite proxy redirects `/api/*` to `http://localhost:5000/api/*`, resolving cross-origin (CORS) constraints cleanly.
- **Design System Fidelity**: Full visual fidelity to the Stitch AI reference with warm ivory background, olive sidebar accents, card color tabs, serif titles, and tag badges.

---

## Conclusion

All requirements for the **Continuous Evaluation 2 (CE-2)** milestone have been fully implemented, tested, and verified end-to-end. The application is completely ready for CE-2 submission, code review, and demonstration.
