import { workspace } from '../workspace/Workspace';

class ReportService {
  public async getReportSummary() {
    try {
      let tempSummary: any = {};
      tempSummary = await workspace.getOpenedProjects()[0].scans_db.inventories.getCurrentSummary();
      const projectSummary = workspace.getOpenedProjects()[0].filesSummary;
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
      data = await workspace.getOpenedProjects()[0].scans_db.components.getIdentifiedForReport();
      const licenses = [];
      data.forEach((element) => {
        const aux: any = {};
        const index = licenses.findIndex((obj) => obj.label === element.license_name);
        if (index >= 0) {
          licenses[index].components.push({
            name: element.comp_name,
            vendor: element.comp_name,
            url: element.url,
            purl: element.pur,
            version: element.version,
          });
          licenses[index].value += 1;
        } else {
          aux.components = [];
          aux.components.push({
            name: element.comp_name,
            vendor: element.comp_name,
            url: element.url,
            purl: element.purl,
            version: element.version,
          });
          aux.value = 1;
          aux.label = element.license_name;
          licenses.push(aux);
        }
      });
      return { licenses };
    } catch (error) {
      return error;
    }
  }
}

export const reportService = new ReportService();
