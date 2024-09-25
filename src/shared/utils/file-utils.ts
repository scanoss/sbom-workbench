import { ExportFormat } from '@api/types';

enum Package {
  GITHUB = 'https://github.com',
  STACKOVERFLOW = 'https://stackoverflow.com',
}

const canOpenURL = (file): boolean => {
  return file.url?.startsWith(Package.GITHUB) || file.url?.startsWith(Package.STACKOVERFLOW);
};

const getFileURL = (file): string => {
  if (file.url?.startsWith(Package.GITHUB)) {
    return `${file.url}/blob/master/${file.file}`;
  }

  if (file.url?.startsWith(Package.STACKOVERFLOW)) {
    return file.url;
  }

  return file.file;
};

const getFormatFilesAttributes = (format: ExportFormat) => {
  const attr = new Map<ExportFormat, Record<string, any>>();
  attr.set(ExportFormat.RAW, { description: 'JSON Files', extension: 'json' });
  attr.set(ExportFormat.WFP, { description: 'WFP Files', extension: 'wfp' });
  attr.set(ExportFormat.CSV, { description: 'CSV Files', extension: 'csv' });
  attr.set(ExportFormat.SPDXLITEJSON, { description: 'JSON Files', prefix: 'SPDXLite', extension: 'json' });
  attr.set(ExportFormat.CYCLONEDX, { description: 'JSON Files', prefix: 'cyclonedx', extension: 'json' });
  attr.set(ExportFormat.HTMLSUMMARY, { description: 'HTML Files', extension: 'html', defaultFileName: 'HTMLSummary' });
  attr.set(ExportFormat.SCANOSS_JSON, { description: 'SCANOSS json', extension: 'json', defaultFileName: 'scanoss' });

  return attr.get(format);
};

export { canOpenURL, getFileURL, getFormatFilesAttributes };
