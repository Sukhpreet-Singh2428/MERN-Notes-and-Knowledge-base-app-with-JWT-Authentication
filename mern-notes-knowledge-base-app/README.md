# Hearth Notes — MERN Notes & Knowledge Base App with JWT Authentication

> **Academic Milestone:** Continuous Evaluation 2 (CE-2 Deliverable)  
> **Official Project Title:** MERN Notes & Knowledge Base App with JWT Authentication  
> **Brand & Philosophy:** Hearth Notes — *Your quiet space for ideas*  
> **Architecture:** React 19 Frontend (Vite) + Node.js / Express Backend + MongoDB Atlas (Mongoose ODM) + JWT Authentication  

---

## 1. Project Overview

**Hearth Notes** is an editorial, contemplative personal knowledge base and note-taking application crafted for deep research, literary reflections, botanical field notes, and project drafts.

The application combines a warm archival visual aesthetic inspired by the **Stitch AI Design Reference** with a robust, production-grade MERN architecture featuring stateless **JSON Web Token (JWT)** authentication, password security with **bcrypt**, server-side multi-tenant ownership enforcement, and database persistence via **MongoDB Atlas** and **Mongoose**.

### Key Architectural Highlights:
- **Clean 3-Tier Layered Backend**: Strict separation of concerns across Routes, Controllers, Services, Repositories, and Mongoose Models.
- **Strict Multi-Tenant Isolation**: Every note operation filters by the authenticated user's ID extracted from the verified JWT. Client-supplied IDs or payloads cannot override server-enforced ownership.
- **Stateless Authentication**: Signed HS256 JWT tokens with automatic session recovery, multi-tab logout synchronization, and 401 error interceptors.
- **Rich Organization & Taxonomy**: Full CRUD operations, priority pinning, quiet archiving, 30-day soft trash retention with restore, instant full-text search (`Ctrl + K`), tag indexing with Bento grid views, and whitelisted color palettes.
- **Accessible & Responsive UI**: Built with React 19, supporting dark/light/system theming, responsive drawer navigation, modal dialogues, live Markdown preview, and non-blocking toast notifications.

---

## 2. Technology Stack

### Frontend
- **Library**: React 19 (Hooks, Context API, state-driven view routing)
- **Tooling & Bundler**: Vite 8, React plugin
- **HTTP Client**: Axios with Bearer token request interceptor and unified error normalization
- **Markdown Rendering**: `react-markdown` (safe, semantic HTML output without raw HTML injection)
- **Styling**: Tailwind CSS utility classes + custom Stitch design tokens (`tokens.css`, `global.css`)
- **Typography**: Newsreader (editorial serif), DM Sans (interface body), JetBrains Mono (code blocks)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 4
- **Database & ODM**: MongoDB Atlas / Mongoose 9
- **Authentication & Security**: `jsonwebtoken` (HS256 JWT signing and verification), `bcryptjs` (12 salt rounds)
- **Middleware**: CORS, Morgan HTTP logger, centralized error handling middleware
- **Zero-Config Fallback**: `mongodb-memory-server` auto-activates during testing or local development if `MONGO_URI` is not provided.

### Testing & Verification
- **Test Framework**: Vitest
- **HTTP Assertion**: Supertest
- **In-Memory Database**: `mongodb-memory-server`
- **Type Checking**: TypeScript compiler (`tsc --noEmit`)

---

## 3. System Architecture & Authentication Approach

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)              │
│  ThemeProvider  │  AuthProvider  │  NotesProvider     │
│  Sidebar        │  Header (Ctrl+K)│  Modals & Toasts  │
└───────────────────────────┬────────────────────────────┘
                            │ Axios (Bearer <JWT>)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Express REST API (Port 5000)                │
│  Middleware: CORS │ Morgan │ authenticateToken (JWT)   │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    /api/auth & /api/profile        /api/notes
              │                           │
              ▼                           ▼
       Controllers                  Controllers
              │                           │
              ▼                           ▼
       Services (Logic)             Services (Logic)
              │                           │
              ▼                           ▼
       Repositories                Repositories
              │                           │
              └─────────────┬─────────────┘
                            │ Mongoose ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│                  MongoDB Database                      │
