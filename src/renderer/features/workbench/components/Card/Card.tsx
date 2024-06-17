import React from 'react';
import { Card, CardContent, Tooltip, ButtonBase } from '@mui/material';
import { useSelector } from 'react-redux';
import { ComponentGroup } from '@api/types';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import IconComponent from '../IconComponent/IconComponent';

interface ComponentCardProps {
  component: ComponentGroup;
  onClick: (component) => void;
  children: any;
}

const ComponentCard = ({ children, component, onClick }: ComponentCardProps) => {
  const state = useSelector(selectWorkbench);

  const identified = component.identifiedAs.filter((item) => item.purl !== component.purl);
  const keepOriginal: boolean = identified.length < component.identifiedAs.length;
  const override: boolean = !component.summary?.pending && !keepOriginal;

  return (
    <Card
      className={`
          component-card
          ${override && 'override'}
        `}
      elevation={1}
    >
      <ButtonBase onClick={() => onClick(component)}>
        <CardContent className="component-card-content">

          {children}

          <div className={`component-card-files ${state.filter?.status || 'no-status-filter'}`}>
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
  );
};

const ComponentInfo = ({ name }) => (name?.length > 15 ? (
  <Tooltip title={name}>
    <h6>{name}</h6>
  </Tooltip>
) : (
  <h6>{name}</h6>
));

const VersionInfo = ({ multiple, versions }) => {
  const { t } = useTranslation();

  return <p>{multiple ? t('CountVersions', { count: versions.length }) : versions[0].version}</p>;
};

export default ComponentCard;

/*

    <Card>

    </Card>

 */
