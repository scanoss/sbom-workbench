
import { CryptographyAlgorithms, ReportComponent } from "../../../services/ReportService";
import { ModelAdapter } from "../adapter";

export interface IdentifiedComponentInput {
    purl: string; //spdxid
    name: string;
    vendor: string;
    url: string;
    version: string;
    license?: string;
    spdxid: string;
    algortithms: string;
    source: string;
}

export class IdentifiedComponentAdapter implements ModelAdapter<Array<IdentifiedComponentInput>,Array<ReportComponent>> {
    async run (input: Array<IdentifiedComponentInput>){
        const componentMapper = new Map<string, ReportComponent>();
        input.forEach((c)=>{
            const key = `${c.purl}@${c.version}`;
            if(componentMapper.has(key)) {
              const licenses = componentMapper.get(key).licenses;
              if(licenses){
                licenses.push(c.spdxid);
                componentMapper.get(key).licenses = Array.from(new Set(licenses));  
              }             
            }else {
                const algorithms =  (c.algortithms ?  c.algortithms?.split(','): [])  as unknown as Array<CryptographyAlgorithms>;
                const license = c.spdxid ? c.spdxid :'unknown';
                componentMapper.set(key,{...c,licenses: [license] ,  cryptography:algorithms })
            }
        });
        return Array.from(componentMapper.values());
    }
}

export const identifiedComponentAdapter = new IdentifiedComponentAdapter();