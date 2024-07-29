import { ComponentReportResponse } from "../../../../api/types";
import { ComponentReport } from "./ComponentReport";
import { ReportComponentIdentified } from "./ReportComponentIndentified";
import { ReportComponent } from "../../../services/ReportService";
import { ReportComponentDetected } from "./ReportComponentDetected";
;

export class ComponentReportVisitor extends ComponentReport {
    
    public async getIdentified(r: ReportComponentIdentified): Promise<ComponentReportResponse> {
        const allIdentifiedComponents = await r.getComponents();
        const componentFileCountMapper =  await r.getComponentFileCountMapper();

        const components: ReportComponent[] = [];
        const declaredComponents: ReportComponent[] = [];
        // Adds file count to each component depending on its source (detected or declared)
        allIdentifiedComponents.forEach((c)=>{
            const component = componentFileCountMapper.get(`${c.purl}@${c.version}`);
            if(c.source === 'detected') {        
              c.fileCount = component.componentFileCount;
              components.push(c);
            } 
            else{
              c.fileCount = component.declaredComponentFileCount;
              declaredComponents.push(c);
            } 
          });

          return {
            components,
            declaredComponents
          }
    }
    
    public async getDetected(r: ReportComponentDetected): Promise<ComponentReportResponse> {
        const components = await  r.getComponents();
        const declaredComponents = await r.getDeclaredComponents();
        const componentFileCountMapper =  await r.getComponentFileCountMapper();
        components.forEach((c)=> { c.fileCount = componentFileCountMapper.get(`${c.purl}@${c.version}`).componentFileCount });
        declaredComponents.forEach((c)=> { c.fileCount = componentFileCountMapper.get(`${c.purl}@${c.version}`).declaredComponentFileCount });
        return {
          components,
          declaredComponents
        }
    }
    

    
}