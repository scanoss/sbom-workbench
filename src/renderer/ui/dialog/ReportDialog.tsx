import React from 'react';
import {
  Dialog,
  DialogActions,
  Button,
  DialogContentText,
  DialogContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  DialogTitle,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

const useStyles = makeStyles((theme) => {
return {
      dialog: {
        width: 400,
      },
      closeButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: useTheme().palette.grey[500],
      },
      title: {
        padding: useTheme().spacing(1),
        borderBottom: '1px solid #D4D4D8',
        display: 'flex !important',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      content: {
        backgroundColor: '#f4f4f5',
        padding: useTheme().spacing(3, 3, 2),
      },
      text: {
        width: '100%',
        fontSize: '18px',
        color: '#27272A !important',
        whiteSpace: 'pre-line',
        marginBottom: useTheme().spacing(2),
      },
      messageIcon: {
        color: useTheme().palette.error.main,
        marginRight: useTheme().spacing(1),
        fontSize: '24px',
      },
      messageContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        flexFlow: 'column',
        margin: useTheme().spacing(2, 0, 2, 0),
      },
      purlListContainer: {
        maxHeight: '200px',
        overflow: 'auto',
        border: `1px solid ${useTheme().palette.divider}`,
        borderRadius: useTheme().shape.borderRadius,
        backgroundColor: useTheme().palette.grey[50],
        marginTop: useTheme().spacing(1),
        marginBottom: useTheme().spacing(2),
      },
      purlItem: {
        padding: useTheme().spacing(0.75, 2),
        borderBottom: `1px solid ${useTheme().palette.divider}`,
        '&:last-child': {
          borderBottom: 'none',
        },
      },
      actions: {
        padding: useTheme().spacing(1.5),
        borderTop: '1px solid #D4D4D8',
        justifyContent: 'flex-end',
      },
      messageTitle: {
        fontWeight: 600,
        fontSize: '16px',
        color: useTheme().palette.error.main,
        marginBottom: useTheme().spacing(0.5),
      },
      messageDescription: {
        fontSize: '14px',
        color: '#52525B',
        padding: '2px 0px 0px 6px',
        marginBottom: useTheme().spacing(1),
      },
    }
});

interface ReportDialogProps {
  open: boolean;
  invalidPurls: Array<string>;
  onClose: (response: DialogResponse) => void;
}

export const ReportDialog = (props: ReportDialogProps) => {
  const classes = useStyles();
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
      onClose={handleCancel}
    >
      <DialogTitle className={classes.title}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            paddingLeft: 2,
          }}
        >
          {invalidPurls.length === 1 ? 'Invalid PURL' : 'Invalid PURLs'}
        </Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={handleCancel} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Box className={classes.messageContainer}>
          <Box
            sx={{
              display: 'flex',
              flexFlow: 'row',
            }}
          >
            <ErrorOutlineIcon className={classes.messageIcon} />
            <Box>
              <Typography className={classes.messageTitle}>
                {invalidPurls.length} {invalidPurls.length === 1 ? 'component was' : 'components were'} not exported
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography className={classes.messageDescription}>
              The following {invalidPurls.length === 1 ? 'PURL is' : 'PURLs are'} invalid or improperly formatted.
              <br />
              Please correct {invalidPurls.length === 1 ? 'it' : 'them'} to ensure all components can be successfully
              exported.
            </Typography>
          </Box>
        </Box>

        <Box className={classes.purlListContainer}>
          <List disablePadding>
            {invalidPurls.map((purl, index) => (
              <ListItem
                key={index}
                className={classes.purlItem}
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
      <DialogActions className={classes.actions}>
        <Button autoFocus color="secondary" variant="contained" onClick={handleAccept}>
          {t('Button:Accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
