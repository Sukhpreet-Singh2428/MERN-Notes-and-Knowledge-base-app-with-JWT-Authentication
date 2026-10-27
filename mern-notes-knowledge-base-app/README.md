# Hearth Notes — MERN Notes & Knowledge Base App

> **Academic Evaluation:** CE1 (Continuous Evaluation 1), Monday 26 October 2026  
> **Official Project Title:** MERN Notes & Knowledge Base App with JWT Authentication  
> **Frontend Brand:** Hearth Notes — *Your quiet space for ideas*  
> **Architecture (CE1):** React Frontend (Vite) + Node.js / Express Backend + Durable File System JSON Persistence

---

## 1. Project Overview

**Hearth Notes** is an editorial, contemplative personal knowledge base and note-taking environment crafted for deep research, literary reflections, botanical field notes, and project drafts.

The user experience and visual aesthetic are faithful implementations of the **Stitch AI Design Reference**, featuring:
- **Warm archival color palette**: Warm Ivory (`#F7F5EF`), Soft Sage (`#476653`), Soft Terracotta (`#8B4E39`), Soft Mustard (`#BFA971`), and Slate (`#727973`).
- **Editorial Typography**: Newsreader serif for headlines, DM Sans for UI and body text, and JetBrains Mono for code blocks.
- **Micro-interactions**: Color-accented note strips, live search with keyboard shortcut (`Ctrl + K`), tag taxonomy pills, pin toggles, soft trash retention, and instant toast notifications.

---

## 2. CE1 Evaluation Scope & CE2 Technical Roadmap

| Dimension | CE1 Implementation (Current Deliverable) | CE2 Milestone (Upcoming Sprint) |
| :--- | :--- | :--- |
| **Persistence** | Durable Node.js File System (`data/notes.json`, `data/profile.json`) with atomic writes & automatic recovery | Cloud MongoDB Atlas cluster with Mongoose ORM |
| **Authentication** | Active Single-Author workspace session (`Elena Rostova`) with settings personalization | Multi-user Registration, Login, `bcrypt` password hashing, and signed `JWT` access tokens |
| **API Architecture** | Clean 3-Tier Layered REST API (`Routes` -> `Controllers` -> `Services` -> `Repositories` -> `FileStore`) | Same layered architecture swapped from `FileStore` to `Mongoose Model` repositories |
| **Frontend** | Complete React 19 SPA with Vite, dynamic views, modals, filter ribbons, and theme context | Protected route wrappers, auth interceptors, and user login/register screens |

---

## 3. Directory Structure

```
mern-notes-knowledge-base-app/
├── package.json                   # Root orchestration scripts
├── README.md                      # Documentation & CE1 submission summary
├── backend/
│   ├── package.json               # Backend dependencies (Express, cors, morgan, dotenv)
│   ├── .env                       # Environment configuration (PORT=5000, DATA_DIR)
│   ├── .env.example               # Template environment configuration
│   ├── data/                      # Local JSON persistence directory
│   │   ├── notes.json             # Durable notes repository with seed entries
│   │   └── profile.json           # User profile and workspace preferences
│   └── src/
│       ├── app.js                 # Express app setup, CORS, JSON parser, Morgan logger
│       ├── server.js              # Server entry point listening on PORT 5000
│       ├── controllers/
│       │   ├── notes.controller.js    # Request handlers for note operations
│       │   └── profile.controller.js  # Request handlers for profile operations
│       ├── middleware/
│       │   ├── errorHandler.js    # Centralized error handler (hides stack in prod)
│       │   └── notFound.js        # 404 handler for undefined routes
│       ├── repositories/
│       │   ├── notes.repository.js    # Low-level note persistence operations
│       │   └── profile.repository.js  # Low-level profile persistence operations
│       ├── routes/
│       │   ├── notes.routes.js    # Notes endpoint routing
│       │   └── profile.routes.js  # Profile endpoint routing
│       ├── services/
│       │   ├── notes.service.js   # Business logic (filtering, search, tag indexing)
│       │   └── profile.service.js # Profile business logic & validation
│       ├── utils/
│       │   └── fileStore.js       # Atomic, thread-safe JSON file I/O utility
│       └── validators/
│           └── note.validation.js # Schema validation, tag sanitization & color whitelist
└── frontend/
    ├── package.json               # Frontend dependencies (React 19, Vite, Axios, React Markdown)
    ├── vite.config.js             # Vite configuration with React plugin & port 3000
    ├── index.html                 # HTML shell with Google Fonts & Stitch Tailwind config
    ├── .env                       # Frontend environment (VITE_API_URL=http://localhost:5000/api)
    └── src/
        ├── App.jsx                # Main application frame (Sidebar, Header, Views, Overlays)
        ├── main.jsx               # React DOM entry point with Context Providers
        ├── api/
        │   └── notesApi.js        # Axios HTTP client with unified error extraction
        ├── context/
        │   ├── NotesContext.jsx   # Global note state, active views, badge counts, CRUD actions
        │   └── ThemeContext.jsx   # Dark/light theme, typography, and default note tint state
        ├── components/
        │   ├── Header.jsx         # Top navigation bar with Ctrl+K search & theme toggler
        │   ├── Sidebar.jsx        # Left drawer with brand logo, "+ New Note", & live badges
        │   ├── NoteCard.jsx       # Stitch design card with color strip, options menu & tags
        │   ├── NoteModal.jsx      # Create & Edit modal with Markdown preview & color swatches
        │   ├── DeleteModal.jsx    # Destructive action confirmations (permanent delete & empty trash)
        │   └── Toast.jsx          # Non-blocking visual feedback for all CRUD operations
        ├── utils/
        │   └── formatDate.js     # Friendly relative dates ("Updated 2h ago") & color metadata
        ├── views/
        │   ├── AllNotesView.jsx   # Main dashboard with Pinned section, filter ribbon, & view switcher
        │   ├── PinnedView.jsx     # High-priority working deck view
        │   ├── ArchivedView.jsx   # Quiet vault storage for inactive projects
        │   ├── TrashView.jsx      # 30-day soft deletion retention view with Empty Trash action
        │   ├── TagsView.jsx       # Dynamic Bento taxonomy library with note snippets
        │   └── SettingsView.jsx   # Author profile, appearance toggles, & CE2 security roadmap
        └── styles/
            ├── tokens.css         # Stitch design system CSS variables
            └── global.css         # Reset styles and editorial typography helpers
```

