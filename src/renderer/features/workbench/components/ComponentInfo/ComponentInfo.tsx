import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Title from '../Title/Title';

export const ComponentInfo = ({ component }: { component: any }) => {
  const { t } = useTranslation();

  const [over, setOver] = useState<boolean>(false);
  const group = !!component.versions;

  const getReliableLicense = (licenses: Array<any>, spdxid: string) => {
    return licenses.find((license) => license.spdxid === spdxid) || licenses[0];
  };

  const version = group
    ? component.versions?.length === 1
      ? component.versions[0].version
      : `${component.versions.length} versions`
    : component.version;

  // get all not repeated licenses
  const licenses = React.useRef([...new Map(component.versions.map((version) =>version.licenses).flat().map(item => [item.spdxid, item])).values()]);

  // get displayed license
  const license = React.useRef(
    component.licenses || component.versions
      ? group
        ? getReliableLicense(licenses.current, component.versions.find((version) => version.reliableLicense !== null)?.reliableLicense)?.name
        : component.licenses[0]
      : '-'
  );

  return (
    <div className="component-info">
      <div onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)} className="container-component-info">
        <div className="main-info selectable">
          <div>
            <Title title={component?.name} />
          </div>
        </div>

        {over ? (
          <div className="component-details-card selectable">
            <div className="tiny-container-detail">
              <p className="title-detail">{t('Title:License')}</p>
              <p className="desc-detail">{license.current}</p>
            </div>
            <div className="tiny-container-detail">
              <p className="title-detail">{t('Title:PURL')}</p>
              <p className="desc-detail">{component?.purl}</p>
            </div>
            <div className="tiny-container-detail">
              <p className="title-detail">{t('Title:URL')}</p>
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
