import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from 'react-i18next';

const VersionSelector = ({ versions, version, onSelect, component }) => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const totalFiles = component.summary.ignored + component.summary.pending + component.summary.identified;

  const handleClose = () => setAnchorEl(null);

  const handleSelected = (version: string) => {
    setAnchorEl(null);
    onSelect(version);
  };

  return (
    <>
      <div>
        {versions?.length > 1 ? (
          <Button
            className={`filter btn-version ${version ? 'selected' : ''}`}
            aria-controls="menu"
            aria-haspopup="true"
            endIcon={<ArrowDropDownIcon />}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            {version || t('Title:version')}
          </Button>
        ) : (
          versions ? versions[0].version : '-'
        )}
      </div>
      <Menu id="VersionSelectorList" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem key="all" onClick={() => handleSelected(null)}>
          <div className="version-container">
            <div className="version">{t('Title:AllVersions')}</div>
            <div className="files-counter">{totalFiles}</div>
          </div>
        </MenuItem>
        {versions?.map(({ version, files }) => (
          <MenuItem key={version} onClick={() => handleSelected(version)}>
            <div className="version-container">
              <div className="version">{version}</div>
              <div className="files-counter">{files}</div>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default VersionSelector;