│     Users Collection      │     Notes Collection       │
│  (Hashed Passwords, DTO)  │  (Indexed by {user, ...})  │
└────────────────────────────────────────────────────────┘
```

### Authentication Lifecycle:
1. **Registration**: Validates email format, minimum password length (6 characters), and display name. Hashes password using `bcryptjs` with 12 salt rounds before persisting to MongoDB.
2. **Login**: Verifies credentials against hashed password. Signs an HS256 JWT containing `userId` and `email` with a 7-day expiration (`JWT_EXPIRES_IN=7d`). Returns token and safe user profile DTO (excluding password).
3. **Session Persistence**: Token is stored in browser `localStorage` under `hearth_token`. On page load, `AuthContext` restores the session by fetching `/api/profile`.
4. **Request Injection**: Axios request interceptor attaches `Authorization: Bearer <token>` to all authenticated requests.
5. **Route Protection**: The `authenticateToken` middleware verifies token validity, algorithm, expiration, and issuer claims. It populates `req.user = { id, email }`.
6. **Automatic Invalidation**: On HTTP 401 response or cross-tab logout (`storage` event), the token is purged from `localStorage` and the user is redirected to the login view.
7. **Safe Serialization**: The `password` field is configured with `select: false` on the User schema and explicitly stripped via `user.serializer.js`.

---

## 4. Features & Functionality

### 1. Notes Management (CRUD)
- **Create**: Create notes with title, Markdown content, custom tags, and whitelisted color themes.
- **Read**: Fetch user-owned notes with real-time excerpt previews and relative update timestamps.
- **Update**: Edit existing notes via interactive modal with live Markdown preview tab.
- **Soft Delete (Trash)**: Move notes to Trash with a 30-day retention indicator and progress bar.
- **Restore**: Reinstate notes from Trash back to the active library with a single click.
- **Permanent Delete**: Defensive confirmation modal to permanently excise notes from the database.

### 2. Organization & Discovery
- **Priority Pinning**: Pin crucial notes to the top of the workspace or filter to the dedicated Pinned view.
- **Quiet Archive**: Archive completed or inactive notes to keep the primary dashboard focused.
- **Instant Search (`Ctrl + K`)**: Debounced full-text search matching titles, markdown content, and tags.
- **Tag Taxonomy (Bento Grid)**: Dedicated Tags view organizing notes by category tags with count badges.
- **Color Coding**: Whitelisted archival tones (Warm Ivory, Soft Sage, Soft Terracotta, Soft Mustard, Slate).
- **Sorting**: Multi-attribute sorting by Updated (Newest/Oldest), Created Date, and Title (A-Z).

### 3. Profile & Settings
- **Identity Display**: Shows authenticated display name, email, member since date, and avatar.
- **Profile Customization**: Update display name, personal bio, avatar URL, and default theme preference.
- **Read-Only Email**: Email address is protected and cannot be altered via profile update endpoints.
- **Appearance Settings**: Toggle between Light, Dark, and System theme modes.

---

## 5. API Specification

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account (`email`, `password`, `displayName`) |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and receive JWT access token |

### Notes Endpoints (`/api/notes`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/notes` | Required | List user's notes (supports `view`, `search`, `tag`, `color`, `sort`) |
| `GET` | `/api/notes/:id` | Required | Retrieve single note by ID (owner-enforced) |
| `POST` | `/api/notes` | Required | Create a new note (ownership automatically bound to token) |
| `PUT` | `/api/notes/:id` | Required | Update existing note (`title`, `content`, `tags`, `color`, `isPinned`) |
| `PATCH` | `/api/notes/:id/pin` | Required | Toggle note pinned status |
| `PATCH` | `/api/notes/:id/archive` | Required | Toggle note archived status |
| `PATCH` | `/api/notes/:id/restore` | Required | Restore note from Trash |
| `DELETE` | `/api/notes/:id` | Required | Soft-delete note into Trash (30-day retention) |
| `DELETE` | `/api/notes/:id/permanent` | Required | Permanently delete note from database |

