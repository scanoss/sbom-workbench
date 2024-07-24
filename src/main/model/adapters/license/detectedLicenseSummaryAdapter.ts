
import { LicenseReport } from "main/services/ReportService";
import { DetectedLicenseSummary } from "../../../../api/types";
import { modelProvider } from "../../../services/ModelProvider";
import { ModelAdapter } from "../adapter";


// Report
export interface LicenseReportEntry {
    spdxid: string; //spdxid
    componentLicenseCount: number;
    dependencyLicenseCount: number;
  }

export class DetectedLicenseSummaryAdapter implements ModelAdapter<Array<LicenseReportEntry>,Array<LicenseReport>> {
    async run (input: Array<LicenseReportEntry>){
        return input.map((l: LicenseReportEntry)=>{ l
            return { label: l.spdxid, value: l.componentLicenseCount + l.dependencyLicenseCount }
        });   
    }
}

export const detectedLicenseSummaryAdapter = new DetectedLicenseSummaryAdapter();