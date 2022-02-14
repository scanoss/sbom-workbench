import { Button } from '@material-ui/core';
import React from 'react';

const NoMatchFound = ({ identifyHandler, showLabel }) => {
  return (
    <div className="no-match-container">
      <div className="no-match-content">
        {showLabel && <p className="no-match-title">No Match Found</p>}
        <Button variant="contained" color="secondary" onClick={() => identifyHandler()}>
          Identify
        </Button>
      </div>
    </div>
  );
};

export default NoMatchFound;
