import React, { useState } from 'react';
import Label from '../Label/Label';
import Title from '../Title/Title';
import componentDefault from '../../../../../../assets/imgs/component-default.svg';
import { Component, ComponentGroup } from '../../../../../api/types';

export const ComponentInfo = ({ component }: { component: any }) => {
  const [over, setOver] = useState<boolean>(false);
  const group = !!component.versions;

  const version = group
    ? component.versions.length === 1
      ? component.versions[0].version
      : `${component.versions.length} versions`
    : component.version;
  const license = group ? component.versions[0].licenses[0]?.name : component.licenses[0];

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
