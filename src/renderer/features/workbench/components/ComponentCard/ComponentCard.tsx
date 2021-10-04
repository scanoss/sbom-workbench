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

  return (
    <>
      <Card className={`component-card ${multiple && 'multiple'}`} elevation={1}>
        <ButtonBase onClick={() => onClick(component)}>
          <CardContent className="component-card-content">
            <figure>
              <img alt="component logo" src={componentDefault} />
            </figure>
            <div className="component-card-info">
              <p>{multiple ? `${component.versions.length} versions` : component.versions[0].version}</p>
              {component.name.length > 15 ? (
                <Tooltip title={component.name}>
                  <h6>{component.name}</h6>
                </Tooltip>
              ) : (
                <h6>{component.name}</h6>
              )}
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

export default ComponentCard;
