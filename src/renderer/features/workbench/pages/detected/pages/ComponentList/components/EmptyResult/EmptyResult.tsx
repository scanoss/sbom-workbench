import React from 'react';
import componentEmpty from '@assets/imgs/component-empty.svg';
import { Box, Typography } from '@mui/material';

const EmptyResult = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: 300,
          margin: '0 auto 80px',
        }}
      >
        <img src={componentEmpty} alt="components empty icon" />
        <Typography
          style={{
            textAlign: 'center',
            color: '#71717A',
          }}
        >{children}
        </Typography>
      </Box>
    </Box>
  );
};

export default EmptyResult;
