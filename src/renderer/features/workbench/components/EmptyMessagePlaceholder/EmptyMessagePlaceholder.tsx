import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyMessagePlaceholder = ({ children }) => {

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
          maxWidth: 300,
          margin: '0 auto',
        }}
      >
        <Typography
          sx={{
            textAlign: 'center',
            color: '#71717A',
            fontWeight: '500',
          }}
        >{children}</Typography>
      </Box>
    </Box>
  );
};

export default EmptyMessagePlaceholder;
