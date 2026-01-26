import { useState } from 'react';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { Dialog, Paper, TextField, DialogActions, Button, IconButton, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WorkspaceData } from '@api/types';
import { dialogController } from 'renderer/controllers/dialog-controller';

/* icons */
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import appConfigModule from '@config/AppConfigModule';

const initial: WorkspaceData = {
  NAME: '',
  PATH: '',
  DESCRIPTION: '',
  SCAN_SOURCES: '',
};

interface WorkspaceAddDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const WorkspaceAddDialog = (props: WorkspaceAddDialogProps) => {
  const { t } = useTranslation();
  const { open, onClose, onCancel } = props;
  const [data, setData] = useState<any>(initial);

  const onSelectPathHandler = async () => {
    const paths = await dialogController.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });

    if (paths && paths.length > 0) {
      const PATH = paths[0];
      const NAME = PATH.split(window.path.sep)[PATH.split(window.path.sep).length - 1];
      const SCAN_SOURCES = window.path.resolve(PATH, appConfigModule.SCANOSS_SCAN_SOURCES_FOLDER_NAME);
      setData({ ...data, NAME, PATH, SCAN_SOURCES });
    }
  };

  const onSelectSourceHandler = async () => {
    const paths = await dialogController.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });
    if (paths && paths.length > 0) {
      const SCAN_SOURCES = paths[0];
      setData({ ...data, SCAN_SOURCES });
    }
  }

  const normalizePath = (path: string): string => {
    if (!path) return '';
    return path.replace(/[/\\]+$/, '');
  };

  const isScanSourcesSameAsPath = (): boolean => {
    if (!data.SCAN_SOURCES || !data.PATH) return false;
    return normalizePath(data.SCAN_SOURCES) === normalizePath(data.PATH);
  };

  const isValid = (): boolean => {
    return data.NAME && data.PATH && !isScanSourcesSameAsPath();
  };

  const onSubmit = (e) => {
    e.preventDefault();

    onClose({ action: DIALOG_ACTIONS.OK, data });
  };

  return (
    <Dialog
      id="WorkspaceAddDialog"
      className="dialog"
      sx={
        {
          alignItems: 'end',
          '& > .dialog-form-field:nth-child(2)': {
            flex: '0 !important',
          },
        }
      }
      open={open}
      onClose={onCancel}
    >

      <header className="dialog-title">
        <span>{t('Title:AddWorkspace')}</span>
        <IconButton aria-label="close" tabIndex={-1} onClick={onCancel} size="large">
          <CloseIcon />
        </IconButton>
      </header>

      <form onSubmit={onSubmit}>
        <div className="dialog-content">
          <Box
            className="dialog-row"
            sx={{
                alignItems: 'end',
                '& > .dialog-form-field:nth-child(2)': {
                  flex: '0 !important',
                },
            }}
          >
            <div className="dialog-form-field">
              <label className="dialog-form-field-label"> {t('Dialog:WorkspaceLocation')}</label>
              <Paper
                className="dialog-form-field-control"
                sx={{
                  width: '400px',
                }}
              >
                <TextField
                  name="location"
                  size="small"
                  fullWidth
                  value={data.PATH}
                  autoFocus
                  onChange={(e) => setData({ ...data, PATH: e.target.value })}
                />
              </Paper>
            </div>
            <div className="dialog-form-field">
              <Button
                type="button"
                variant="outlined"
                color="primary"
                sx={{
                  height: '41px',
                }}
                startIcon={<SearchIcon />}
                onClick={onSelectPathHandler}
              >
                {t('Button:Choose')}
              </Button>
            </div>
          </Box>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">{t('Dialog:WorkspaceName')}</label>
            <Paper
              className="dialog-form-field-control"
              sx={{
                width: '400px',
              }}
            >
              <TextField
                name="name"
                size="small"
                maxRows={30}
                fullWidth
                value={data.NAME}
                onChange={(e) => setData({ ...data, NAME: e.target.value })}
                required
              />
            </Paper>
          </div>

          <Box
            className="dialog-row"
            sx={{
              alignItems: 'end',
              '& > .dialog-form-field:nth-child(2)': {
                flex: '0 !important',
              },
            }}
          >
            <div className="dialog-form-field">
              <label className="dialog-form-field-label"> {t('Dialog:ScanSourceLocation')}</label>
              <Paper
                className="dialog-form-field-control"
                sx={{
                  width: '400px',
                }}
              >
                <TextField
                  name="location"
                  size="small"
                  fullWidth
                  value={data.SCAN_SOURCES || ''}
                  autoFocus
                  onChange={(e) => setData({ ...data, SCAN_SOURCES: e.target.value })}
                  error={isScanSourcesSameAsPath()}
                  helperText={isScanSourcesSameAsPath() ? t('Dialog:ScanSourceCannotBeSameAsWorkspace') : ''}
                  slotProps={{
                    formHelperText: {
                      sx: { color: 'red', fontSize: '12px' }
                    }
                  }}
                />
              </Paper>
            </div>
            <div className="dialog-form-field">
              <Button
                type="button"
                variant="outlined"
                color="primary"
                sx={{
                  height: '41px',
                }}
                startIcon={<SearchIcon />}
                onClick={onSelectSourceHandler}
              >
                {t('Button:Choose')}
              </Button>
            </div>
          </Box>
        </div>
        <DialogActions>
          <Button color="inherit" tabIndex={-1} onClick={onCancel}>
            {t('Button:Cancel')}
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            {t('Button:Add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WorkspaceAddDialog;
