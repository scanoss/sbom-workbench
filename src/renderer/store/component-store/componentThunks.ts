import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@store/rootReducer';
import { componentService } from '@api/services/component.service';
import { licenseService } from '@api/services/license.service';
import { NewLicenseDTO } from '@api/dto';
import { IComponentResult } from '../../../main/task/componentCatalog/iComponentCatalog/IComponentResult';
import { workbenchController } from '../../controllers/workbench-controller';

export const fetchComponent = createAsyncThunk('workbench/loadComponent', async (purl: string, thunkAPI) => {
  const response = await workbenchController.getComponent(purl);

  // TODO: remove this block after backend changes.
  if (!response) {
    const state = thunkAPI.getState() as RootState;
    return state.component.component;
  }

  return response;
});

export const fetchComponents = createAsyncThunk('workbench/loadComponents', async () => {
  const response = await workbenchController.getComponents();
  return response;
});

export const importGlobalComponent = createAsyncThunk(
  'workbench/importGlobalComponent',
  async (newComponent: IComponentResult) => {
    const licenses = async () => {
      const catalogLicenses = await licenseService.getAll();
      const lic = catalogLicenses.reduce((acc, curr) => {
        if (!acc[curr.spdxid]) acc[curr.spdxid] = curr;
        return acc;
      }, {});
      return lic;
    };

    const getNoCataloguedLicenses = (lic, componentVersions) => {
      const nonCataloguedLicenses = {};
      componentVersions.forEach((v) => {
        v.licenses.forEach((l) => {
          if (!lic[l.spdxId]) {
            if (!nonCataloguedLicenses[l.spdxId])
              nonCataloguedLicenses[l.spdxId] = {
                name: l.name,
                fulltext: '-',
                url: l.url,
                spdxid: l.spdxId,
              };
          }
        });
      });
      return Object.values(nonCataloguedLicenses) as Array<NewLicenseDTO>;
    };
    const component = await componentService.getGlobalComponentVersion({ purl: newComponent.purl });
    // Creates those licenses what not exists in the local catalogue
    const lic = await licenses();
    const nonCataloguedLicenses: any = getNoCataloguedLicenses(lic, component.versions);
    const newLic = nonCataloguedLicenses.map((l) => licenseService.create(l));
    const newLicenses: Array<NewLicenseDTO> = await Promise.all(newLic);
    newLicenses.forEach(function (nl) {
      lic[nl.spdxid] = nl;
    });
    const versions = component.versions.flatMap((v) => {
      const licenseVersion = { version: v.version, licenses: [] };
      v.licenses.forEach((l) => {
        licenseVersion.licenses.push(lic[l.spdxId].id);
      });
      return licenseVersion;
    });
    const response = await componentService.create({
      name: component.component,
      versions,
      purl: component.purl,
      url: component.url,
    });
    return response;
  }
);
