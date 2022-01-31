import fs from 'fs';
import { reportService } from '../../services/ReportService';
import { Format } from '../Format';

const pathLib = require('path');

export class HtmlSummary extends Format {
  constructor() {
    super();
    this.extension = '.html';
  }

  // @override
  public async generate() {
    const isDev = process.env.NODE_ENV !== 'production';

    const PATH = isDev
      ? pathLib.join(__dirname, '../../../../assets/exportTemplates/')
      : pathLib.join(__dirname, '../assets/exportTemplates/');

    let HTMLtemplate = fs.readFileSync(`${PATH}template.html`, 'utf8').toString();
    const data: any = await reportService.getReportIdentified();
    const progress: any = await reportService.getReportSummary();
    HTMLtemplate = HTMLtemplate.replace('#DATA', JSON.stringify(data.licenses));
    HTMLtemplate = HTMLtemplate.replace('#SUMMARY', JSON.stringify(progress));

    return HTMLtemplate;
  }
}
