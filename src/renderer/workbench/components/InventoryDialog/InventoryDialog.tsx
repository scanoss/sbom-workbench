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
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import React, { useEffect, useState, useContext } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { Inventory } from '../../../../api/types';
import { InventoryForm } from '../../../context/types';
import { componentService } from '../../../../api/component-service';
import { licenseService } from '../../../../api/license-service';
import { DialogContext } from '../../../context/DialogProvider';
import { ResponseStatus } from '../../../../main/Response';
import ComponentDialog from '../ComponentDialog/ComponentDialog';

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

interface InventoryDialogProps {
  open: boolean;
  inventory: Partial<InventoryForm>;
  onClose: (inventory: Inventory) => void;
  onCancel?: () => void;
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
        url,
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
        url,
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
    return license_name && version && component && url && purl && usage;
  };

  useEffect(setDefaults, [inventory]);
  useEffect(() => fetchData(), [open]);

  useEffect(() => {
    const component = data.find((item) => item.purl === form.purl);
    if (component) {
      setVersions(component?.versions.map((item) => item.version));
      setForm({ ...form, url: component.url, component: component.name, purl: component.purl });
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
    <Dialog id="InventoryDialog" maxWidth="md" scroll="body" fullWidth open={open} onClose={onCancel}>
      <span className="dialog-title">Identify Component</span>
      <form onSubmit={handleClose}>
        <div className="identity-component">
          <div className="component-version-container">
            <div className="component-container">
              <div className="btn-label-container">
                <div className="component-label-container">
                  <label>Component</label>
                </div>
                <div className="component-btn-container">
                  <IconButton color="inherit" size="small" onClick={openComponentDialog}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </div>
              </div>
              <Paper className={classes.paper}>
                <SearchIcon className={classes.iconButton} />
                <Autocomplete
                  fullWidth
                  className={classes.input}
                  options={components || []}
                  value={{ name: form?.component, purl: form?.purl }}
                  getOptionSelected={(option, value) => option.purl === value.purl}
                  getOptionLabel={(option) => option.name}
                  disableClearable
                  onChange={(e, value) => autocompleteHandler('purl', value.purl)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        className: classes.autocomplete,
                      }}
                    />
                  )}
                />
              </Paper>
            </div>
            <div className="component-container">
              <div className="btn-label-container">
                <div className="component-label-container">
                  <label>Version</label>
                </div>
                <div className="component-btn-container">
                  <IconButton color="inherit" size="small" onClick={openComponentVersionDialog}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </div>
              </div>
              <Paper className={classes.paper}>
                <SearchIcon className={classes.iconButton} />
                <Autocomplete
                  fullWidth
                  className={classes.input}
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
                        className: classes.autocomplete,
                      }}
                    />
                  )}
                />
              </Paper>
            </div>
          </div>
          <div className="component-container">
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
            <Paper className={classes.paper}>
              <SearchIcon className={classes.iconButton} />
              <Autocomplete
                fullWidth
                className={classes.input}
                options={licenses || []}
                groupBy={(option) => option?.type}
                // getOptionLabel={(option) => (option?.name ? option.indicatorName : '')}
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
                      className: classes.autocomplete,
                    }}
                  />
                )}
                onChange={(e, value) => autocompleteHandler('license_name', value.name)}
              />
            </Paper>
          </div>
          <div className="component-container">
            <label>URL</label>
            <Paper className={classes.paper}>
              <InputBase
                name="url"
                fullWidth
                readOnly
                className={classes.input}
                value={form?.url}
                onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
          <div className="component-container">
            <label>PURL</label>
            <Paper className={classes.paper}>
              <InputBase
                name="purl"
                fullWidth
                readOnly
                value={form?.purl || ''}
                className={classes.input}
                onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
          <div className="usage-notes">
            <div>
              <label>Usage</label>
              <Paper className={classes.paper}>
                <Select
                  name="usage"
                  fullWidth
                  value={form?.usage || ''}
                  className={classes.input}
                  disableUnderline
                  onChange={(e) => inputHandler(e)}
                >
                  <MenuItem value="file">File</MenuItem>
                  <MenuItem value="snippet">Snippet</MenuItem>
                  <MenuItem value="pre-requisite">Pre-requisite</MenuItem>
                </Select>
              </Paper>
            </div>
            <div>
              <label>Notes</label>
              <Paper className={classes.paper}>
                <TextareaAutosize
                  name="notes"
                  value={form?.notes || ''}
                  className={classes.input}
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
