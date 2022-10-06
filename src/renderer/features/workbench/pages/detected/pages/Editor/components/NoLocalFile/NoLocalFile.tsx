import React from 'react';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useTranslation } from 'react-i18next';

const NoLocalFile = () => {
  const { t } = useTranslation();

  <div id="NoLocalFile">
    <InsertDriveFileOutlinedIcon style={{fontSize: 36}} />
    <p><small>{t('ProjectImportedHint')}</small></p>
  </div>
};

export default NoLocalFile;
