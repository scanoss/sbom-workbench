import { NewLicenseDTO } from "../../api/dto";
import { License } from "../../api/types";
import { License as LicenseModel } from "../model/ORModel/License";
import { toEntity } from "../adapters/modelAdapter";



class WorkspaceService {

  public async getAllLicenses(): Promise<Array<License>> {
    const licenses  = await LicenseModel.findAll();
    return toEntity<Array<License>>(licenses);
  }

  public async createLicense(newLicenseDTO: NewLicenseDTO): Promise<License> {
    const {spdxid, name, fulltext, url} = newLicenseDTO;
    const license = await LicenseModel.create({spdxid, name, fulltext, url});
    return toEntity<License>(license)
  }

  public async deleteLicense(id: number): Promise<number> {

    await LicenseModel.destroy({
      where: {
        id
      }
    });

    return id;
  }

}


export const workspaceService = new WorkspaceService();
