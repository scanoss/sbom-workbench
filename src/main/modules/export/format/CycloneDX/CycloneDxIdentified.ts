import { CycloneDX } from "./CycloneDX";
import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';

export class CycloneDXIdentified extends CycloneDX {
    protected getUniqueComponents(data: ExportComponentData[]) {
        const uniqueComponents = new Map<string, ExportComponentData>();
        data.forEach((comp) => {
            const key = `${comp.purl}@${comp.version}`;    
            if(uniqueComponents.has(key)){
                uniqueComponents.get(key).unique_concluded_licenses.push(comp.concluded_licenses);
            }else{           
                uniqueComponents.set(key, {...comp , unique_detected_licenses: comp.detected_licenses.split(' AND '), unique_concluded_licenses:[comp.concluded_licenses] });
            }    
        });

        return Array.from(uniqueComponents.values());
  
    }
   
    
}