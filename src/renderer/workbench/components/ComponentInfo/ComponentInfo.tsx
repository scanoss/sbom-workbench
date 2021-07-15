import React, { useState } from 'react';
import Label from '../Label/Label';
import Title from '../Title/Title';
import componentDefault from '../../../../../assets/imgs/component-default.svg';
import { Component } from '../../../../api/types';

export const ComponentInfo = ({ component }: { component: Component }) => {
  const [over, setOver] = useState<boolean>(false);

  return (
    <div className="component-info">
      <div
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        className="container-component-info"
      >
        <div className="main-info">
          <img alt="component logo" className="logo" src={componentDefault} />
          <div>
            <Label label={component?.version} textColor="gray" />
            <Title title={component?.name} />
          </div>
        </div>

        {over ? (
          <div className="component-details-card">
            <div className="tiny-container-detail">
              <p className="title-detail">License</p>
              <p className="desc-detail">{component?.name}</p>
            </div>
            <div className="tiny-container-detail">
              <p className="title-detail">PURL</p>
              <p className="desc-detail">{component?.purl}</p>
            </div>
            <div className="tiny-container-detail">
              <p className="title-detail">URL</p>
              <a
                href={component?.url}
                target="_blank"
                className="desc-detail url"
                rel="noreferrer"
              >
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
