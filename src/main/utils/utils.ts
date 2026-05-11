import path from 'path';
import fs from 'fs';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export function toPosix(filePath: string): string {
  return filePath.replaceAll(path.sep, path.posix.sep);
}

// Retries op with exponential backoff on errors whose code is in retryableCodes.
export async function retryWithBackoff<T>(
  op: () => Promise<T>,
  attempts = 6,
  baseDelayMs = 100,
  retryableCodes: readonly string[] = ['EPERM', 'EBUSY', 'EACCES'],
): Promise<T> {
  let lastErr: NodeJS.ErrnoException | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await op();
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      lastErr = e;
      if (!retryableCodes.includes(e.code ?? '')) throw e;
      if (i < attempts - 1) {
        const delay = baseDelayMs * 2 ** i;
        await new Promise((r) => { setTimeout(r, delay); });
      }
    }
  }
  throw lastErr;
}
