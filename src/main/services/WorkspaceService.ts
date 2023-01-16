import { Component } from '../model/ORModel/Component';
import { GlobalComponent } from '../../api/types';
import { Version } from '../model/ORModel/Version';
import { License , License as LicenseModel } from '../model/ORModel/License';
import { toEntity } from '../adapters/modelAdapter';
import { LicenseVersion } from '../model/ORModel/LicenseVersion';
import { NewGlobalComponentDTO , NewLicenseDTO } from '../../api/dto';

class WorkspaceService {
  public async getAllComponents(): Promise<Array<GlobalComponent>> {
    const componentsModel = await Component.findAll({ include: [{ model: Version, include: [License] }] });
    const components = toEntity<Array<GlobalComponent>>(componentsModel);
    return components;
  }

  public async createComponent(newComponentDTO: NewGlobalComponentDTO): Promise<GlobalComponent> {
    const { name, purl, versions } = newComponentDTO;
    const licenseVersionMapper = new Map<string, any>();
    versions.forEach((v) => {
      licenseVersionMapper.set(v.version, v);
    });
    const newVersions = versions.map((v) => {
      return { version: v.version, url: v.url }
    });
    const newComponent = await Component.create({ name, purl, versions: newVersions }, { include: [Version] });
    newComponent.versions.forEach((v) => {
      const version = licenseVersionMapper.get(v.version);
      version.id = v.id;
    });
    const licenseVersion = Array.from(licenseVersionMapper.values());
    for (let i = 0; i < licenseVersion.length; i++) {
      const versionId = licenseVersion[i].id;
      for (let j = 0; j < licenseVersion[i].licenses.length; j++) {
        const licenseId = licenseVersion[i].licenses[j];
        await LicenseVersion.create({ licenseId, versionId })
      }
    }
    const component = await Component.findByPk(newComponent.id, { include: [{ model: Version, include: [License] }] });
    return toEntity<GlobalComponent>(component);
  }

  public async deleteComponent(id: number): Promise<GlobalComponent> {
    const componentModel = await Component.findByPk(id);
    const component = toEntity<GlobalComponent>(componentModel);
    await Component.destroy({ where: { id } });
    return component;
  }

  public async getAllLicenses(): Promise<Array<License>> {
    const licenses = await LicenseModel.findAll();
    return toEntity<Array<License>>(licenses);
  }

  public async createLicense(newLicenseDTO: NewLicenseDTO): Promise<License> {
    const { spdxid, name, fulltext, url } = newLicenseDTO;
    const license = await LicenseModel.create({ spdxid, name, fulltext, url });
    return toEntity<License>(license)
  }

  public async deleteLicense(id: number): Promise<number> {
    await LicenseModel.destroy({ where: { id } });
    return id;
  }
}


export const workspaceService = new WorkspaceService();
