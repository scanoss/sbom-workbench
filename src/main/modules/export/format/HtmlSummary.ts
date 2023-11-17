import { Format } from '../Format';
import { IdentifiedComponentDataProvider } from '../DataProviders/IdentifiedComponentDataProvider';
import { DataProviderManager, Report } from 'scanoss';
import { IdentifiedLicenseDataProvider } from '../DataProviders/IdentifiedLicenseDataProvider';

const pathLib = require('path');

export class HtmlSummary extends Format {
  constructor() {
    super();
    this.extension = '.html';
  }

  // @override
  public async generate() {
    const dpm = new DataProviderManager();
    dpm.addDataProvider(new IdentifiedComponentDataProvider());
    dpm.addDataProvider(new IdentifiedLicenseDataProvider());
    const report = new Report(dpm);
    return report.getHTML();
  }
}
