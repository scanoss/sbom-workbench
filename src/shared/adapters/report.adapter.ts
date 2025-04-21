import { CryptographyResponseDTO } from '@api/types';
import { CryptoReportData } from './types';
import { CryptoAlgorithm } from 'scanoss';
import { CryptographicItem } from '../../main/model/entity/Cryptography';

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

export const filterCryptoByAlgorithms = (algorithms: Array<CryptographicItem>, filter: Array<string>) => {
  return algorithms
    .map((c) => {
      // For each crypto item, get only the values that match the filter
      const matchingValues = c.values.filter(value =>
        filter?.includes(value)
      );

      // Only return items that have matching values
      if (matchingValues.length > 0) {
        return {
          ...c,
          values: matchingValues // Replace with only the matching values
        };
      }

      return null; // No matches for this item
    })
    .filter(Boolean); // Remove null entries (items with no matches)
};
