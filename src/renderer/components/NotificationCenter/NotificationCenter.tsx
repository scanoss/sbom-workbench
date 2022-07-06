import { Snackbar, LinearProgress } from '@mui/material';
import React from 'react';

const NotificationCenter = () => {
  return (
    <div id="NotificationImport" className="notification">
      <Snackbar
        open
        message={
          <div className="notification-message" style={{ width: '100%' }}>
            <LinearProgress />
            <span>IMPORTING PROJECT</span>
          </div>
        }
      />
    </div>
  );
};

export default NotificationCenter;