---

## 4. API Endpoints Specification

### Notes API (`/api/notes`)

| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notes` | `view=all\|pinned\|archived\|trash`, `search=str`, `tag=str`, `color=str`, `sort=updated_desc\|updated_asc\|created_desc\|title_asc` | Returns filtered notes array |
| `GET` | `/api/notes/:id` | `id` (path) | Returns single note by ID |
| `POST` | `/api/notes` | `{ title, content, tags, color, isPinned }` | Creates a new note |
| `PUT` | `/api/notes/:id` | `{ title, content, tags, color, isPinned }` | Updates an existing note |
| `PATCH` | `/api/notes/:id/pin` | None | Toggles note pinned status |
| `PATCH` | `/api/notes/:id/archive` | None | Toggles note archived status |
| `PATCH` | `/api/notes/:id/restore` | None | Restores note from Trash |
| `DELETE` | `/api/notes/:id` | None | Soft-deletes note into Trash (30-day retention) |
| `DELETE` | `/api/notes/:id/permanent`| None | Permanently erases note from storage |

### Profile & System API

| Method | Endpoint | Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | None | Retrieves author profile & preferences |
| `PUT` | `/api/profile` | `{ displayName, bio, avatarUrl, theme }` | Updates author profile & preferences |
| `GET` | `/api/health` | None | Health check returning status, uptime, & version |

---

## 5. Getting Started & Running Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation
From the root `mern-notes-knowledge-base-app` directory:
```bash
# Install dependencies for both backend and frontend
npm run install:all
```

### Running the Backend Server
```bash
# Terminal 1: Starts Express on http://localhost:5000
npm run dev:backend
```

### Running the Frontend Client
```bash
# Terminal 2: Starts Vite on http://localhost:3000
npm run dev:frontend
```

Once running, navigate your browser to **`http://localhost:3000`**.

---

## 6. Verification & Acceptance Criteria

- [x] **Full-stack architecture**: Clean separation between React frontend and Express backend.
- [x] **Durable JSON storage**: Thread-safe atomic file writes preventing race conditions.
- [x] **Complete CRUD**: Create, read, update, soft-delete, restore, and permanent deletion.
- [x] **Organization features**: Priority pinning, quiet archiving, and 30-day trash retention.
- [x] **Ontology & taxonomy**: Tag indexing, tag library bento grid, and instant tag filtering.
- [x] **Full-text search**: Case-insensitive substring search matching across titles, contents, and tags.
- [x] **Color palette whitelisting**: Warm Ivory, Soft Sage, Soft Terracotta, Soft Mustard, and Slate.
- [x] **Stitch AI fidelity**: Matches layout, typography, navigation badges, and modal designs.
- [x] **Dark mode support**: Persistent theme toggle supporting Light, Dark, and System modes.
- [x] **CE2 JWT Authentication roadmap**: Transparently framed inside Settings for academic grading.

---

## 7. Traceability Matrix

For the complete academic requirements breakdown, implementation status, verification methods, and deferred items, see [COVERAGE-CHECK.md](./COVERAGE-CHECK.md).
