import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useMode from '@hooks/useMode';

const NoMatchFound = ({ identifyHandler, showLabel }) => {
  const { t } = useTranslation();
  const  { props } = useMode();

  return (
    <div className="no-match-container">
      <div className="no-match-content">
        {showLabel && <p className="no-match-title">{t('Title:NoMatchFound')}</p>}
        <Button data-write {...props } size="small" variant="contained" color="secondary" onClick={() => identifyHandler()}>
          {t('Button:Identify')}
        </Button>
      </div>
    </div>
  );
};

export default NoMatchFound;
