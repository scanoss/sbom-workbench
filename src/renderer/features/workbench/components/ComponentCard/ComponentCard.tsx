import React from 'react';
import { Card, CardContent, Tooltip, ButtonBase } from '@mui/material';
import { useSelector } from 'react-redux';
import { ComponentGroup } from '@api/types';
import IconComponent from '../IconComponent/IconComponent';
import { selectWorkbench } from '../../../../store/workbench-store/workbenchSlice';

interface ComponentCardProps {
  component: ComponentGroup;
  onClick: (component) => void;
}

const ComponentCard = ({ component, onClick }: ComponentCardProps) => {
  const state = useSelector(selectWorkbench);

  const multiple: boolean = component.versions.length > 1;
  const identified = component.identifiedAs.filter((item) => item.purl !== component.purl);
  const keepOriginal: boolean = identified.length < component.identifiedAs.length;
  const override: boolean = !component.summary?.pending && !keepOriginal;

  return (
    <>
      <Card
        className={`
          component-card
          ${multiple && 'multiple'}
          ${override && 'override'}
        `}
        elevation={1}
      >
        <ButtonBase onClick={() => onClick(component)}>
          <CardContent className="component-card-content">
            <IconComponent name={component.vendor} size={64} />
            <div className="component-card-info">
              {override ? (
                <>
                  <div className="original">
                    <VersionInfo multiple={multiple} versions={component.versions} />
                    <ComponentInfo name={component.name} />
                  </div>
                  <div className="identified">
                    <ComponentInfo name={identified[0]?.name} />
                    {identified.length > 1 && (
                      <Tooltip
                        title={identified
                          .slice(1)
                          .map((item) => item.name)
                          .join(' - ')}
                      >
                        <p className="more">{component.identifiedAs.length - 1} more</p>
                      </Tooltip>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <VersionInfo multiple={multiple} versions={component.versions} />
                  <ComponentInfo name={component.name} />
                  {identified.length > 0 && (
                    <Tooltip title={identified.map((item) => item.name).join(' - ')}>
                      <p className="more">{component.identifiedAs.length - 1} more</p>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
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
    </>
  );
};

const ComponentInfo = ({ name }) =>
  name?.length > 15 ? (
    <Tooltip title={name}>
      <h6>{name}</h6>
    </Tooltip>
  ) : (
    <h6>{name}</h6>
  );

const VersionInfo = ({ multiple, versions }) => <p>{multiple ? `${versions.length} versions` : versions[0].version}</p>;

export default ComponentCard;
