import React from 'react';
import { Dialog, DialogActions, Button, DialogContentText, DialogContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  button: any;
  hideDeleteButton: boolean;
  onClose: (response: DialogResponse) => void;
}

export const ConfirmDialog = (props: ConfirmDialogProps) => {
  const theme = useTheme();
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
      sx={{
        '& .MuiDialog-paper': {
          width: 400,
        },
      }}
      onClose={handleCancel}
    >
      <DialogContent
        sx={{
          backgroundColor: 'white !important'
        }}
      >
        <IconButton
          aria-label="close"
          sx={{
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
          }}
          onClick={handleCancel}
          size="large">
          <CloseIcon />
        </IconButton>
        <DialogContentText
          sx={{
            width: '90%',
            fontSize: '20px',
            color: '#27272A !important',
            whiteSpace: 'pre-line',
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          padding: theme.spacing(2),
          borderTop: '1px solid #D4D4D8',
          backgroundColor: '#f4f4f5',
        }}
        >
        {!hideDeleteButton && (
          <Button color="inherit" onClick={handleCancel}>
           {t('Button:Cancel')}
          </Button>
        )}
        <Button
          autoFocus
          sx={button?.role === 'delete' ? {
            backgroundColor: theme.palette.error.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
            },
          } : {}}
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
