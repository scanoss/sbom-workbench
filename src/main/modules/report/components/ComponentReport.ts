import { ComponentReportResponse } from "../../../../api/types";
import { ReportComponentDetected } from "./ReportComponentDetected";
import { ReportComponentIdentified } from "./ReportComponentIndentified";


export abstract class ComponentReport {
   public abstract getIdentified(r: ReportComponentIdentified):Promise<ComponentReportResponse>;
   public abstract getDetected(r: ReportComponentDetected):Promise<ComponentReportResponse>;
}