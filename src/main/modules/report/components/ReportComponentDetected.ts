import { ReportComponent } from "main/services/ReportService";
import { ComponentReport } from "./ComponentReport";
import { Report } from "./Report";
import { ComponentReportResponse } from "../../../../api/types";
import { modelProvider } from "../../../../main/services/ModelProvider";

export class ReportComponentDetected extends Report {
    
    public generate(v: ComponentReport):Promise<ComponentReportResponse> {
        return v.getDetected(this);
    }
    
    public async getComponents(): Promise<ReportComponent[]> {
        const components = await modelProvider.model.component.findAllDetectedComponents();
        if(!this.license) return components;
        const filteredComponents = this.filterComponentsByLicense(components);
        return filteredComponents;
    }

    public async getDeclaredComponents(): Promise<ReportComponent[]> {
        const components = await modelProvider.model.dependency.findAllDeclaredComponents();
        if(!this.license) return components;
        const filteredComponents = this.filterComponentsByLicense(components);
        return filteredComponents;        
    }
    
    public async getComponentFileCountMapper(): Promise<Map<string, { componentFileCount: number; declaredComponentFileCount: number; }>> {
        const componentFileCount = await modelProvider.model.component.getDetectedComponentFileCount();
        return this.fileCountComponentMapper(componentFileCount);
    }

}