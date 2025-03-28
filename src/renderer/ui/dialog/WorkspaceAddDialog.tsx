import { useState, useEffect } from 'react';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { Dialog, Paper, TextField, DialogActions, Button, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { WorkspaceData } from '@api/types';
import { dialogController } from 'renderer/controllers/dialog-controller';

/* icons */
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

const initial: WorkspaceData = {
  NAME: '',
  PATH: '',
  DESCRIPTION: '',
};

const useStyles = makeStyles((theme) => ({
  size: {

  },
  field: {
    width: '400px',
  },
  path: {
    alignItems: 'end',
    '& > .dialog-form-field:nth-child(2)': {
      flex: '0 !important',
    },
  },
}));

interface WorkspaceAddDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const WorkspaceAddDialog = (props: WorkspaceAddDialogProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { open, onClose, onCancel } = props;
  const [data, setData] = useState<any>(initial);
  const [finalPath, setFinalPath] = useState('');

  const onSelectPathHandler = async () => {
    const paths = await dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (paths && paths.length > 0) {
      setData({ ...data, PATH: paths[0] });
    }
  };

  const isValid = (): boolean => {
    return data.NAME && data.PATH;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    onClose({ action: DIALOG_ACTIONS.OK, data: { ...data, PATH: finalPath } });
  };

  useEffect(() => {
    if (data.PATH) setFinalPath(data.PATH + window.path.sep + data.NAME);
  }, [data]);

  return (
    <Dialog
      id="WorkspaceAddDialog"
      className={`${classes.path} dialog`}
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
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">{t('Dialog:WorkspaceName')}</label>
            <Paper className={`${classes.field} dialog-form-field-control `}>
              <TextField
                name="name"
                size="small"
                maxRows={30}
                fullWidth
                value={data.NAME}
                onChange={(e) => setData({ ...data, NAME: e.target.value })}
                required
                autoFocus
              />
            </Paper>
          </div>

          <div className={`${classes.path} dialog-row`}>
            <div className="dialog-form-field">
              <label className="dialog-form-field-label"> {t('Dialog:WorkspaceLocation')}</label>
              <Paper className={`${classes.field} dialog-form-field-control `}>
                <TextField
                  name="location"
                  size="small"
                  fullWidth
                  value={data.PATH}
                  onChange={(e) => setData({ ...data, PATH: e.target.value })}
                />
              </Paper>
            </div>
            <div className="dialog-form-field">
              <Button type="button" variant="text" color="primary" startIcon={<SearchIcon />} onClick={onSelectPathHandler}>
                {t('Button:Choose')}
              </Button>
            </div>
          </div>
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
