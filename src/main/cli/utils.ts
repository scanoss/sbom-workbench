/**
 * CLI utility functions
 */

/**
 * Validates if a URL is properly formatted
 * @param url - The URL to validate
 * @returns True if valid, false otherwise
 */
export function validateURL(url: string): void {
  const parsed = new URL(url);
  if (parsed.pathname !== '/' && parsed.pathname !== '') {
    throw new Error(
      `The entered URL "${url}" contains a pathname "${parsed.pathname}", which is not supported. Please remove the pathname.`
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Invalid protocol. Supported protocols are http and https.');
  }
}

export function isValidApiIndex(index: number, apis: number) {
  if (isNaN(index)) {
    throw new Error('[SCANOSS] --index must be a number');
  }

  if (index < 0 || index >= apis) {
    throw new Error(`[SCANOSS] Invalid index: ${index}`);
  }
}
