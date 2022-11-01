import React from 'react';
import { Dialog, DialogActions, Button, DialogContentText, DialogContent } from '@mui/material';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
        {!hideDeleteButton && (
          <Button color="inherit" onClick={handleCancel}>
           {t('Button:Cancel')}
          </Button>
        )}
        <Button
          autoFocus
          className={button?.role === 'delete' ? classes.deleteButton : ''}
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
