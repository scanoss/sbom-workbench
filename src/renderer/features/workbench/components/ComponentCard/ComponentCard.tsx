import React from 'react';
import { Card, CardContent, Tooltip, ButtonBase } from '@material-ui/core';
import componentDefault from '../../../../../../assets/imgs/component-default.svg';
import { ComponentGroup } from '../../../../../api/types';

interface ComponentCardProps {
  component: ComponentGroup;
  onClick: (component) => void;
}

const ComponentCard = ({ component, onClick }: ComponentCardProps) => {
  const multiple: boolean = component.versions.length > 1;
  const keepOriginal: boolean =  component.identifyAs.some(item => item.purl == component.purl);
  const override: boolean = !component.summary?.pending && !keepOriginal;

  return (
    <>
      <Card
        className={`
          component-card
          ${multiple && 'multiple'}
          ${override && 'override'}
        `}
        elevation={1}>
        <ButtonBase onClick={() => onClick(component)}>
          <CardContent className="component-card-content">
            <figure>
              <img alt="component logo" src={componentDefault} />
            </figure>
            <div className="component-card-info">
              { !override ? (
                <>
                  <p>{multiple ? `${component.versions.length} versions` : component.versions[0].version}</p>
                  <ComponentName name={component.name} />
                </>
              ) : (
                <>
                  <ComponentName name={component.name} />
                  <ComponentName name={component.identifyAs[0].name} />
                </>
              ) }
            </div>
            <div className="component-card-files">
              {component.summary.identified !== 0 ? (
                <span className="info-count has-status-bullet identified">{component.summary.identified}</span>
              ) : null}
              {component.summary.pending !== 0 ? (
                <span className="info-count has-status-bullet pending">{component.summary.pending}</span>
              ) : null}
              {component.summary.ignored !== 0 ? (
                <span className="info-count has-status-bullet ignored">{component.summary.ignored}</span>
              ) : null}
            </div>
          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

const ComponentName = ({ name }) => {
  return (
    name.length > 15 ? (
      <Tooltip title={name}>
        <h6>{name}</h6>
      </Tooltip>
    ) : (
      <h6>{name}</h6>
    )
  );
}

export default ComponentCard;