### Profile & System Endpoints
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/profile` | Required | Retrieve authenticated user profile and preferences |
| `PUT` | `/api/profile` | Required | Update profile (`displayName`, `bio`, `avatarUrl`, `theme`) |
| `GET` | `/api/health` | Public | System health check (database connection status and uptime) |
| `GET` | `/` | Public | API root welcoming message and documentation index |

---

## 6. Directory Structure

```
mern-notes-knowledge-base-app/
├── package.json                   # Root package orchestration scripts
├── README.md                      # Comprehensive project documentation
├── COVERAGE-CHECK.md              # Requirements traceability matrix
├── backend/
│   ├── package.json               # Backend dependencies (Express, Mongoose, JWT, bcryptjs)
│   ├── vitest.config.js           # Vitest configuration for backend test runner
│   ├── .env                       # Local environment variables (ignored by git)
│   ├── .env.example               # Safe environment variable template
│   ├── .gitignore                 # Backend gitignore configuration
│   ├── data/                      # Historical CE1 seed data files
│   │   ├── notes.json
│   │   └── profile.json
│   ├── src/
│   │   ├── app.js                 # Express application configuration & route binding
│   │   ├── server.js              # Server entry point & graceful shutdown handling
│   │   ├── config/
│   │   │   └── database.js        # Mongoose connection with mongodb-memory-server fallback
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Auth request parsing & response handling
│   │   │   ├── notes.controller.js    # Notes request parsing & response handling
│   │   │   └── profile.controller.js  # Profile request parsing & response handling
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # JWT extraction, verification & req.user binding
│   │   │   ├── errorHandler.js        # Centralized HTTP error handler & Mongoose mapper
│   │   │   └── notFound.js            # 404 handler for unmatched routes
│   │   ├── models/
│   │   │   ├── User.js                # Mongoose User schema with bcrypt & indexes
│   │   │   └── Note.js                # Mongoose Note schema with user reference & compound index
│   │   ├── repositories/
│   │   │   ├── notes.repository.js    # Note database access operations
│   │   │   ├── profile.repository.js  # User profile database access operations
│   │   │   └── user.repository.js     # User authentication database access operations
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # /api/auth route definitions
│   │   │   ├── notes.routes.js        # /api/notes route definitions
│   │   │   └── profile.routes.js      # /api/profile route definitions
│   │   ├── serializers/
│   │   │   └── user.serializer.js     # Safe user DTO serializer (strips password)
│   │   ├── services/
│   │   │   ├── auth.service.js        # Auth logic, bcrypt hashing, JWT issuance
│   │   │   ├── notes.service.js       # Notes business rules, filters, ownership isolation
│   │   │   └── profile.service.js     # Profile updates & field whitelisting
│   │   ├── utils/
│   │   │   ├── jwt.js                 # JWT sign and verify helpers
│   │   │   └── fileStore.js           # Historical CE1 persistence helper
│   │   └── validators/
│   │       └── note.validation.js     # Note schema, tag sanitization & color whitelist
│   └── tests/
│       ├── auth-jwt.test.js           # JWT & auth integration test suite (45 tests)
│       ├── auth.middleware.test.js    # JWT middleware & security test suite (21 tests)
│       ├── notes.crud.test.js         # Notes CRUD & isolation test suite (33 tests)
│       └── profile.integration.test.js# Profile lifecycle test suite (47 tests)
└── frontend/
    ├── package.json               # Frontend dependencies (React 19, Vite, Axios, React Markdown)
    ├── vite.config.js             # Vite configuration with React plugin, proxy & port 3000
    ├── index.html                 # HTML shell with Google Fonts & Stitch styling
    ├── .env                       # Frontend environment variables (ignored by git)
    ├── .env.example               # Safe frontend environment template
    ├── .gitignore                 # Frontend gitignore configuration
    └── src/
        ├── App.jsx                # Core frame, navigation routing, modal presentation
        ├── main.jsx               # React DOM entry point with Provider hierarchy
        ├── api/
        │   └── notesApi.js        # Axios instance, Bearer token interceptor, 401 event dispatch
        ├── context/
        │   ├── AuthContext.jsx    # Session restoration, login, register, logout, token sync
        │   ├── NotesContext.jsx   # Note collection state, active view, filtering, badges
        │   └── ThemeContext.jsx   # Theme switcher (light, dark, system)
        ├── components/
        │   ├── Header.jsx         # Top app bar with search, Ctrl+K listener, theme toggler
        │   ├── Sidebar.jsx        # Left drawer with brand, "+ New Note", view tabs, badges
        │   ├── NoteCard.jsx       # Card component with color strip, options menu, tag chips
        │   ├── NoteModal.jsx      # Create/edit dialog with live Markdown preview
        │   ├── DeleteModal.jsx    # Defensive confirmation dialog for permanent deletions
        │   └── Toast.jsx          # Non-blocking visual notification toast
        ├── utils/
        │   └── formatDate.js     # Relative time formatting & color palette metadata
        ├── views/
        │   ├── AllNotesView.jsx   # Main workspace view with Pinned deck & filter ribbon
        │   ├── PinnedView.jsx     # High-priority notes view
        │   ├── ArchivedView.jsx   # Quiet vault view for archived notes
        │   ├── TrashView.jsx      # 30-day soft deletion view with restore & purge
        │   ├── TagsView.jsx       # Bento grid taxonomy library
        │   ├── SettingsView.jsx   # Profile customization, theme settings, account details
        │   ├── LoginView.jsx      # Authenticated login screen
        │   └── RegisterView.jsx   # New user account registration screen
        └── styles/
            ├── tokens.css         # Stitch design system CSS variables
            └── global.css         # Reset styles and editorial typography rules
