import { CryptographyResponseDTO } from '@api/types';
import { CryptoReportData } from './types';

export const adaptCryptographyGetAll = (data: CryptographyResponseDTO): CryptoReportData => {
  const groupedComponents = new Map<string, any>();
  data.components.forEach((component) => {
    if (!groupedComponents.has(component.purl)) {
      groupedComponents.set(component.purl, {
        purl: component.purl,
        versions: [],
        algorithms: [],
      });
    }
    const groupComponent = groupedComponents.get(component.purl);
    groupComponent.versions.push(component.version);
    groupComponent.algorithms = [...new Map([...groupComponent.algorithms, ...component.algorithms].map((item) => [item.algorithm, item])).values()];
  });

  return {
    files: data.files,
    components: [...groupedComponents.values()],
  };
};

export const getAlgorithms = (data: CryptographyResponseDTO): Array<string> => {
  const algorithmsFiles = data.files.map((file) => file.algorithms.map((algorithm) => algorithm.algorithm)).flat();
  const algorithmsComponents = data.components.map((component) => component.algorithms.map((algorithm) => algorithm.algorithm)).flat();
  const algorithms: Array<string> = [...algorithmsFiles, ...algorithmsComponents];
  return [...new Set(algorithms)].sort((a, b) => a.localeCompare(b));
};
