
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
    file: string;
}

export class IdentifiedComponentAdapter implements ModelAdapter<Array<IdentifiedComponentInput>,Array<ReportComponent>> {
    async run (input: Array<IdentifiedComponentInput>){
        const componentMapper = new Map<string, ReportComponent>();
        input.forEach((c)=>{
            // Use purl, version and sorue as key. A component can be used to identified a dependency or a component
            const key = `${c.purl}@${c.version}@${c.source}`;
            if(componentMapper.has(key)) {
              const component =  componentMapper.get(key);
              const licenses = component.licenses;
              if(licenses){
                licenses.push(c.spdxid);
                component.licenses = Array.from(new Set(licenses));  
              }     
              if (c.source === 'declared') component.manifestFiles.push(c.file);          
            }else {
                // Adds new component to map
                const algorithms =  (c.algortithms ?  c.algortithms?.split(','): [])  as unknown as Array<CryptographyAlgorithms>;
                // if license is not defined , set unknown license
                const license = c.spdxid ? c.spdxid :'unknown';                
                componentMapper.set(key,{...c,
                      licenses: [license],
                      cryptography:algorithms,
                      ...(c.source === 'declared' ? { manifestFiles: [c.file] } : {})
                    });
                
            }
        });
        return Array.from(componentMapper.values());
    }
}

export const identifiedComponentAdapter = new IdentifiedComponentAdapter();