import React, { useState } from 'react';
import Title from '../Title/Title';

export const ComponentInfo = ({ component }: { component: any }) => {
  const getReliableLicense = (licenses: Array<any>, spdxid: string) => {
    return licenses.find((license) => license.spdxid === spdxid) || licenses[0];
  };
  const [over, setOver] = useState<boolean>(false);
  const group = !!component.versions;
  const version = group
    ? component.versions?.length === 1
      ? component.versions[0].version
      : `${component.versions.length} versions`
    : component.version;
  const license =
    component.licenses || component.versions
      ? group
        ? getReliableLicense(component.versions[0].licenses,component.versions[0].reliableLicense)?.name
        : component.licenses[0]
      : '-';

  return (
    <div className="component-info">
      <div onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)} className="container-component-info">
        <div className="main-info">
          <div>
            <Title title={component?.name} />
          </div>
        </div>

        {over ? (
          <div className="component-details-card">
            <div className="tiny-container-detail">
              <p className="title-detail">License</p>
              <p className="desc-detail">{license}</p>
            </div>
            <div className="tiny-container-detail">
              <p className="title-detail">PURL</p>
              <p className="desc-detail">{component?.purl}</p>
            </div>
            <div className="tiny-container-detail">
              <p className="title-detail">URL</p>
              <a href={component?.url} target="_blank" className="desc-detail url" rel="noreferrer">
                {component?.url}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ComponentInfo;
