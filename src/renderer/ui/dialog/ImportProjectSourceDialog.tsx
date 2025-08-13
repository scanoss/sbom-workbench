import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  TextField,
  FormControl,
  FormLabel,
  Box,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { useTranslation } from 'react-i18next';
import { dialogController } from '../../controllers/dialog-controller';
import { useTheme } from '@mui/material';


interface ImportProjectSourceDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  dialogTitle: string;
  projectPathPlaceHolder: string;
  openDialogProperties: Electron.OpenDialogOptions;
}

export const ImportProjectSourceDialog = (props: ImportProjectSourceDialogProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [projectPath, setProjectPath] = useState<string>('');
  const [sourcePath, setSourcePath] = useState<string>('');
  const [projectPathError, setProjectPathError] = useState<string>('');
  const [sourcePathError, setSourcePathError] = useState<string>('');


  const { open, onClose } = props;

  const handleCancel = useCallback(() => onClose({ action: DIALOG_ACTIONS.CANCEL }), [onClose]);

  const handleAccept = useCallback(() => {
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
  }, [projectPath, sourcePath, onClose, t]);

  const handleProjectPathChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectPath(event.target.value);
    if (event.target.value.trim()) {
      setProjectPathError('');
    }
  }, []);

  const handleSourcePathChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSourcePath(event.target.value);
  }, []);

  const handleProjectBrowse = useCallback(async () => {
    try {
      const paths = await dialogController.showOpenDialog(props.openDialogProperties || {});
      if (paths && paths.length > 0) {
        setProjectPath(paths[0]);
        setProjectPathError('');
      }
    } catch (error) {
      console.error('Error selecting project file:', error);
      setProjectPathError(t('Error selecting project file'));
    }
  }, [props.openDialogProperties, t]);

  const handleSourceBrowse = useCallback(async () => {
    await handleSourceFileSelected();
  }, []);


  const handleSourceFileSelected = useCallback(async () => {
    try {
      const paths = await dialogController.showOpenDialog({
        properties: ['openDirectory'],
      });
      if (paths && paths.length > 0) {
        setSourcePath(paths[0]);
        setSourcePathError('');
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      setSourcePathError(t('Error selecting source folder'));
    }
  }, [t]);


  const isValid = useCallback(() => {
    return projectPath.trim() !== '';
  }, [projectPath]);

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
        <label>{props.dialogTitle}</label>
        <IconButton
          aria-label="close"
          sx={{
            color: theme.palette.grey[500],
          }}
          onClick={handleCancel}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </header>
      <DialogContent
        sx={{
          backgroundColor: theme.palette.background.paper,
          paddingTop: theme.spacing(0.5),
        }}
      >
        <FormControl
          component="fieldset"
          sx={{
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1),
            width: '100%',
          }}
        >
          <FormLabel component="legend">{t('Project')}</FormLabel>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginTop: theme.spacing(0.5),
            }}
          >
            <TextField
              sx={{
                flex: 1,
                border: 'solid 1px #80808033',
                borderRadius: '3px',
              }}
              value={projectPath}
              onChange={handleProjectPathChange}
              onClick={handleProjectBrowse}
              placeholder={props.projectPathPlaceHolder || t('Select project path')}
              fullWidth
              error={!!projectPathError}
              helperText={projectPathError}
              size="small"
              variant="outlined"
            />
            <Button
              variant="contained"
              sx={{
                marginLeft: theme.spacing(3),
                height: '40px',
              }}
              onClick={handleProjectBrowse}
              startIcon={<FolderOpenIcon />}
              size="small"
              aria-label={t('Browse for project file')}
            >
              {t('Button:Browse')}
            </Button>
          </Box>
        </FormControl>

        <FormControl
          component="fieldset"
          sx={{
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1),
            width: '100%',
          }}
        >
          <FormLabel component="legend">{t('Source Code')}</FormLabel>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginTop: theme.spacing(0.5),
            }}>
            <TextField
              sx={{
                flex: 1,
                border: 'solid 1px #80808033',
                borderRadius: '3px',
              }}
              value={sourcePath}
              onChange={handleSourcePathChange}
              onClick={handleSourceBrowse}
              placeholder={t('Dialog:SelectSourceCodePath')}
              fullWidth
              error={!!sourcePathError}
              helperText={sourcePathError}
              size="small"
              variant="outlined"
            />
            <Button
              variant="outlined"
              sx={{
                marginLeft: theme.spacing(3),
                height: '40px',
              }}
              onClick={handleSourceBrowse}
              startIcon={<FolderOpenIcon />}
              size="small"
              aria-label={t('Dialog:SelectSourceCodePath')}
            >
              {t('Button:Browse')}
            </Button>
          </Box>
        </FormControl>
      </DialogContent>
      <DialogActions
        sx={{
          padding: theme.spacing(2),
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.grey[50],
        }}
      >
        <Button
          onClick={handleCancel}
          color="inherit"
        >
          {t('Button:Cancel')}
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