```

---

## 7. Installation & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional)*: A local MongoDB instance or MongoDB Atlas connection string. If omitted, the application automatically launches an in-memory database (`mongodb-memory-server`) for zero-config evaluation.

### Step 1: Install Dependencies
From the repository root (`mern-notes-knowledge-base-app`):
```bash
npm run install:all
```
*(Or install individually via `cd backend && npm install` and `cd ../frontend && npm install`)*

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```
Default sample configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hearth_notes?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```
*(Note: If `MONGO_URI` is left unset or blank, the backend falls back to an automatic in-memory MongoDB instance).*

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
Default sample configuration:
```env
VITE_API_URL=/api
```

### Step 3: Run the Application

**Run Backend (Terminal 1):**
```bash
npm run dev:backend
# Starts Express server on http://localhost:5000
```

**Run Frontend (Terminal 2):**
```bash
npm run dev:frontend
# Starts Vite development server on http://localhost:3000
```

Once running, navigate to **`http://localhost:3000`** in your browser.

---

## 8. Testing & Verification

### Run Backend Automated Test Suite
From the `backend/` directory:
```bash
npm test
```
Executes **146 automated tests** using Vitest across 4 comprehensive suites:
- `auth-jwt.test.js`: Token issuance, algorithm checking, expiry, and credential verification.
- `auth.middleware.test.js`: Header validation, Bearer scheme, invalid token rejection, and security.
- `notes.crud.test.js`: Full CRUD lifecycle, soft delete, restore, permanent deletion, and multi-user isolation.
- `profile.integration.test.js`: Profile reads, updates, field whitelisting, and read-only email protection.

### Run Frontend Production Build
From the `frontend/` directory:
```bash
npm run build
```
Compiles and bundles static production assets via Vite.

### Run TypeScript Type Check
From the `frontend/` directory:
```bash
npx tsc --noEmit
```
Verifies static type soundness across all modules.

---

## 9. Security & Data Ownership

- **Strict User Ownership**: All Note queries include `{ user: req.user.id }`. Notes created by User A are invisible to and cannot be modified or deleted by User B (returning HTTP 404).
- **No Password Exposure**: Passwords are hashed with `bcryptjs` (12 rounds) and stripped from database queries (`select: false`) and serializers.
- **Immutable User Identity**: Client payloads attempting to pass `userId`, `ownerId`, or MongoDB injection operators (`$set`, `$unset`) are strictly ignored or sanitized.
- **Sanitized Markdown**: Notes content is rendered via `react-markdown` with semantic elements; raw HTML strings are not parsed, preventing Cross-Site Scripting (XSS).
- **Controlled CORS**: Express CORS middleware restricts cross-origin communication to the configured `CLIENT_URL`.
- **JWT Storage Tradeoff**: The client stores the JWT in browser `localStorage` under `hearth_token`. In an academic context, this enables straightforward demonstration, multi-tab synchronization, and cross-session persistence.

---

## 10. CE-2 Scope & Boundaries

The application is feature-complete for the **Continuous Evaluation 2 (CE-2)** milestone.

### Established Scope:
- Multi-user authentication (Register, Login, Logout)
- Bcrypt password hashing & JWT token authorization
- MongoDB Atlas / Mongoose ODM integration with automated in-memory fallback
- Complete note lifecycle (CRUD, Pin, Archive, Trash, Restore, Permanent Delete)
- Organization (Search `Ctrl+K`, Tag Bento grid, Color palette ribbons, Sorting)
- User Profile management (display name, bio, avatar, theme; read-only email)
- Dark / Light / System theme switching

### Out-of-Scope (Deferred by Design):
The following features are intentionally out of scope for the current academic specification:
- OAuth / Social Login (Google, GitHub)
- Refresh token rotation / 2FA
- Password reset via automated email servers
- Real-time collaborative editing (WebSockets)
- Binary media file uploads / Cloudinary integration
- Note sharing across accounts
