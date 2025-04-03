import React from 'react';
import { Box, Dialog, DialogContent, LinearProgress } from '@mui/material';

interface ProgressDialogProps {
  open: boolean;
  message: React.ReactNode;
  loader: boolean;
}

export const ProgressDialog = (props: ProgressDialogProps) => {
  const { open, message, loader } = props;

  return (
    <Dialog
      id="ProgressDialog"
      className="dialog"
      maxWidth="md"
      open={open}
      sx={{
        '& .MuiDialog-paper': {
          width: 350,
        },
      }}
    >
      <DialogContent
        style={{
          backgroundColor: 'rgb(49, 49, 49) !important',
        }}
      >
        {loader ? <LinearProgress /> : <LinearProgress variant="determinate" color="secondary" value={100} />}
        <Box
          sx={{
            marginTop: 12,
            fontSize: '0.8rem',
            fontWeight: 500,
            color: '#fff !important',
            textAlign: 'center',
          }}
          >
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;
