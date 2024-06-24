import * as CDX from '@cyclonedx/cyclonedx-library';
import AppConfig from '../../../../config/AppConfigModule';
import { ExportSource } from '../../../../api/types';
import { workspace } from '../../../workspace/Workspace';
import { Format } from '../Format';

export class CycloneDX extends Format {
  private source: string;

  constructor(source: string) {
    super();
    this.source = source;
    this.extension = '.bom';
  }

  // See CycloneDX 1.6 https://cyclonedx.org/docs/1.6/json
  // See CycloneDX Example w/ Crypto & Dependencies https://raw.githubusercontent.com/CycloneDX/bom-examples/master/CBOM/Example-With-Dependencies/bom.json
  public async generate() {
    /*
    TODO:
          - Get project licence and add to bom.metadata.component.license
          - Get crypto algorithms and add to bom.components (with "type"="cryptographic-asset")
          - Get dependencies and reference all to project (since there is not support yet for transitive dependencies)
          -
     */
    const bom = new CDX.Models.Bom();

    // bom.metadata.component.;

    const lFac = new CDX.Factories.LicenseFactory();

    lFac.makeSpdxLicense('asd');
  }
}
