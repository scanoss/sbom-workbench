import { ComponentReportResponse } from "../../../../api/types";
import { ReportComponent } from "../../../services/ReportService";
import { ComponentReport } from "./ComponentReport";

export abstract class Report {

    protected license: string;
    constructor(license?: string){
        this.license = license; 
    }

    public abstract generate(v: ComponentReport): Promise<ComponentReportResponse>;
    
    public abstract getComponentFileCountMapper():Promise<Map<string, { componentFileCount: number, declaredComponentFileCount: number }>>;


    protected filterComponentsByLicense(components: Array<ReportComponent>): Array<ReportComponent> {
      const licenseToLower = this.license.toLowerCase();  
      const filteredComponents = components.filter((c)=> {
        return c.licenses.some((l)=> l.toLowerCase()=== licenseToLower); 
      });
      return filteredComponents;
    }

    protected fileCountComponentMapper(input : Array<{ purl: string, version: string, fileCount: number, source: string}>):Map<string, { componentFileCount: number, declaredComponentFileCount: number }> {
        const componentFileCountMapper = new Map<string, { componentFileCount: number, declaredComponentFileCount: number }>();
    
        // Adds files detected for each component (divided in 'detected' and 'declared')
        input.forEach((c) => { 
          const key = `${c.purl}@${c.version}`;
          const existingEntry = componentFileCountMapper.get(key);    
          if (existingEntry) {
            if (c.source === 'declared') {
              existingEntry.declaredComponentFileCount = c.fileCount;
            } else {
              existingEntry.componentFileCount = c.fileCount;
            }
          } else {
            const fileCount = {
              componentFileCount: c.source === 'declared' ? 0 : c.fileCount,
              declaredComponentFileCount: c.source === 'declared' ? c.fileCount : 0,
            };
            componentFileCountMapper.set(key, fileCount);
          }
        });
        return componentFileCountMapper;
      }


}