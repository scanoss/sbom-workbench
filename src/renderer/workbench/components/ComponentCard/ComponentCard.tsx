import {
  Card,
  CardContent,
  Typography,
  Tooltip,
  ButtonBase,
} from '@material-ui/core';
import React from 'react';
import { Component } from '../../WorkbenchProvider';
import componentDefault from '../../../../../assets/imgs/component-default.svg';

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
              <span className="info-count">{component.files.length}</span>
            </div>
          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

export default ComponentCard;
