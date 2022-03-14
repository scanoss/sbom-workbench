/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */

import { DependencyDTO, Inventory } from '../../api/types';

class DependencyHelper {
  public dependecyModelAdapter(dependency: any) {
    const dep = dependency.filesList.map((file) => {
      file.dependenciesList.map((depList) => (depList.licensesList = depList.licensesList.map((lic) => lic.spdxId)));
      return file;
    });
    return dep;
  }

  public async mergeInventoryComponentToDependency(
    dep: Array<any>,
    inventory: any,
    component: any
  ): Promise<Array<DependencyDTO>> {
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
      if (d.inventory) {
        d.inventory = inv[d.inventory];
        d.component = comp[d.compid];
      }
    });
    return dep;
  }
}

export const dependencyHelper = new DependencyHelper();
