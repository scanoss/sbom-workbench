import { CryptographyResponseDTO } from '@api/types';
import { CryptoReportData } from './types';

export const getAlgorithms = (data: CryptographyResponseDTO): Array<string> => {
  const algorithms = new Set<string>();
  for (const c of Object.keys(data.summary.components.crypto)) {
    algorithms.add(c);
  }
  for (const c of Object.keys(data.summary.files.crypto)) {
    algorithms.add(c);
  }
  return Array.from(algorithms.values());
};

export const getTypes = (data: CryptographyResponseDTO): Array<string> => {
  const types = new Set<string>();
  for (const t of Object.keys(data.summary.components.type)) {
    types.add(t);
  }
  for (const t of Object.keys(data.summary.files.type)) {
    types.add(t);
  }
  return Array.from(types.values());
};

