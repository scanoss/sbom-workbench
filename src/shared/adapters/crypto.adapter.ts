import { CryptoAlgorithm } from 'scanoss';

/**
   * Normalize crypto algorithms and convert them to lower case from an array of algorithm objects.
   * @param {Array<Algorithms>} algorithms - The array of algorithm objects.
   * @returns {Array<Algorithms>} algorithms - The array of normalized algorithm objects.
   */
export const normalizeCryptoAlgorithms = (algorithms: Array<CryptoAlgorithm>): Array<CryptoAlgorithm> => {
  const algorithmsMapper = new Map<string, CryptoAlgorithm>();
  algorithms.forEach((a) => {
    const algorithmsToLowerCase = a.algorithm.toLocaleLowerCase();
    algorithmsMapper.set(algorithmsToLowerCase, { ...a, algorithm: algorithmsToLowerCase });
  });

  return Array.from(algorithmsMapper.values());
};
