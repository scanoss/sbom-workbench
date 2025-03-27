import { DataProviderManager, Report } from 'scanoss';
import { ExportSource } from '../../../../api/types';
import { ExportResult, Format } from '../Format';
import { ComponentDataProvider } from '../DataProviders/ComponentDataProvider';
import { LicenseDataProvider } from '../DataProviders/LicenseDataProvider';
import { SummaryDataProvider } from '../DataProviders/SummaryDataProvider';
import { DependencyDataProvider } from '../DataProviders/DependencyDataProvider';
import { CryptographyDataProvider } from '../DataProviders/CryptographyDataProvider';

const pathLib = require('path');

export class HtmlSummary extends Format {
  private source: ExportSource;

  constructor(source: ExportSource) {
    super();
    this.source = source;
    this.extension = '.html';
  }

  // @override
  public async generate(): Promise<ExportResult> {
    const isDev = process.env.NODE_ENV !== 'production';
    const PATH = isDev
      ? pathLib.join(__dirname, '../../../../../assets/exportTemplates/template.html')
      : pathLib.join(__dirname, '../../../assets/exportTemplates/template.html');

    const dpm = new DataProviderManager();
    dpm.addDataProvider(new ComponentDataProvider(this.source));
    dpm.addDataProvider(new LicenseDataProvider(this.source));
    dpm.addDataProvider(new SummaryDataProvider(this.source === ExportSource.IDENTIFIED ? 'Identified Report' : 'Detected Report', this.source));
    dpm.addDataProvider(new DependencyDataProvider(this.source));
    dpm.addDataProvider(new CryptographyDataProvider(this.source));
    const report = new Report(dpm);
    report.setTemplatePath(PATH);
    return {
      report: await report.getHTML(),
      invalidPurls: await new ComponentDataProvider(this.source).getInvalidPurls(),
    };
  }
}
