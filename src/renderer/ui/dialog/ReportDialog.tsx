import React from 'react';
import {
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  DialogTitle,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

interface ReportDialogProps {
  open: boolean;
  invalidPurls: Array<string>;
  onClose: (response: DialogResponse) => void;
}

export const ReportDialog = (props: ReportDialogProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { open, invalidPurls, onClose } = props;

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
          width: 500,
        },
      }}
      onClose={handleCancel}
    >
      <DialogTitle
        sx={{
          padding: theme.spacing(1),
          borderBottom: '1px solid #D4D4D8',
          display: 'flex !important',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            paddingLeft: 2,
          }}
        >
          {invalidPurls.length === 1 ? 'Invalid PURL' : 'Invalid PURLs'}
        </Typography>
        <IconButton aria-label="close"
                    onClick={handleCancel}
                    size="large"
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: theme.palette.grey[500],
                    }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: '#f4f4f5',
          padding: theme.spacing(3, 3, 2),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            flexFlow: 'column',
            margin: theme.spacing(2, 0, 2, 0),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexFlow: 'row',
            }}
          >
            <ErrorOutlineIcon
              sx={{
                color: theme.palette.error.main,
                marginRight: theme.spacing(1),
                fontSize: '24px',
              }}
            />
            <Box>
              <Typography

                sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color: theme.palette.error.main,
                  marginBottom: theme.spacing(0.5),
                }}
              >
                {invalidPurls.length} {invalidPurls.length === 1 ? 'component was' : 'components were'} not exported
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: '14px',
                color: '#52525B',
                padding: '2px 0px 0px 6px',
                marginBottom: theme.spacing(1),
              }}
            >
              The following {invalidPurls.length === 1 ? 'PURL is' : 'PURLs are'} invalid or improperly formatted.
              <br />
              Please correct {invalidPurls.length === 1 ? 'it' : 'them'} to ensure all components can be successfully
              exported.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            maxHeight: '200px',
            overflow: 'auto',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.grey[50],
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(2),
          }}
        >
          <List disablePadding>
            {invalidPurls.map((purl, index) => (
              <ListItem
                key={index}
                sx={{
                  padding: theme.spacing(0.75, 2),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
                disableGutters
                style={{ cursor: 'text' }}
              >
                <ListItemText
                  primary={purl}
                  primaryTypographyProps={{
                    style: { fontFamily: 'monospace',
                      fontSize: '14px',
                      userSelect: 'all',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: theme.spacing(1.5),
          borderTop: '1px solid #D4D4D8',
          justifyContent: 'flex-end',
        }}
      >
        <Button autoFocus color="secondary" variant="contained" onClick={handleAccept}>
          {t('Button:Accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
