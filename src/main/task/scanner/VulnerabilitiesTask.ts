import { ITask } from '../Task';
import { Project } from '../../workspace/Project';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import {modelProvider} from "../../services/ModelProvider";
import {IpcChannels} from '../../../api/ipc-channels';

export class VulnerabilitiesTask implements ITask<void, void> {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

 public async run(params: void): Promise<void> {
  this.updateStatus();
  const detectedComponents = await modelProvider.model.component.getAll(null);
  const dependencyComponents = await modelProvider.model.dependency.getAll(null);
  const components = this.groupComponentByPurlVersion(detectedComponents, dependencyComponents);
  // TODO: here we should call to gRPC service with all components
  const vulnerabilities =  await this.getVulnerabilities();

  const v = this.groupVulnerabilitiesByCVE(vulnerabilities);
  await modelProvider.model.vulnerability.insertBatch(Object.values(v));
  await modelProvider.model.vulnerability.insertComponentVulnerabilityFromGRPC(vulnerabilities.purls);
  await this.project.save();
  }

  private groupComponentByPurlVersion(components: any,dependencyComponents: any): Array<string>{
    const allComponents = components.concat(dependencyComponents);
    const compSet = new Set<string>();
    allComponents.forEach((c)=>{
      if(c.purl && c.version){
        compSet.add(`${c.purl}@${c.version}`);
      }
    });
    const response = Array.from(compSet);
    return response;
  }

  private groupVulnerabilitiesByCVE(vulnerabilities: any){
    const response:any = {};
    vulnerabilities.purls.forEach((p)=>{
      p.vulnerabilities.forEach((v)=>{
        if(!response[v.cve]) response[v.cve] = v;
      });
    });
  return response;
  }

  private async getVulnerabilities() {
    return {
      "purls": [
        {
          "purl":"pkg:github/scanoss/minr@1.18",
          "vulnerabilities": [
            {
              "id": "",
              "cve": "CVE-2018-8088",
              "url": "url1",
              "summary": "",
              "severity": "CRITICAL",
              "introduced": "a",
              "reported": "a",
              "patched": "a",
              "source": "a"
            },
            {
              "id": "",
              "cve": "CVE-2018-8090",
              "url": "b",
              "summary": "b",
              "severity": "CRITICAL",
              "introduced": "b",
              "reported": "b",
              "patched": "b",
              "source": "b"
            },
          ]
        }, {
          "purl": "pkg:github/scanoss/minr@2.0.6",
          "vulnerabilities": [
            {
              "id": "",
              "cve": "CVE-2018-8088",
              "url": "url1",
              "summary": "c",
              "severity": "CRITICAL",
              "introduced": "",
              "reported": "",
              "patched": "",
              "source": ""
            },
            {
              "id": "",
              "cve": "CVE-2018-8089",
              "url": "",
              "summary": "",
              "severity": "CRITICAL",
              "introduced": "",
              "reported": "",
              "patched": "",
              "source": "",

            }
          ]
        }
      ]
    }
  }

  private updateStatus(){
    broadcastManager.get().send(IpcChannels.SCANNER_UPDATE_STATUS, {
      stage: {
        stageName: `Searching vulnerabilities`,
        stageStep: 4,
      },
      processed: 0,
    });
  }


}


