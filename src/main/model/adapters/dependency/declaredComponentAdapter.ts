import { CryptographyAlgorithms, ReportComponent } from "main/services/ReportService";
import { ModelAdapter } from "../adapter";

export interface DependencyComponentInput {
    file: string;
    component: string;
    purl: string;
    url: string;
    version: string;
    licenses: string;
}

export class DeclaredComponentAdapter implements ModelAdapter<Array<DependencyComponentInput>,Array<ReportComponent>> {
    async run (input: Array<DependencyComponentInput>) {
        const componentMapper = new Map<string, ReportComponent>();
        input.forEach((d)=>{
            const key = `${d.purl}@${d.version}`;
            if(componentMapper.has(key)) {
                const component = componentMapper.get(key);
              const licenses = component.licenses;
              if(licenses){
                let aux:Array<string>;
                if(d.licenses){
                    aux = [...licenses, ...d.licenses.split(',')];
                }else{
                    aux = ['unknown'];
                }
                component.licenses = Array.from(new Set(aux));
              }
              component.manifestFiles.push(d.file);
            }else {
                const algorithms = []  as unknown as Array<CryptographyAlgorithms>;
                const licenses = d.licenses ? d.licenses.split(',') : ['unknown'];
                componentMapper.set(key,{...d ,licenses ,source:'declared', name: d.purl, manifestFiles: [d.file], vendor:'',url:d.url,  cryptography:algorithms })
            }
        });


        return Array.from(componentMapper.values());
    }
}

export const declaredComponentsAdapter = new DeclaredComponentAdapter();
