import { Format } from '../Format';
import { IdentifiedComponentDataProvider } from '../DataProviders/IdentifiedComponentDataProvider';
import { DataProviderManager, Report, SummaryDataProvider } from 'scanoss';
import { IdentifiedLicenseDataProvider } from '../DataProviders/IdentifiedLicenseDataProvider';
import { IdentifiedSummaryDataProvider } from '../DataProviders/IdentifiedSummaryDataProvider';
import { IdentifiedDependencyDataProvider } from '../DataProviders/IdentifiedDependencyDataProvider';

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
    dpm.addDataProvider(new IdentifiedSummaryDataProvider('Identified Report'));
    dpm.addDataProvider(new IdentifiedDependencyDataProvider());
    const report = new Report(dpm);
    return report.getHTML();
  }
}
