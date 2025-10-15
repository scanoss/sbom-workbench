import fs from 'fs';
import { SettingsFileInfo } from '../../../api/types';

export function isIdentifyFile(file: string) {
  const pattern = /sbom\.json/i;
  const identify = 'scanoss-identify.json';
  const isMatch = pattern.test(file);
  if (isMatch || file === identify) return true;
  return false;
}

export function isIgnoreFile(file: string) {
  const ignore = 'scanoss-ignore.json';
  if (file === ignore) return true;
  return false;
}

export function sortIdentifyFilesComparator(a, b) {
  const identifyFilesCriteria = ['scanoss-identify.json', 'SBOM.json', 'sbom.json'];
  if (identifyFilesCriteria.indexOf(a) < identifyFilesCriteria.indexOf(b)) {
    return -1;
  }
  return 0;
}

export async function getContextFiles(scanRoot: string) {
  const stats = await fs.promises.stat(scanRoot);
  const isDirectory = stats.isDirectory();

  if (!isDirectory) {
    return {
      identifyFile: null,
      ignoreFile: null,
    };
  }

  const files = await fs.promises.readdir(scanRoot);
  const identifyFiles = [];
  const ignoreFiles = [];
  // Test string

  for (let i = 0; i < files.length; i++) {
    if (isIdentifyFile(files[i])) {
      identifyFiles.push(files[i]);
    }
    if (isIgnoreFile(files[i])) {
      ignoreFiles.push(files[i]);
    }
  }

  identifyFiles.sort(sortIdentifyFilesComparator);

  return {
    identifyFile: identifyFiles.length > 0 ? identifyFiles[0] : null,
    ignoreFile: ignoreFiles.length > 0 ? ignoreFiles[0] : null,
  };
}

/**
 * @deprecated Use getSettingsFileInfo() instead
 */
export async function getScanossSettingsFilePath(scanRoot: string) {
  const stats = await fs.promises.stat(scanRoot);
  const isDirectory = stats.isDirectory();

  if (!isDirectory) return null;

  const files = await fs.promises.readdir(scanRoot);
  if ((files.some((file) => file === 'scanoss.json'))) return 'scanoss.json';
  return null;
}

export async function getSettingsFileInfo(scanRoot: string): Promise<SettingsFileInfo> {
  const stats = await fs.promises.stat(scanRoot);
  const isDirectory = stats.isDirectory();

  if (!isDirectory) {
    return { type: 'none', fileName: null, legacyType: null };
  }

  const files = await fs.promises.readdir(scanRoot);

  // Check for scanoss.json first
  if (files.some((file) => file === 'scanoss.json')) {
    return { type: 'standard', fileName: 'scanoss.json', legacyType: null };
  }

  // Check for legacy identify files
  const legacyIdentifyFiles = ['scanoss-identify.json', 'SBOM.json', 'sbom.json'];
  const foundIdentifyFile = files.find((file) => legacyIdentifyFiles.includes(file));

  if (foundIdentifyFile) {
    return { type: 'legacy', fileName: foundIdentifyFile, legacyType: 'identify' };
  }

  // Check for legacy ignore file
  if (files.some((file) => file === 'scanoss-ignore.json')) {
    return { type: 'legacy', fileName: 'scanoss-ignore.json', legacyType: 'ignore' };
  }

  return { type: 'none', fileName: null, legacyType: null };
}
