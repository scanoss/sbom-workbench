/* eslint-disable jsx-a11y/label-has-associated-control */
import { Dialog, Paper, DialogActions, Button, makeStyles, InputBase, TextareaAutosize } from '@material-ui/core';

import React, { useContext, useEffect, useState } from 'react';
import { License } from '../../../../api/types';
import { licenseService } from '../../../../api/license-service';
import { DialogResponse, DIALOG_ACTIONS } from '../../../context/types';
import { ResponseStatus } from '../../../../main/Response';

// TO DO
import { DialogContext } from '../../../context/DialogProvider';

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: 200,
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
  const dialogCtrl = useContext<any>(DialogContext);

  const inputHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = async (e) => {
    e.preventDefault();
    console.log(e);
    try {
      const license: Partial<License> = form;
      const response = await licenseService.create(license);
      onClose({ action: DIALOG_ACTIONS.OK, data: response });
    } catch (error) {
      await dialogCtrl.openConfirmDialog(
        'The license already exist in the catalog',
        { label: 'acept', role: 'acept' },
        true
      );
    }
  };

  const isValid = () => {
    const { url, name, spdxid, fulltext } = form;
    return url && name && spdxid && url && fulltext;
  };

  return (
    <Dialog id="LicenseDialog" maxWidth="md" scroll="body" fullWidth open={open} onClose={onCancel}>
      <span className="dialog-title">Create license</span>
      <form action="#" onSubmit={handleClose}>
        <div className="identity-license">
          <div className="license-container">
            <label>Name</label>
            <Paper className={classes.paper}>
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
          <div className="license-container">
            <label>SPDX ID</label>
            <Paper className={classes.paper}>
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
          <div className="license-container">
            <label>Full text</label>
            <Paper className={classes.paper}>
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
          <div className="license-container">
            <label>URL</label>
            <Paper className={classes.paper}>
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
        </div>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LicenseDialog;
