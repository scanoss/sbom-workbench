/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  Dialog,
  Paper,
  DialogActions,
  Button,
  makeStyles,
  InputBase,
  Select,
  MenuItem,
  TextareaAutosize,
  TextField,
} from '@material-ui/core';

import React, { useEffect, useState } from 'react';
import { License } from '../../../../api/types';
import { licenseService } from '../../../../api/license-service';
import { ContactSupportOutlined } from '@material-ui/icons';
import { DialogResponse, DIALOG_ACTIONS } from '../../../context/types';
import { ResponseStatus } from '../../../../main/Response';

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: 400,
  },
  paper: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  iconButton: {
    padding: 7,
  },
  input: {
    color: '#6c6c6e',
    padding: theme.spacing(0.5),
  },
  autocomplete: {
    color: '#6c6c6e',
  },
  actions: {
    backgroundColor: 'var(--background-color-primary)',
  },
}));

interface LicenseDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

export const LicenseDialog = (props: LicenseDialogProps) => {
  const classes = useStyles();
  const { open, onClose, onCancel } = props;
  const [form, setForm] = useState<Partial<License>>({});

  const inputHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = async () => {
    const license: Partial<License> = form;
    const response = await licenseService.create(license);
    if (response.status === ResponseStatus.OK) onClose({ action: DIALOG_ACTIONS.OK, data: response.data });
    else
    console.log(response.status)
  };

  const isValid = () => {
    const { url, name, spdxid, fulltext } = form;
    return url && name && spdxid && url && fulltext;
  };

  return (
    <Dialog id="LicenseDialog" maxWidth="md" scroll="body" fullWidth open={open} onClose={onCancel}>
      <span className="dialog-title">License new</span>
      <div className="component-version-container">
        <div className="component-container">
          <label>NAME</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="name"
              fullWidth
              className={classes.input}
              value={form?.name}
              onChange={(e) => inputHandler(e)}
              required
            />
          </Paper>
        </div>
        <div className="component-container">
          <label>URL</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="url"
              fullWidth
              className={classes.input}
              value={form?.url}
              onChange={(e) => inputHandler(e)}
              required
            />
          </Paper>
        </div>
        <div className="component-container">
          <label>SPDXID</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="spdxid"
              fullWidth
              className={classes.input}
              value={form?.spdxid}
              onChange={(e) => inputHandler(e)}
              required
            />
          </Paper>
        </div>
        <div>
          <label>FULL TEXT</label>
          <Paper component="form" className={classes.paper}>
            <TextareaAutosize
              name="fulltext"
              value={form?.fulltext}
              className={classes.input}
              cols={30}
              rows={8}
              onChange={(e) => inputHandler(e)}
            />
          </Paper>
        </div>
      </div>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="secondary" onClick={handleClose} disabled={!isValid()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LicenseDialog;
