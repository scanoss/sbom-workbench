/* eslint-disable jsx-a11y/label-has-associated-control */
import { Dialog, Paper, DialogActions, Button, makeStyles, InputBase, TextareaAutosize, TextField } from '@material-ui/core';

import React, { useContext, useEffect, useState } from 'react';
import { NewComponent } from '../../../../api/types';

import { DialogResponse, DIALOG_ACTIONS } from '../../../context/types';
import { ResponseStatus } from '../../../../main/Response';
import SearchIcon from '@material-ui/icons/Search';
import { Autocomplete } from '@material-ui/lab';
import { componentService } from '../../../../api/component-service';

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

interface ComponentDialogProps {
  // open: boolean;
  // onClose: (response: DialogResponse) => void;
  // onCancel: () => void;
  licenses: any[];
}

export const ComponentDialog = (props: ComponentDialogProps) => {
  const classes = useStyles();
  // const { open, onClose, onCancel, licenses } = props;
  const { licenses } = props;
  const [form, setForm] = useState<Partial<NewComponent>>({});
  const dialogCtrl = useContext<any>(DialogContext);
  const [licensesArray, setLicensesArray] = useState<any[]>([]);


  const inputHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };



  const handleClose = async () => {
    try {
      const component: Partial<NewComponent> = form;
      // const response = await licenseService.create(license);
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
    const { name, version, license_id, purl, url } = form;
    return name && version && license_id && purl && url;
  };
  

  return (
    <Dialog id="ComponentDialog" maxWidth="md" scroll="body" fullWidth open={open}>
      <span className="dialog-title">Create component</span>
      <div className="identity-license">
      <div className="component-version-container">
        <div className="license-container">
          <label>Component</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="name"
              fullWidth
              className={classes.input}
              value={form?.name}
              placeholder="Component"    
              onChange={(e) => inputHandler(e)}
              required
            />
          </Paper>
        </div>
        <div className="license-container">
          <label>Version</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="version"
              fullWidth
              className={classes.input}
              value={form?.version}
              placeholder="Version"
              onChange={(e) => inputHandler(e)}
              required
            />
          </Paper>
        </div>
        </div>
        <div className="license-container">
        <label>License</label>
          <Paper component="form" className={classes.paper}>
            <SearchIcon className={classes.iconButton}  />
            <Autocomplete
              fullWidth
              className={classes.input}
              options={licenses || []}
              // value={form.license_name}
              disableClearable
              renderInput={(params) => (
                <TextField required {...params} InputProps={{ ...params.InputProps, disableUnderline: true, className: classes.autocomplete }} />
              )}
            //   onChange={(e, value) => autocompleteHandler('license_name', value)}
            />
          </Paper>
        </div>
        <div className="license-container">
          <label>PURL</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="purl"
              placeholder="PURL"
              fullWidth
              className={classes.input}
              value={form?.purl}
              onChange={(e) => inputHandler(e)}
              required
            />
          </Paper>
        </div>
        
        <div className="license-container">
          <label>URL</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="url"
              placeholder="URL"
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
        <Button >Cancel</Button>
        <Button variant="contained" color="secondary" onClick={() => {
          console.log(form);
        }} >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComponentDialog;