import React from 'react';
import { IconButton, Paper, TextField, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { INewProject } from '@api/types';
import LicenseSelector from '@components/LicenseSelector/LicenseSelector';

interface License {
  spdxid: string;
  name: string;
}

interface Props {
  settings: INewProject;
  licenses: License[];
  nameIsValid: boolean;
  nameExists: boolean;
  nameReserved: boolean;
  onNameChange: (name: string) => void;
  onLicenseChange: (spdxid: string | undefined) => void;
  onOpenLicenseDialog: () => void;
}

const ProjectInfoFields = ({
  settings,
  licenses,
  nameIsValid,
  nameExists,
  nameReserved,
  onNameChange,
  onLicenseChange,
  onOpenLicenseDialog,
}: Props) => {
  const { t } = useTranslation();
  const hasError = nameExists || nameReserved || !nameIsValid;

  return (
    <div className="project-license-container">
      <div className="input-container">
        <label className="input-label">{t('Title:ProjectName')}</label>
        <Paper className="input-text-container project-name-container">
          <TextField
            spellCheck={false}
            error={hasError}
            fullWidth
            value={settings.name}
            InputProps={{ style: { fontSize: 20, fontWeight: 500 } }}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </Paper>
        {hasError && (
          <div className="error-message">
            {nameExists && t('Common:ProjectNameAlreadyExists')}
            {nameReserved && t('Common:ProjectNameReserved')}
            {!nameIsValid && t('Common:ProjectNameInvalid')}
          </div>
        )}
      </div>

      <div className="input-container input-container-license">
        <div className="input-label-add-container">
          <label className="input-label">
            {t('Title:License')}
            <Tooltip title={t('Tooltip:AddNewLicense')}>
              <IconButton tabIndex={-1} color="inherit" size="small" onClick={onOpenLicenseDialog}>
                <Add fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <span className="optional">
              -
              {' '}
              {t('Common:Optional')}
            </span>
          </label>
        </div>
        <div className="input-text-container license-input-container">
          <LicenseSelector
            options={licenses}
            disableClearable={false}
            onChange={(_, value) => onLicenseChange(value?.spdxid)}
            value={licenses?.find((item) => item.spdxid === settings?.default_license) || {}}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoFields;
