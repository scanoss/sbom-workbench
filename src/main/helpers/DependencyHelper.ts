/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */

import { FilesList } from 'scanoss';
import { Dependency } from '../../api/types';
import { Dependency as Dep } from '../model/entity/Dependency';

class DependencyHelper {
  public dependencyModelAdapter(fileList: Array<FilesList>, files: Record<string, number>): Array<Dep> {
    const dependencies : Array<Dep> = [];
    fileList.forEach((file) => {
      file.dependenciesList.forEach((depList) => {
        const auxDep = new Dep();
        auxDep.fileId = files[file.file];
        auxDep.version = depList.version || depList.requirement || null;
        auxDep.originalVersion = depList.version || depList.requirement || null;
        auxDep.purl = depList.purl;
        auxDep.component = depList.component;
        auxDep.scope = depList.scope ? depList.scope : null;
        auxDep.licenses = [];
        auxDep.originalLicense = [];
        depList.licensesList.forEach((l) => {
          if (l.spdxId !== '') {
            auxDep.licenses.push(l.spdxId);
            auxDep.originalLicense.push(l.spdxId);
          }
        });
        dependencies.push(auxDep);
      });
    });
    return dependencies;
  }

  public mergeInventoryComponentToDependency(
    dep: Array<any>,
    inventory: any,
    component: any,
  ): Array<Dependency> {
    let inv: any = inventory;
    let comp: any = component;
    inv = inv.reduce((acc, curr) => {
      if (!acc[curr.id]) acc[curr.id] = curr;
      return acc;
    }, {});
    comp = comp.reduce((acc, curr) => {
      if (!acc[curr.compid]) acc[curr.compid] = curr;
      return acc;
    }, {});
    dep.forEach((d) => {
      if (d.valid === 1) d.valid = true;
      else d.valid = false;
      if (d.inventory) {
        d.inventory = inv[d.inventory];
        d.component = comp[d.compid];
      }
    });
    return dep;
  }
}

export const dependencyHelper = new DependencyHelper();
