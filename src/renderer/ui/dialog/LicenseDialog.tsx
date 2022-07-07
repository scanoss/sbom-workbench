/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useContext, useEffect, useState } from 'react';
import { Dialog, Paper, DialogActions, Button, InputBase, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { License } from '@api/types';
import { licenseService } from '@api/services/license.service';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { DialogContext } from '@context/DialogProvider';
import { licenseHelper } from '../../../main/helpers/LicenseHelper';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '500px',
    },
  }
}));

interface LicenseDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
  save?: boolean;
}

export const LicenseDialog = (props: LicenseDialogProps) => {
  const classes = useStyles();
  const { open, onClose, onCancel, save } = props;
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
      const response = save ? await licenseService.create({ name:form.name, fulltext: form.fulltext  }) : {...license, spdxid: licenseHelper.licenseNameToSPDXID(form.name)};
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
    const { name, fulltext } = form;
    return name && fulltext;
  };

  useEffect(() => {
    if (open) {
      setForm({});
    }
  }, [open]);

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
              <TextField name="name" size="small" fullWidth value={form?.name} onChange={(e) => inputHandler(e)} />
            </Paper>
            <p className="dialog-form-field-hint">
              SpdxID: {form?.name ? licenseHelper.licenseNameToSPDXID(form.name) : '-'}
            </p>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">Full text</label>
            <Paper className="dialog-form-field-control">
              <TextField
                name="fulltext"
                size="small"
                fullWidth
                multiline
                value={form?.fulltext}
                minRows={8}
                onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">
              URL <span className="optional">- Optional</span>
            </label>
            <Paper className="dialog-form-field-control">
              <TextField name="url" size="small" fullWidth value={form?.url} onChange={(e) => inputHandler(e)} />
            </Paper>
          </div>
        </div>
        <DialogActions>
          <Button tabIndex={-1} onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

LicenseDialog.defaultProps = {
  save: false,
};

export default LicenseDialog;
