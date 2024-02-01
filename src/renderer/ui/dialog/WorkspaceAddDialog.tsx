import { useState, useEffect } from "react";
import { DialogResponse, DIALOG_ACTIONS } from "@context/types";
import { Dialog, Paper, TextField, DialogActions, Button } from "@mui/material";
import { useTranslation } from "react-i18next";


const initial = {
  NAME: '',
  LOCATION: '',
  DESCRIPTION: '',
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

  const isValid = () => {
    return true;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    onClose({ action: DIALOG_ACTIONS.OK, data: data });
  };

  return (
    <Dialog id="WorkspaceAddDialog" maxWidth="xs" fullWidth className="dialog" open={open} onClose={onCancel}>
      <form onSubmit={onSubmit}>
        <div className="dialog-content">
          <div className="dialog-form-field">
            <label className="dialog-form-field-label"> Workspace Name</label>
            <Paper className="dialog-form-field-control">
              <TextField
                name="name"
                size="small"
                fullWidth
                value={data.URL}
                onChange={(e) => setData({ ...data, URL: e.target.value })}
                required
                autoFocus
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">Workspace Location</label>
            <Paper className="dialog-form-field-control">
              <TextField
                name="location"
                size="small"
                fullWidth
                value={data.API_KEY}
                onChange={(e) => setData({ ...data, API_KEY: e.target.value })}
              />
            </Paper>
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
