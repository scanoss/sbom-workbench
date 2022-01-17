import fs from 'fs';
import { reportService } from '../../services/ReportService';
import { workspace } from '../../workspace/Workspace';
import { Format } from '../Format';

const pathLib = require('path');

export class HtmlSummary extends Format {
  private dataTemplate: any;

  constructor() {
    super();
    this.extension = '-report.html';
  }

  // @override
  public async generate() {
    const isDev = process.env.NODE_ENV !== 'production';

    const PATH = isDev
      ? pathLib.join(__dirname, '../../../../assets/exportTemplates/')
      : pathLib.join(__dirname, '../assets/exportTemplates/');

    const HTMLtemplate = fs.readFileSync(`${PATH}template.html`, 'utf8').toString();

    this.dataTemplate = fs.readFileSync(`${PATH}report.js`, 'utf8').toString();

    const data: any = await reportService.getReportIdentified();
    const progress:any = await reportService.getReportSummary();


    this.dataTemplate = this.dataTemplate.replace('#DATA', JSON.stringify(data.licenses));

    this.dataTemplate = this.dataTemplate.replace('#SUMMARY', JSON.stringify(progress));

    return HTMLtemplate.toString();
  }

  public async save(path: string) {
    const file = await this.generate();
    try {
      const p = workspace.getOpenedProjects()[0];
      const projectPath = p.getMyPath();
      const saveName = path.split(pathLib.sep).slice(-1)[0];

      if (!fs.existsSync(`${projectPath}/report`)) fs.mkdirSync(`${projectPath}/report`, { recursive: false });
      await fs.promises.writeFile(`${projectPath}/report/report.js`, this.dataTemplate);
      return await fs.promises.writeFile(`${projectPath}/report/${saveName}${this.extension}`, file);
    } catch (error) {
      return error;
    }
  }
}
