/* eslint-disable import/no-cycle */
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
  IconButton,
  Tooltip,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import React, { useEffect, useState, useContext } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { Inventory } from '../../../api/types';
import { InventoryForm } from '../../context/types';
import { componentService } from '../../../api/component-service';
import { licenseService } from '../../../api/license-service';
import { DialogContext } from '../../context/DialogProvider';
import { ResponseStatus } from '../../../main/Response';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '700px',
    },
  },
  usageNotes: {
    display: 'grid',
    gridTemplateColumns: '0.75fr 1fr',
    gridGap: '20px',
  },
  componentVersion: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 0.75fr',
    gridGap: '20px',
  },
  search: {
    padding: '10px 0px 10px 10px',
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
    '& span.middle': {
      fontSize: '0.8rem',
      color: '#6c6c6e',
    },
  },
}));

interface InventoryDialogProps {
  open: boolean;
  inventory: Partial<InventoryForm>;
  onClose: (inventory: Inventory) => void;
  onCancel: () => void;
}

export const InventoryDialog = (props: InventoryDialogProps) => {
  const classes = useStyles();
  const dialogCtrl = useContext<any>(DialogContext);

  const { open, inventory, onClose, onCancel } = props;

  const [form, setForm] = useState<Partial<InventoryForm>>(inventory);
  const [data, setData] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>();
  const [versions, setVersions] = useState<any[]>();
  const [licenses, setLicenses] = useState<any[]>();
  const [licensesAll, setLicensesAll] = useState<any[]>();

  const setDefaults = () => setForm(inventory);

  const fetchData = async () => {
    if (open) {
      const componentsResponse = await componentService.getAllComponentGroup();
      const licensesResponse = await licenseService.getAll();

      setData(componentsResponse.data);
      setComponents(componentsResponse.data);
      const catalogue = licensesResponse.data.map((item) => ({
        name: item.name,
        type: 'Cataloged',
      }));
      setLicensesAll(catalogue);
      setLicenses(catalogue);
    }
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate();
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([...licenses, { name: response.data.name, type: 'Cataloged' }]);
      setForm({ ...form, license_name: response.data.name });
    }
  };

  const openComponentVersionDialog = async () => {
    const response = await dialogCtrl.openComponentDialog(
      { name: form.component, purl: form.purl, url: form.url, license_name: form.license_name },
      'Add Version'
    );
    if (response && response.action === ResponseStatus.OK) {
      const { name, version, licenses, purl, url } = response.data;
      setComponents([...components, response.data.name]);
      setForm({
        ...form,
        component: name,
        version,
        license_name: licenses[0].name,
        purl,
        url: url || '',
      });
    }
  };

  const openComponentDialog = async () => {
    const response = await dialogCtrl.openComponentDialog();
    if (response && response.action === ResponseStatus.OK) {
      const { name, version, licenses, purl, url } = response.data;
      setComponents([...components, response.data.name]);
      setForm({
        ...form,
        component: name,
        version,
        license_name: licenses[0].name,
        purl,
        url: url || '',
      });
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    const inventory: any = form;
    onClose(inventory);
  };

  const inputHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const autocompleteHandler = (name, value) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const isValid = () => {
    const { version, component, url, purl, license_name, usage } = form;
    return license_name && version && component && purl && usage;
  };

  useEffect(setDefaults, [inventory]);
  useEffect(() => fetchData(), [open]);

  useEffect(() => {
    const component = data.find((item) => item.purl === form.purl);
    if (component) {
      setVersions(component?.versions.map((item) => item.version));
      setForm({ ...form, url: component.url || '', component: component.name, purl: component.purl });
    }
  }, [form.purl, data]);

  useEffect(() => {
    const lic = data
      .find((item) => item?.name === form?.component)
      ?.versions.find((item) => item.version === form.version)
      ?.licenses.map((item) => ({ name: item.name, type: 'Matched' }));

    if (lic) {
      setLicenses([...lic, ...licensesAll]);
      setForm({ ...form, license_name: lic[0]?.name });
    }
  }, [form.version]);

  useEffect(() => {
    if (versions && versions[0]) setForm({ ...form, version: versions[0] });
  }, [versions]);

  return (
    <Dialog
      id="InventoryDialog"
      className={`${classes.size} dialog`}
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <span className="dialog-title">Identify Component</span>

      <form onSubmit={handleClose}>
        <div className="dialog-content">
          <div className={`${classes.componentVersion} dialog-row`}>
            <div className="dialog-form-field">
              <div className="dialog-form-field-label">
                <label>Component</label>
                <Tooltip title="Add new component">
                  <IconButton color="inherit" size="small" onClick={openComponentDialog}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </div>
              <Paper className="dialog-form-field-control">
                <SearchIcon className={classes.search} />
                <Autocomplete
                  fullWidth
                  options={components || []}
                  value={{ name: form?.component, purl: form?.purl }}
                  getOptionSelected={(option, value) => option.purl === value.purl}
                  getOptionLabel={(option) => option.name}
                  renderOption={(option) => (
                    <div className={classes.option}>
                      <span>{option.name}</span>
                      <span className="middle">{option.purl}</span>
                    </div>
                  )}
                  disableClearable
                  onChange={(e, value) => autocompleteHandler('purl', value.purl)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        className: 'autocomplete-option',
                      }}
                    />
                  )}
                />
              </Paper>
            </div>

            <div className="dialog-form-field">
              <div className="dialog-form-field-label">
                <label>Version</label>
                <Tooltip title="Add new version">
                  <IconButton color="inherit" size="small" onClick={openComponentVersionDialog}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </div>
              <Paper className="dialog-form-field-control">
                <SearchIcon className={classes.search} />
                <Autocomplete
                  fullWidth
                  options={versions || []}
                  value={form?.version || ''}
                  disableClearable
                  onChange={(e, value) => autocompleteHandler('version', value)}
                  renderInput={(params) => (
                    <TextField
                      required
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        className: 'autocomplete-option',
                      }}
                    />
                  )}
                />
              </Paper>
            </div>
          </div>

          <div className="dialog-row">
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
                  groupBy={(option) => option?.type}
                  value={form.license_name || ''}
                  getOptionSelected={(option) => option.name === form.license_name}
                  getOptionLabel={(option) => option.name || option}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      required
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        className: 'autocomplete-option',
                      }}
                    />
                  )}
                  onChange={(e, value) => autocompleteHandler('license_name', value.name)}
                />
              </Paper>
            </div>
          </div>

          <div className="dialog-row">
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">
                URL <span className="optional">- Optional</span>
              </label>
              <Paper className="dialog-form-field-control">
                <InputBase name="url" fullWidth readOnly value={form?.url} onChange={(e) => inputHandler(e)} />
              </Paper>
            </div>
          </div>

          <div className="dialog-row">
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">PURL</label>
              <Paper className="dialog-form-field-control">
                <InputBase
                  name="purl"
                  fullWidth
                  readOnly
                  value={form?.purl || ''}
                  onChange={(e) => inputHandler(e)}
                  required
                />
              </Paper>
            </div>
          </div>

          <div className={`${classes.usageNotes} dialog-row`}>
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">Usage</label>
              <Paper className="dialog-form-field-control">
                <Select
                  name="usage"
                  fullWidth
                  value={form?.usage || ''}
                  disableUnderline
                  onChange={(e) => inputHandler(e)}
                >
                  <MenuItem value="file">File</MenuItem>
                  <MenuItem value="snippet">Snippet</MenuItem>
                  <MenuItem value="pre-requisite">Pre-requisite</MenuItem>
                </Select>
              </Paper>
            </div>

            <div className="dialog-form-field">
              <label className="dialog-form-field-label">
                Notes <span className="optional">- Optional</span>
              </label>
              <Paper className="dialog-form-field-control">
                <TextareaAutosize
                  name="notes"
                  value={form?.notes || ''}
                  cols={30}
                  rows={8}
                  onChange={(e) => inputHandler(e)}
                />
              </Paper>
            </div>
          </div>
        </div>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            Identify
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryDialog;
