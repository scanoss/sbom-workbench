/**
 * CLI utility functions
 */

/**
 * Normalizes a URL by ensuring it has a scheme and extracting only the origin
 * @param url - The URL to normalize
 * @returns The normalized URL (scheme + host)
 */
export function normalizeUrl(url: string): string {
  let normalized = url;

  // Add https:// if no scheme provided
  if (!normalized.startsWith('http')) {
    normalized = `https://${normalized}`;
  }

  const parsed = new URL(normalized);
  return `${parsed.protocol}//${parsed.host}`;
}

/**
 * Validates if a URL is properly formatted
 * @param url - The URL to validate
 * @returns True if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
