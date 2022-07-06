import React from 'react';
import { Dialog, DialogContent, LinearProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '350px',
    },
  },
  content: {
    backgroundColor: 'rgb(49, 49, 49) !important',
  },
  text: {
    marginTop: 12,
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#fff !important',
    textAlign: 'center',
  },
}));

interface ProgressDialogProps {
  open: boolean;
  message: React.ReactNode;
  loader: boolean;
}

export const ProgressDialog = (props: ProgressDialogProps) => {
  const classes = useStyles();
  const { open, message, loader } = props;

  return (
    <Dialog id="ProgressDialog" className={`${classes.size} dialog`} maxWidth="md" open={open}>
      <DialogContent className={classes.content}>
        {loader ? <LinearProgress /> : <LinearProgress variant="determinate" color="secondary" value={100} />}
        <div className={classes.text}>{message}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;
