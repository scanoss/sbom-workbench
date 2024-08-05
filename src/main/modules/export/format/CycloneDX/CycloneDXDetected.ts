import * as CDX from '@cyclonedx/cyclonedx-library';
import { DataRecord } from "main/model/interfaces/report/DataRecord";
import { CycloneDX } from "./CycloneDX";
import { PackageURL } from 'packageurl-js';
import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';

export class CycloneDXDetected extends CycloneDX {
    protected getUniqueComponents(data: ExportComponentData[]) {       
        const uniqueComponents = new Map<string, ExportComponentData>();
        data.forEach((comp) => {
          const key = `${comp.purl}@${comp.version}`;     
            uniqueComponents.set(key, {...comp , unique_detected_licenses: comp.detected_licenses ? comp.detected_licenses?.split(' AND '): [] , unique_concluded_licenses:[] });
        });

        return Array.from(uniqueComponents.values());
  

    }

    
    
}