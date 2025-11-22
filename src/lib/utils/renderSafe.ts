/**
 * Utility to safely render values in React components
 * Prevents "Objects are not valid as a React child" errors
 */

export function renderSafe(value: any): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Already a string or number - safe to render
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  // Boolean - convert to string
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Array - join with commas
  if (Array.isArray(value)) {
    return value.map(renderSafe).filter(Boolean).join(', ');
  }

  // Object - extract common fields or stringify
  if (typeof value === 'object') {
    // Try to extract meaningful fields
    const description = value.description || value.content || value.message || value.text || value.label || value.name;

    if (description) {
      return renderSafe(description);
    }

    // If it's a status object, show the status
    if (value.status) {
      return String(value.status);
    }

    // Last resort: stringify the object
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }

  // Fallback
  return String(value);
}

/**
 * Make an array of values safe to render
 */
export function renderArraySafe(arr: any[]): string[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map(renderSafe).filter(Boolean);
}

/**
 * Extract description/content from object or return as-is
 */
export function extractText(value: any): string {
  if (!value) return '';

  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);

  if (typeof value === 'object') {
    return value.description || value.content || value.message || value.text || JSON.stringify(value);
  }

  return String(value);
}
