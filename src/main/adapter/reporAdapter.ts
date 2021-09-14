import { defaultProject } from '../workspace/ProjectTree';

class ReportAdapter {
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
}

export const reportAdapter = new ReportAdapter();
