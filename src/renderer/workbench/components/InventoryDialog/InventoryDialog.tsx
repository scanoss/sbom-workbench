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
import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { Inventory } from '../../../../api/types';
import { InventoryForm } from '../../../context/types';
import { componentService } from '../../../../api/component-service';
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
  const { open, inventory, onClose, onCancel } = props;
  const [form, setForm] = useState<Partial<InventoryForm>>(inventory);

  const [data, setData] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>();
  const [versions, setVersions] = useState<any[]>();
  const [licenses, setLicenses] = useState<any[]>();
  const [showComponentDialog, setShowComponentDialog] = useState<boolean[]>(false);

  const setDefaults = () => setForm(inventory);

  const fetchData = async () => {
    if (open) {
      const { data } = await componentService.getAllComponentGroup();
      setData(data);
      setComponents(data.map((item) => item.name));
      if (form.component) {}
    }
  };

  const handleClose = () => {
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
    const { version, component, url, purl, license_name } = form;
    return license_name && version && component && url && purl;
  };

  useEffect(setDefaults, [inventory]);
  useEffect(() => fetchData(), [open]);

  useEffect(() => {
    const component = data.find((item) => item.name === form.component);
    if (component) {
      setVersions(component?.versions.map((item) => item.version));
      setForm({ ...form, url: component.url, purl: component.purl });
    }
  }, [form.component, components] );

  useEffect(() => {
    const lic = data.find((item) => item?.name === form?.component)
      ?.versions.find((item) => item?.version === form.version)
      ?.licenses.map((item) => item?.name)
    setLicenses(lic);
  }, [form.version]);

  useEffect(() => {
    if (versions && versions[0]) setForm({ ...form, version: versions[0] });
  }, [versions]);

  useEffect(() => {
    if (licenses && licenses[0]) setForm({ ...form, license_name: licenses[0] });
  }, [licenses]);

  return (
    <Dialog id="InventoryDialog" maxWidth="md" scroll="body" fullWidth open={open} onClose={onCancel}>
      <span className="dialog-title">Identify Component</span>
      <div className="identity-component">
        <div className="component-version-container">
          <div className="component-container">
          <Button onClick={() => setShowComponentDialog(true)}>+</Button>
            <label>Component</label>
            <Paper className={classes.paper}>
              <SearchIcon className={classes.iconButton}  />
              <Autocomplete
                fullWidth
                className={classes.input}
                options={components || []}
                value={form?.component}
                disableClearable
                onChange={(e, value) => autocompleteHandler('component', value)}
                renderInput={(params) => (
                  <TextField {...params} InputProps={{ ...params.InputProps, disableUnderline: true, className: classes.autocomplete }} />
                )}
              />
            </Paper>
          </div>
          <div className="component-container">
            <label>Version</label>
            <Paper component="form" className={classes.paper}>
              <SearchIcon className={classes.iconButton}  />
              <Autocomplete
                fullWidth
                className={classes.input}
                options={versions || []}
                value={form?.version}
                disableClearable
                onChange={(e, value) => autocompleteHandler('version', value)}
                renderInput={(params) => (
                  <TextField required {...params} InputProps={{ ...params.InputProps, disableUnderline: true, className: classes.autocomplete }} />
                )}
              />
            </Paper>
          </div>
        </div>
        <div className="component-container">
          <label>License</label>
          <Paper component="form" className={classes.paper}>
            <SearchIcon className={classes.iconButton}  />
            <Autocomplete
              fullWidth
              className={classes.input}
              options={licenses  || []}
              value={form.license_name}
              disableClearable
              renderInput={(params) => (
                <TextField required {...params} InputProps={{ ...params.InputProps, disableUnderline: true, className: classes.autocomplete }} />
              )}
              onChange={(e, value) => autocompleteHandler('license_name', value)}
            />
          </Paper>
        </div>
        <div className="component-container">
          <label>URL</label>
          <Paper component="form" className={classes.paper}>
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
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="purl"
              fullWidth
              readOnly
              value={form?.purl}
              className={classes.input}
              onChange={(e) => inputHandler(e)}
              required
            />
          </Paper>
        </div>
        <div className="usage-notes">
          <div>
            <label>Usage</label>
            <Paper component="form" className={classes.paper}>
              <Select
                name="usage"
                fullWidth
                value={form?.usage}
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
            <Paper component="form" className={classes.paper}>
              <TextareaAutosize
                name="notes"
                value={form?.notes}
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
        <Button variant="contained" color="secondary" onClick={handleClose} disabled={!isValid()}>
          Identify
        </Button>
      </DialogActions>
      {showComponentDialog ? <ComponentDialog /> : null}
    </Dialog>
  );
};

export default InventoryDialog;
