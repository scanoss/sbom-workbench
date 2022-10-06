import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NoMatchFound = ({ identifyHandler, showLabel }) => {
  const { t } = useTranslation();

  return (
    <div className="no-match-container">
      <div className="no-match-content">
        {showLabel && <p className="no-match-title">{t('Title:NoMatchFound')}</p>}
        <Button size="small" variant="contained" color="secondary" onClick={() => identifyHandler()}>
          {t('Button:Identify')}
        </Button>
      </div>
    </div>
  );
};

export default NoMatchFound;
