/* eslint-disable jsx-a11y/label-has-associated-control */
import { Dialog, Paper, DialogActions, Button, makeStyles, InputBase, TextareaAutosize } from '@material-ui/core';

import React, { useContext, useEffect, useState } from 'react';
import { License } from '../../../api/types';
import { licenseService } from '../../../api/license-service';
import { DialogResponse, DIALOG_ACTIONS } from '../../context/types';
import { ResponseStatus } from '../../../main/Response';

// TO DO
import { DialogContext } from '../../context/DialogProvider';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '500px',
    },
  },
  search: {
    padding: '10px 0px 10px 10px',
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
    <Dialog
      id="LicenseDialog"
      maxWidth="md"
      scroll="body"
      className={`${classes.size} dialog`}
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <span className="dialog-title">Create License</span>
      <form onSubmit={handleClose}>
        <div className="dialog-content">
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">Name</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="name"
                fullWidth
                value={form?.name}
                onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">SPDX ID</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="spdxid"
                fullWidth
                value={form?.spdxid}
                onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">Full text</label>
            <Paper className="dialog-form-field-control">
              <TextareaAutosize
                name="fulltext"
                value={form?.fulltext}
                cols={30}
                rows={8}
                onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">URL</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="url"
                fullWidth
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
