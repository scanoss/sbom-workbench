import { Button } from '@material-ui/core';
import React from 'react';

const NoMatchFound = () => {
  return (
    <div className="no-match-container">
      <div className="no-match-content">
        <p className="no-match-title">No Match Found</p>
        <Button variant="contained" color="secondary">
          Identify
        </Button>
      </div>
    </div>
  );
};

export default NoMatchFound;
