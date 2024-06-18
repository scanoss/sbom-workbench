import React from 'react';
import { Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import { ComponentGroup } from '@api/types';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import IconComponent from '../IconComponent/IconComponent';

interface ComponentCardProps {
  component: ComponentGroup;
}

const ComponentCard = ({ component }: ComponentCardProps) => {
  const multiple: boolean = component.versions.length > 1;
  const identified = component.identifiedAs.filter((item) => item.purl !== component.purl);
  const keepOriginal: boolean = identified.length < component.identifiedAs.length;
  const override: boolean = !component.summary?.pending && !keepOriginal;

  return (
    <>
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
    </>
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
