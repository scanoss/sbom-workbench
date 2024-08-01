import { modelProvider } from "../../../services/ModelProvider";
import { ComponentReport } from "./ComponentReport";
import { Report } from "./Report";
import { ReportComponent } from "../../../services/ReportService";
import { ComponentReportResponse } from "../../../../api/types";

export class ReportComponentIdentified extends Report {

    public async generate(v: ComponentReport):Promise<ComponentReportResponse> {
      return v.getIdentified(this);
    }

    public async getComponentFileCountMapper(): Promise<Map<string, { componentFileCount: number; declaredComponentFileCount: number; }>> {
        const componentFileCount = await modelProvider.model.component.getIdentifiedComponentFileCount(this.license);
        return this.fileCountComponentMapper(componentFileCount);
    }

    public async getComponents():Promise<Array<ReportComponent>> {
        let indentifiedComponents = await modelProvider.model.component.getIdentifiedComponents();
      if (this.license) {
        indentifiedComponents = this.filterComponentsByLicense(indentifiedComponents);
      }
      return indentifiedComponents;
    }

}