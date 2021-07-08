import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import { Component } from '../../WorkbenchProvider';
import Label from '../Label/Label';
import Title from '../Title/Title';
import componentDefault from '';

export const ComponentInfo = ({ component }: { component: Component }) => {
  const [over, setOver] = useState<boolean>(false);

  const useStyles = makeStyles((theme) => ({
    popover: {
      pointerEvents: 'none',
    },
    paper: {
      padding: theme.spacing(1),
    },
  }));
  const classes = useStyles();

  useEffect(() => {
    console.log(over);
  }, [over]);
  return (
    <div className="component-info">
      <div
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        className="container-component-info"
      >
        <Label label={component?.version} textColor="gray" />
        <Title title={component?.name} />

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
              <a href={component?.url} className="desc-detail url">
                {component?.url}
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {/* <div>
        <Label label="VENDOR" textColor="gray" />
        <Title title={component?.vendor} />
      </div>
      <div>
        <Label label="VERSION" textColor="gray" />
        <Title title={component?.version} />
      </div>
      <div>
        <Label label="LICENSE" textColor="gray" />
        <Title
          title={
            component?.licenses && component.licenses[0]
              ? component?.licenses[0].name
              : '-'
          }
        />
      </div> */}
    </div>
  );
};

export default ComponentInfo;
