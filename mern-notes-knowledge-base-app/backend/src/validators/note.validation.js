/** Valid note color names matching the design system */
const VALID_COLORS = ['default', 'sage', 'terracotta', 'mustard', 'slate'];
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 50000;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS = 20;

/**
 * Validate and sanitize note input.
 * Returns { valid: true, data } or { valid: false, errors: [...] }
 */
export function validateNote(body, isUpdate = false) {
  const errors = [];
  const data = {};

  // Title
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      errors.push('Title is required and must be a non-empty string.');
    } else if (body.title.trim().length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
    } else {
      data.title = body.title.trim();
    }
  } else if (!isUpdate) {
    errors.push('Title is required.');
  }

  // Content
  if (body.content !== undefined) {
    if (typeof body.content !== 'string') {
      errors.push('Content must be a string.');
    } else if (body.content.length > MAX_CONTENT_LENGTH) {
      errors.push(`Content must be ${MAX_CONTENT_LENGTH} characters or fewer.`);
    } else {
      data.content = body.content;
    }
  } else if (!isUpdate) {
    data.content = '';
  }

  // Tags
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push('Tags must be an array of strings.');
    } else if (body.tags.length > MAX_TAGS) {
      errors.push(`Maximum ${MAX_TAGS} tags allowed.`);
    } else {
      const normalizedTags = [];
      for (const tag of body.tags) {
        if (typeof tag !== 'string' || !tag.trim()) continue;
        const t = tag.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
        if (!normalizedTags.includes(t)) normalizedTags.push(t);
      }
      data.tags = normalizedTags;
    }
  } else if (!isUpdate) {
    data.tags = [];
  }

  // Color
  if (body.color !== undefined) {
    if (!VALID_COLORS.includes(body.color)) {
      errors.push(`Color must be one of: ${VALID_COLORS.join(', ')}.`);
    } else {
      data.color = body.color;
    }
  } else if (!isUpdate) {
    data.color = 'default';
  }

  // Boolean fields
  if (body.isPinned !== undefined) data.isPinned = Boolean(body.isPinned);
  if (body.isArchived !== undefined) data.isArchived = Boolean(body.isArchived);

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, data };
}

export { VALID_COLORS };
