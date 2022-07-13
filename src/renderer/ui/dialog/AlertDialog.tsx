import React from 'react';
import { Dialog, DialogActions, Button, DialogContentText, DialogContent } from '@mui/material';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';

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

interface AlertDialogProps {
  open: boolean;
  message: string;
  buttons: any[];
  onClose: (response: DialogResponse) => void;
}

export const AlertDialog = (props: AlertDialogProps) => {
  const classes = useStyles();
  const { open, message, buttons, onClose } = props;

  const handleCancel = () => onClose({ action: DIALOG_ACTIONS.CANCEL });
  const handleAccept = (action: string) => onClose({ action });

  return (
    <Dialog
      id="AlertDialog"
      className="dialog"
      maxWidth="sm"
      scroll="body"
      fullWidth
      open={open}
      onClose={handleCancel}
    >
      <DialogContent className={classes.content}>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleCancel}
          size="large">
          <CloseIcon />
        </IconButton>
        <DialogContentText className={classes.text}>
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.actions}>
        {buttons.map((button: any, index: number) =>
          button.role === 'cancel' ? (
            <Button key={button.label} onClick={handleCancel} className={button.class} color="inherit">
              {button.label}
            </Button>
          ) : button.role === 'action' ? (
            <Button
              key={button.label}
              onClick={() => handleAccept(button.action)}
              autoFocus={index === buttons.length - 1}
            >
              {button.label}
            </Button>
          ) : (
            <Button
              key={button.label}
              autoFocus={index === buttons.length - 1}
              className={button?.role === 'delete' ? classes.deleteButton : ''}
              color="secondary"
              variant="contained"
              onClick={() => handleAccept(button.action)}
            >
              {button?.label}
            </Button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
