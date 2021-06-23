import { Card, CardContent } from '@material-ui/core';
import React from 'react';
import { Component } from '../../WorkbenchProvider';
import componentDefault from '../../../../../assets/imgs/component-default.svg';

interface ComponentCardProps {
  component: Component;
}

const ComponentCard = ({ component }: ComponentCardProps) => {
  return (
    <>
      <Card className="component-card">
        <CardContent className="component-card-content">
          <figure>
            <img alt="component logo" src={componentDefault} />
          </figure>
          <div className="component-card-info">
            <p>{component.version}</p>
            <p>{component.name}</p>
          </div>
          <div className="component-card-files">
            <p>{component.files.length}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ComponentCard;
