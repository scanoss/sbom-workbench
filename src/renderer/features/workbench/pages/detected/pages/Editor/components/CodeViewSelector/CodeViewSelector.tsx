import React from 'react';
import { ButtonGroup, Button } from '@material-ui/core';
import AccountTreeOutlined from '@material-ui/icons/AccountTreeOutlined';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';

const CodeViewSelector = ({ active, setView }) => {
  return (
    <div>
      <ButtonGroup variant="outlined" size="small" aria-label="file view selector">
        <Button onClick={() => setView('code')} color={active === 'code' ? 'primary' : 'default'} aria-label="code">
          <CodeOutlinedIcon fontSize="inherit" />
        </Button>
        <Button onClick={() => setView('graph')} color={active === 'graph' ? 'primary' : 'default'} aria-label="graph">
          <AccountTreeOutlined fontSize="inherit" />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default CodeViewSelector;
