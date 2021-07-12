import { Card, CardContent, Typography, Tooltip, ButtonBase } from '@material-ui/core';
import React from 'react';
import componentDefault from '../../../../../assets/imgs/component-default.svg';
import { Component } from '../../types';

interface ComponentCardProps {
  component: Component;
  onClick: (component) => void;
}

const ComponentCard = ({ component, onClick }: ComponentCardProps) => {
  return (
    <>
      <Card className="component-card" elevation={1}>
        <ButtonBase onClick={() => onClick(component)}>
          <CardContent className="component-card-content">
            <figure>
              <img alt="component logo" src={componentDefault} />
            </figure>
            <div className="component-card-info">
              <p>{component.version}</p>
              <Tooltip title={component.name}>
                <Typography variant="h6" gutterBottom>
                  {component.name}
                </Typography>
              </Tooltip>
            </div>
            <div className="component-card-files">
              {component.count.identified !== 0 ? (
                <span className="info-count identified">{component.count.identified}</span>
              ) : null}
              {component.count.pending !== 0 ? (
                <span className="info-count pending">{component.count.pending}</span>
              ) : null}
              {component.count.ignored !== 0 ? (
                <span className="info-count ignored">{component.count.ignored}</span>
              ) : null}
            </div>
          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

export default ComponentCard;
