import React from 'react';
import { Dialog, makeStyles, DialogContent, LinearProgress } from '@material-ui/core';

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
  message: string;
}

export const ProgressDialog = (props: ProgressDialogProps) => {
  const classes = useStyles();
  const { open, message } = props;

  return (
    <Dialog id="ProgressDialog" className={`${classes.size} dialog`} maxWidth="md" open={open}>
      <DialogContent className={classes.content}>
        <LinearProgress />
        <div className={classes.text}>{message}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;
