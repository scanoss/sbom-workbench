
import { CryptographyAlgorithms, LicenseReport, ReportComponent } from "main/services/ReportService";
import { ModelAdapter } from "../adapter";

//c.purl, c.name, r.vendor, c.url, c.version, l.name AS license, l.spdxid, crypt.algorithms
// Report
export interface DetectedComponentInput {
    purl: string; //spdxid
    name: string;
    vendor: string;
    url: string;
    version: string;
    license?: string;
    spdxid: string;
    algortithms: string;
}

export class DetectedComponentAdapter implements ModelAdapter<Array<DetectedComponentInput>,Array<ReportComponent>> {
    async run (input: Array<DetectedComponentInput>){
        const componentMapper = new Map<string, ReportComponent>();
        input.forEach((c)=>{
            const key = `${c.purl}@${c.version}`;
            if(componentMapper.has(key)) {
              const licenses = componentMapper.get(key).licenses;
              if(licenses){
                const aux = [...licenses, c.spdxid];
                componentMapper.get(key).licenses = Array.from(new Set(aux));  
              }             
            }else {
                const algorithms =  (c.algortithms ?  c.algortithms?.split(','): [])  as unknown as Array<CryptographyAlgorithms>;
                const license = c.spdxid ? c.spdxid :'unknown';
                componentMapper.set(key,{...c,licenses: [license] ,source:'detected',  cryptography:algorithms })
            }
        });
        return Array.from(componentMapper.values());
    }
}

export const detectedComponentAdapter = new DetectedComponentAdapter();