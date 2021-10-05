/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/label-has-associated-control */

import {
  Dialog,
  Tooltip,
  Paper,
  DialogActions,
  Button,
  makeStyles,
  InputBase,
  TextField,
  IconButton,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import { Autocomplete } from '@material-ui/lab';
import { NewComponentDTO } from '../../../api/types';
import { DialogResponse, DIALOG_ACTIONS } from '../../context/types';
import { ResponseStatus } from '../../../main/Response';
import { componentService } from '../../../api/component-service';
import { licenseService } from '../../../api/license-service';
import { DialogContext } from '../../context/DialogProvider';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '500px',
    },
  },
  componentVersion: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 0.75fr',
    gridGap: '20px',
  },
  search: {
    padding: '10px 0px 10px 10px',
  },
}));

interface ComponentDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
  component: Partial<NewComponentDTO>;
  label: string;
}

export const ComponentDialog = (props: ComponentDialogProps) => {
  const classes = useStyles();
  const { open, onClose, onCancel, component, label } = props;
  const [form, setForm] = useState<Partial<NewComponentDTO>>({});
  const dialogCtrl = useContext<any>(DialogContext);
  const [licenses, setLicenses] = useState<any[]>();
  const [readOnly, setReadOnly] = useState<boolean>();

  const setDefaults = () => {
    setForm(component);
    setReadOnly(!!component.name);
  };

  const fetchData = async () => {
    if (open) {
      const { data } = await licenseService.getAll();
      setLicenses(data);
    }
  };

  const getLicense = () => {
    if (!form.license_id && form.license_name) {
      const license = licenses.find((l) => l.name === form.license_name);
      if (license) {
        setForm({ ...form, license_id: license.id });
      }
    }
  };

  useEffect(() => fetchData(), [open]);
  useEffect(setDefaults, [component]);
  useEffect(getLicense, [licenses]);

  const inputHandler = (name, value) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleClose = async (e) => {
    e.preventDefault();
    try {
      const response = await componentService.create(form);
      onClose({ action: DIALOG_ACTIONS.OK, data: response });
    } catch (error) {
      console.log('error', error);
      await dialogCtrl.openConfirmDialog(error.message, { label: 'acept', role: 'acept' }, true);
    }
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate();
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([...licenses, response.data]);
      setForm({ ...form, license_id: response.data.id, license_name: response.data.name });
    }
  };

  const isValid = () => {
    const { name, version, license_id, purl } = form;
    return name && version && license_id && purl;
  };

  return (
    <Dialog
      id="ComponentDialog"
      className={`${classes.size} dialog`}
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <span className="dialog-title">{label}</span>

      <form onSubmit={handleClose}>
        <div className="dialog-content">
          <div className={`${classes.componentVersion} dialog-row`}>
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">Component</label>
              <Paper className="dialog-form-field-control">
                <InputBase
                  name="name"
                  fullWidth
                  readOnly={readOnly}
                  value={form?.name}
                  placeholder="Component"
                  onChange={(e) => inputHandler(e.target.name, e.target.value)}
                  required
                />
              </Paper>
            </div>

            <div className="dialog-form-field">
              <label className="dialog-form-field-label">Version</label>
              <Paper className="dialog-form-field-control">
                <InputBase
                  name="version"
                  fullWidth
                  value={form?.version}
                  placeholder="Version"
                  onChange={(e) => inputHandler(e.target.name, e.target.value)}
                  required
                />
              </Paper>
            </div>
          </div>

          <div className="dialog-form-field">
            <div className="dialog-form-field-label">
              <label>License</label>
              <Tooltip title="Add new license">
                <IconButton color="inherit" size="small" onClick={openLicenseDialog}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </div>
            <Paper className="dialog-form-field-control">
              <SearchIcon className={classes.search} />
              <Autocomplete
                fullWidth
                options={licenses || []}
                value={{ id: form?.license_id, name: form?.license_name }}
                getOptionSelected={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name || ''}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    InputProps={{ ...params.InputProps, disableUnderline: true, className: classes.autocomplete }}
                  />
                )}
                onChange={(e, { id, name }) => setForm({ ...form, license_id: id, license_name: name })}
              />
            </Paper>
          </div>

          {!readOnly && (
            <>
              <div className="dialog-form-field">
                <label className="dialog-form-field-label">PURL</label>
                <Paper className="dialog-form-field-control">
                  <InputBase
                    name="purl"
                    placeholder="PURL"
                    fullWidth
                    value={form?.purl}
                    onChange={(e) => inputHandler(e.target.name, e.target.value)}
                    required
                  />
                </Paper>
              </div>

              <div className="dialog-form-field">
                <label className="dialog-form-field-label">
                  URL <span className="optional">- Optional</span>
                </label>
                <Paper className="dialog-form-field-control">
                  <InputBase
                    name="url"
                    placeholder="URL"
                    fullWidth
                    value={form?.url}
                    onChange={(e) => inputHandler(e.target.name, e.target.value)}
                  />
                </Paper>
              </div>
            </>
          )}
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

export default ComponentDialog;
