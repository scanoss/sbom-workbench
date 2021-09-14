import { defaultProject } from '../workspace/ProjectTree';

class ReportService {
  public async getReportSummary() {
    try {
      let tempSummary: any = {};
      tempSummary = await defaultProject.scans_db.inventories.getCurrentSummary();
      const projectSummary = defaultProject.filesSummary;
      const summary = {
        totalFiles: 0,
        includedFiles: 0,
        filteredFiles: 0,
        scannedFiles: 0,
        pendingFiles: 0,
        identifiedFiles: 0,
        ignoredFiles: 0,
        detectedFiles: 0,
      };
      summary.totalFiles = projectSummary.total;
      summary.includedFiles = projectSummary.include;
      summary.filteredFiles = projectSummary.filter;
      summary.scannedFiles = tempSummary[0].identified + tempSummary[0].ignored + tempSummary[0].pending;
      summary.pendingFiles = tempSummary[0].pending;
      summary.identifiedFiles = tempSummary[0].identified;
      summary.ignoredFiles = tempSummary[0].ignored;
      summary.detectedFiles = tempSummary[0].detected;
      return summary;
    } catch (error) {
      return error;
    }
  }

  public async getReportIdentified() {
    try {
      let data: any = [];
      data = await defaultProject.scans_db.components.getIdentifiedForReport();
      const result = data.reduce((acc: any, value) => {
        const key = value.spdxid;
        if (!Object.prototype.hasOwnProperty.call(acc, key)) acc[`${key}`] = [];
        acc[`${key}`].push({ name: value.comp_name, version: value.version, purl: value.purl, url: value.url });
        return acc;
      }, {});

      return result;
    } catch (error) {
      return error;
    }
  }
}

export const reportService = new ReportService();
