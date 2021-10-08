import {
  Dialog,
  DialogActions,
  Button,
  makeStyles,
  DialogContentText,
  Card,
  DialogContent,
  Tooltip,
} from '@material-ui/core';
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
  deleteButton: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  content: {
    backgroundColor: 'white !important',
  },
  text: {
    width: '90%',
    fontSize: '20px',
    color: '#27272A !important',
    whiteSpace: 'pre-line',
  },
  actions: {
    padding: theme.spacing(2),
    borderTop: '1px solid #D4D4D8',
    backgroundColor: '#f4f4f5',
  },
}));

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  button: any;
  hideDeleteButton: boolean;
  onClose: (response: DialogResponse) => void;
}

export const ConfirmDialog = (props: ConfirmDialogProps) => {
  const classes = useStyles();
  const { open, message, button, hideDeleteButton, onClose } = props;

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
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.actions}>
        {!hideDeleteButton && <Button onClick={handleCancel}>Cancel</Button>}
        <Button
          className={button?.role === 'delete' && classes.deleteButton}
          color="secondary"
          variant="contained"
          onClick={handleAccept}
        >
          {button?.label}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
