/* eslint-disable jsx-a11y/label-has-associated-control */
import { Dialog, Paper, DialogActions, Button, makeStyles, InputBase, TextareaAutosize, TextField, IconButton } from '@material-ui/core';

import React, { useContext, useEffect, useState } from 'react';
import { NewComponent } from '../../../../api/types';

import { DialogResponse, DIALOG_ACTIONS } from '../../../context/types';
import { ResponseStatus } from '../../../../main/Response';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import { Autocomplete } from '@material-ui/lab';
import { componentService } from '../../../../api/component-service';
import { licenseService } from '../../../../api/license-service';

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
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

export const ComponentDialog = (props: ComponentDialogProps) => {
  const classes = useStyles();
  const { open, onClose, onCancel } = props;
  const [form, setForm] = useState<Partial<NewComponent>>({});
  const dialogCtrl = useContext<any>(DialogContext);
  const [licenses, setLicenses] = useState<any[]>();
  
  const fetchData = async () => {
    if (open) {
      const licensesResponse = await licenseService.getAll();
      const catalogue = licensesResponse.data
      setLicenses(catalogue);
    }
  };

  useEffect(() => fetchData(), [open]);


  const inputHandler = (name, value) => {
    setForm({
      ...form,
      [name]: value,
    });
  };



  const handleClose = async () => {
    try {
      console.log('form', form);
      const component: Partial<NewComponent> = form;
      // const response = await licenseService.create(component);
      onClose({ action: DIALOG_ACTIONS.OK, data: response });
    } catch (error) {
      console.log('error', error);
      await dialogCtrl.openConfirmDialog(
        'The component already exist in the catalog',
        { label: 'acept', role: 'acept' },
        true
      );
    }
  };

  const isValid = () => {
    const { name, version, license_id, purl, url } = form;
    return name && version && license_id && purl && url;
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate();
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([...licenses, response.data]);
      console.log('response', response);
    }
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
              onChange={(e) => inputHandler('component',  e.target.value)}
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
              onChange={(e) => inputHandler('version',  e.target.value)}
              required
            />
          </Paper>
        </div>
        </div>
        <div className="license-container">
        <div className="btn-label-container">
            <div className="license-label-container">
              <label>License</label>
            </div>
            <div className="license-btn-container">
              <IconButton color="inherit" size="small" onClick={openLicenseDialog}>
                <AddIcon fontSize="inherit" />
              </IconButton>
            </div>
          </div>
          <Paper component="form" className={classes.paper}>
            <SearchIcon className={classes.iconButton}  />
            <Autocomplete
              fullWidth
              className={classes.input}
              options={licenses || []}
              value={form?.license_id}
              getOptionLabel={(option) => option.name || option}
              disableClearable
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  InputProps={{ ...params.InputProps, disableUnderline: true, className: classes.autocomplete }}
                />
              )}
              onChange={(e, value) => inputHandler('license_id', value.id)}
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
              onChange={(e) => inputHandler('purl',  e.target.value)}
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
              onChange={(e) => inputHandler('url',  e.target.value)}
              required
            />
          </Paper>
        </div>
      </div>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComponentDialog;