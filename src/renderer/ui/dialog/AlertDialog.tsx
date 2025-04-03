import React from 'react';
import { Dialog, DialogActions, Button, DialogContentText, DialogContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { useTheme } from '@mui/material';

interface AlertDialogProps {
  open: boolean;
  slots: any;
  message: string;
  buttons: any[];
  onClose: (response: DialogResponse) => void;
}

export const AlertDialog = (props: AlertDialogProps) => {
  const theme = useTheme();
  const { open, message, buttons, onClose, slots } = props;

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
      {...slots}
      sx={{
        '& .MuiDialog-paper': {
          width: 400,
        },
      }}
    >
      <DialogContent sx={{ backgroundColor: 'white !important' }}>
        <IconButton
          aria-label="close"
          onClick={handleCancel}
          size="large"
          sx={{
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
          }}
        >
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
        {buttons.map((button: any, index: number) =>
          button.role === 'cancel' ? (
            <Button
              key={button.label}
              onClick={handleCancel}
              sx={button.class ? { [button.class]: true } : {}}
              color="inherit"
            >
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
              sx={
                button?.role === 'delete'
                  ? {
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                    },
                  }
                  : {}
              }
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
