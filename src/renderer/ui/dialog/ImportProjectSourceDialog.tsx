import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogActions,
  Button,
  DialogContentText,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  FormLabel,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { useTranslation } from 'react-i18next';
import { setScanPath } from '@store/workspace-store/workspaceSlice';
import { dialogController } from '../../controllers/dialog-controller';

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: 400,
  },
  closeButton: {
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
    paddingTop: '5px',
  },
  actions: {
    padding: theme.spacing(2),
    borderTop: '1px solid #D4D4D8',
    backgroundColor: '#f4f4f5',
  },
  formControl: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    width: '100%',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
  input: {
    flex: 1,
    border: 'solid 1px #80808033',
    borderRadius: '3px',
  },
  browseButton: {
    marginLeft: theme.spacing(3),
    height: '40px',
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(1.5),
  },
  title: {
    padding: '12px 15px 12px 15px',
  },
}));

interface ImportProjectSourceDialogProps {
  open: boolean;
  button: any;
  onClose: (response: DialogResponse) => void;
}

export const ImportProjectSourceDialog = (props: ImportProjectSourceDialogProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [projectPath, setProjectPath] = useState<string>('');
  const [sourcePath, setSourcePath] = useState<string>(null);
  const [projectPathError, setProjectPathError] = useState<string>('');

  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);

  const { open, onClose } = props;

  const handleCancel = () => onClose({ action: DIALOG_ACTIONS.CANCEL });

  const handleAccept = () => {
    if (!projectPath.trim()) {
      setProjectPathError(t('Project path cannot be empty'));
      return;
    }

    onClose({
      action: DIALOG_ACTIONS.OK,
      data: {
        projectPath,
        sourcePath,
      },
    });
  };

  const handleProjectPathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectPath(event.target.value);
    if (event.target.value.trim()) {
      setProjectPathError('');
    }
  };

  const handleSourcePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourcePath(event.target.value);
  };

  const handleProjectBrowse = () => {
    if (projectFileInputRef.current) {
      projectFileInputRef.current.click();
    }
  };

  const handleSourceBrowse = async () => {
    await handleSourceFileSelected();
  };

  const handleProjectFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (files && files.length > 0) {
        setProjectPath(files[0].path || files[0].name);
        setProjectPathError('');
    }
  };

  const handleSourceFileSelected = async () => {
    try {
      const paths = await dialogController.showOpenDialog({
        properties: ['openDirectory'],
      });
      if (paths && paths.length > 0) {
        setSourcePath(paths[0]);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };


  const isValid = () => {
    return projectPath && projectPath !== '';
  };

  return (
    <Dialog
      id="ImportProjectSourceDialog"
      className="dialog"
      maxWidth="sm"
      scroll="body"
      fullWidth
      open={open}
      onClose={handleCancel}
    >
      <header className="dialog-title">
        <label>{t('Import Project and Source')}</label>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleCancel}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </header>
      <DialogContent className={classes.content}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">{t('Project')}</FormLabel>
          <div className={classes.inputContainer}>
            <TextField
              className={classes.input}
              value={projectPath}
              onChange={handleProjectPathChange}
              onClick={handleProjectBrowse}
              placeholder={t('Select project path')}
              fullWidth
              error={!!projectPathError}
              size="small"
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
            <Button
              variant="contained"
              className={classes.browseButton}
              onClick={handleProjectBrowse}
              startIcon={<FolderOpenIcon />}
              size="small"
            >
              {t('Browse')}
            </Button>
            <input
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              hidden
              required
              ref={projectFileInputRef}
              onChange={handleProjectFileSelected}
            />
          </div>
          {projectPathError && (
          <Typography className={classes.errorText}>{projectPathError}</Typography>
          )}
        </FormControl>

        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">{t('Source Code')}</FormLabel>
          <div className={classes.inputContainer}>
            <TextField
              className={classes.input}
              value={sourcePath}
              onChange={handleSourcePathChange}
              onClick={handleSourceBrowse}
              placeholder={t('Select source code path (optional)')}
              fullWidth
              size="small"
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
            <Button
              variant="outlined"
              className={classes.browseButton}
              onClick={handleSourceBrowse}
              startIcon={<FolderOpenIcon />}
              size="small"
            >
              {t('Browse')}
            </Button>
            <input
              type="file"
              hidden
              {...({ webkitdirectory: '', directory: '' } as any)}
              ref={sourceFileInputRef}
              onChange={handleSourceFileSelected}
            />
          </div>
        </FormControl>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button
          onClick={handleCancel}
          color="inherit"
        >
          {t('Cancel')}
        </Button>
        <Button
          autoFocus
          color="secondary"
          variant="contained"
          disabled={!isValid()}
          onClick={handleAccept}
        >
          {t('Button:Accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportProjectSourceDialog;
