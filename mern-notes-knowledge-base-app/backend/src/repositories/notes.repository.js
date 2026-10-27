import path from 'node:path';
import { fileURLToPath } from 'node:url';
import FileStore from '../utils/fileStore.js';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTES_PATH = path.join(__dirname, '..', '..', 'data', 'notes.json');

const store = new FileStore(NOTES_PATH);

/** Seed data for first run */
const SEED_NOTES = [
  {
    id: crypto.randomUUID(),
    title: 'Literature Review: Cognitive Ergonomics in Digital Reading',
    content: '### Core Hypotheses\n\nReading velocity in non-glare digital environments increases by **14%** when using warm background temperatures (approx 4500K color temperature equivalent).\n\n> "A quiet workspace allows cognitive synthesis to occur naturally, without premature crystallization of ideas."\n\n#### Key Observations:\n- Line length should strictly adhere to **50–75 characters per line** for sustained cognitive stamina.\n- Generous line height (`1.65–1.75`) reduces ocular jumping across dense paragraphs.\n- Tag hierarchies work best when descriptive rather than categorical.',
    tags: ['research', 'cognition'],
    color: 'sage',
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    createdAt: '2026-10-12T09:00:00.000Z',
    updatedAt: '2026-10-25T07:00:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Autumn Garden & Herbal Teas Formulation',
    content: 'Blending dried lemon verbena with wild sage and chamomile.\n\n**Proportions:** 3 parts verbena, 1 part sage.\n\nKeep steep time under 6 minutes for sweetness. Experiment with adding dried lavender buds for evening blends.',
    tags: ['botany', 'journal'],
    color: 'terracotta',
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    createdAt: '2026-10-20T14:00:00.000Z',
    updatedAt: '2026-10-24T10:00:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Architectural Principles for Personal Knowledge Systems',
    content: '## Key Principles\n\n- Atomic notes over monolithic logs\n- Bidirectional linkage is valuable only when context is maintained\n- Prefer descriptive titles as standalone claims\n- Review and prune weekly to maintain signal quality\n\n> "The value of a knowledge system is not in its size but in the connections between its parts."',
    tags: ['systems', 'pkm'],
    color: 'mustard',
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    createdAt: '2026-10-14T11:00:00.000Z',
    updatedAt: '2026-10-14T11:00:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Quarterly Writing Goals & Manuscript Outlines',
    content: 'Draft chapters 3 through 5 of the novella.\n\n**Daily routine:** Maintain 750 words daily morning routine before opening email or checking newsfeeds.\n\n### Milestones\n1. Chapter 3 first draft — Oct 20\n2. Chapter 4 outline — Oct 28\n3. Chapter 5 outline — Nov 5',
    tags: ['writing', 'manuscript'],
    color: 'sage',
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    createdAt: '2026-10-11T08:30:00.000Z',
    updatedAt: '2026-10-11T08:30:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Meeting Reflections: Design System Tokens & Accessibility',
    content: 'Contrast ratios for muted terracotta against warm ivory need careful check.\n\nEnsure **4.5:1 ratio** on small body copy before pushing updates to production design library.\n\n### Action Items\n- Audit all text-on-surface color combinations\n- Test with screen reader software\n- Document accessible alternatives for color-only indicators',
    tags: ['work', 'design-tokens'],
    color: 'default',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    createdAt: '2026-10-12T16:00:00.000Z',
    updatedAt: '2026-10-12T16:00:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Bread Baking: 78% Hydration Sourdough Schedule',
    content: '### Process\n1. Autolyse 45m with warm water (28°C)\n2. 4 stretch-and-folds spaced 30m apart\n3. Bulk fermentation 4-5 hours at room temp\n4. Pre-shape and bench rest 20m\n5. Final shape and 14hr cold retardation in fridge\n\nThe long cold retard brings forward complex lactobacillus notes and a more open crumb structure.',
    tags: ['baking', 'craft'],
    color: 'default',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    createdAt: '2026-10-10T07:00:00.000Z',
    updatedAt: '2026-10-10T07:00:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Quotes on Stillness & Quiet Workspaces',
    content: '> "In a culture of noise and speed, the quiet craftsperson holds an unspoken sanctuary."\n\nNotes from Cal Newport and May Sarton on intentional isolation.\n\n> "Solitude is the furnace wherein thoughts find their temper."\n\n> "The best thinking has been done in solitude." — Thomas Edison',
    tags: ['reading', 'quotes'],
    color: 'default',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    createdAt: '2026-10-08T19:00:00.000Z',
    updatedAt: '2026-10-08T19:00:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Graph Data Structures: BFS & DFS Revision',
    content: '## Breadth-First Search (BFS)\n- Uses a **queue** (FIFO)\n- Explores neighbors level by level\n- Time: O(V + E), Space: O(V)\n\n## Depth-First Search (DFS)\n- Uses a **stack** (LIFO) or recursion\n- Explores as deep as possible before backtracking\n- Time: O(V + E), Space: O(V)\n\n### Connected Components\nRun DFS/BFS from each unvisited vertex to find all components.',
    tags: ['DSA', 'revision'],
    color: 'sage',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    createdAt: '2026-10-06T13:00:00.000Z',
    updatedAt: '2026-10-06T13:00:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Archived: Old Reading List 2025',
    content: 'Books completed in 2025:\n- *Thinking, Fast and Slow* — Daniel Kahneman\n- *Atomic Habits* — James Clear\n- *Deep Work* — Cal Newport\n- *The Art of Learning* — Josh Waitzkin',
    tags: ['reading', 'archive'],
    color: 'default',
    isPinned: false,
    isArchived: true,
    isDeleted: false,
    createdAt: '2025-12-31T23:00:00.000Z',
    updatedAt: '2026-01-05T10:00:00.000Z'
  },
  {
    id: crypto.randomUUID(),
    title: 'Deleted Draft: Untitled Experiment',
    content: 'This was a scratchpad that did not work out. Can be restored if needed.',
    tags: ['draft'],
    color: 'default',
    isPinned: false,
    isArchived: false,
    isDeleted: true,
    createdAt: '2026-09-15T12:00:00.000Z',
    updatedAt: '2026-09-20T15:00:00.000Z'
  }
];

class NotesRepository {
  /** Get all notes from file, initializing with seed data if needed */
  async getAll() {
    let notes = await store.read(null);
    if (notes === null) {
      // First run — seed
      await store.write(SEED_NOTES);
      return [...SEED_NOTES];
    }
    if (!Array.isArray(notes)) return [];
    return notes;
  }

  /** Find a single note by ID */
  async findById(id) {
    const notes = await this.getAll();
    return notes.find(n => n.id === id) || null;
  }

  /** Save the entire notes array to disk */
  async saveAll(notes) {
    await store.write(notes);
  }

  /** Add a new note */
  async create(note) {
    const notes = await this.getAll();
    notes.push(note);
    await this.saveAll(notes);
    return note;
  }

  /** Update an existing note by ID. Returns updated note or null. */
  async update(id, updates) {
    const notes = await this.getAll();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    notes[idx] = { ...notes[idx], ...updates, id, createdAt: notes[idx].createdAt };
    await this.saveAll(notes);
    return notes[idx];
  }

  /** Permanently remove a note by ID. Returns true if found and removed. */
  async remove(id) {
    const notes = await this.getAll();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return false;
    notes.splice(idx, 1);
    await this.saveAll(notes);
    return true;
  }
}

export default new NotesRepository();
