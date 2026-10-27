/**
 * Formats an ISO date string into a friendly relative or calendar string
 * (e.g. "Just now", "2h ago", "Yesterday", "Oct 14, 2026")
 */
export function formatRelativeDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  const options = { month: 'short', day: 'numeric' };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculates remaining days in 30-day retention window
 */
export function getDaysRemainingInTrash(deletedAt) {
  if (!deletedAt) return 30;
  const deleted = new Date(deletedAt).getTime();
  const now = Date.now();
  const elapsedDays = Math.floor((now - deleted) / (1000 * 60 * 60 * 24));
  const remaining = 30 - elapsedDays;
  return Math.max(1, Math.min(30, remaining));
}

/**
 * Color metadata mapping matching Stitch design tokens
 */
export const NOTE_COLORS = {
  default: {
    name: 'Warm Ivory',
    accent: '#E5E0D5',
    strip: 'bg-outline-variant',
    bg: 'bg-surface-container-lowest',
    swatch: '#FCFBF7',
    border: 'border-outline-variant/30',
  },
  sage: {
    name: 'Soft Sage',
    accent: '#476653',
    strip: 'bg-primary-container',
    bg: 'bg-[#eef4ec]',
    swatch: '#E0E9DE',
    border: 'border-primary-fixed-dim',
  },
  terracotta: {
    name: 'Soft Terracotta',
    accent: '#8B4E39',
    strip: 'bg-secondary',
    bg: 'bg-[#fbf1ed]',
    swatch: '#F6DED4',
    border: 'border-secondary-fixed',
  },
  mustard: {
    name: 'Soft Mustard',
    accent: '#BFA971',
    strip: 'bg-tertiary',
    bg: 'bg-[#faf4df]',
    swatch: '#F9EEC9',
    border: 'border-tertiary-fixed',
  },
  slate: {
    name: 'Slate',
    accent: '#727973',
    strip: 'bg-outline',
    bg: 'bg-[#edf1ee]',
    swatch: '#DBE2DE',
    border: 'border-outline/30',
  },
};
