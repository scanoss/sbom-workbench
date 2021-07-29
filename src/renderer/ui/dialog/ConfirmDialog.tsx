import { Dialog, DialogActions, Button, makeStyles, DialogContentText, Card, DialogContent, Tooltip } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import React, { useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { DIALOG_ACTIONS, DialogResponse } from '../../context/types';

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: 400,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  okButton: {
    backgroundColor: theme.palette.error.main,
    color: 'white'
  },
  content: {
    backgroundColor: 'white !important',
  },
  text: {
    width: '60%',
    fontSize: '20px',
    color: '#27272A !important',
  },
  actions: {
    padding: theme.spacing(2),
    borderTop: '1px solid #D4D4D8',
    backgroundColor: '#f4f4f5',
  }
}));

interface ConfirmDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
}

export const ConfirmDialog = (props: ConfirmDialogProps) => {
  const classes = useStyles();
  const { open, onClose } = props;

  const handleCancel = () => onClose({ action: DIALOG_ACTIONS.CANCEL });
  const handleAccept = () => onClose({ action: DIALOG_ACTIONS.OK });

  return (
    <Dialog
      id="ConfirmDialog"
      className="dialog"
      maxWidth="sm"
      scroll="body"
      fullWidth
      open={open}
      onClose={handleCancel}
    >
      <DialogContent className={classes.content}>
        <IconButton aria-label="close" className={classes.closeButton} onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
        <DialogContentText className={classes.text}>
          Are you sure you want to delete this <b>group</b>?
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button className={classes.okButton} variant="contained" onClick={handleAccept}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
