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
  IconButton,
  TextField,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { Inventory } from '../../../../api/types';
import { InventoryForm } from '../../../context/types';
import { componentService } from '../../../../api/component-service';

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
  component: {
    color: '#89898b',
    padding: theme.spacing(0.5),
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
  const [data, setData] = useState([]);
  const [versionscomponent, setVersions] = useState<any>([form?.version]);
  const [arrayNames, setArrayNames] = useState<any>([form?.component]);
  const [licensescomponent, setLicenses] = useState<any>([form?.license]);
  const [formcomplete, setFormComplete] = useState<boolean>(true);

  const setDefaults = () => {
    setForm(inventory);
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  const handleClose = () => {
    const inventory: Inventory = form;
    onClose(inventory);
  };

  const inputHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(setDefaults, [inventory]);

  const autocompleteHandler = (name, value) => {
    console.log(value);
    setForm({
      ...form,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log(form);
  }, [form]);

  const getData = async () => {
    const response = await componentService.getCompVersions();
    console.log('LA RESPUESTA DEL SERVICIO DE AGUS ES', response?.comp);
    setData(response?.comp);
  };

  useEffect(() => {
    if (open === true) {
      getData();
    } else {
      console.log('Todavia no esta en true');
    }
  }, [form]);

  useEffect(() => {
    console.log('SE ACTIVA');
    setArrayNames(data.map((item) => item.name));
  }, [data]);

  useEffect(() => {
    const componentObject = data?.find((item) => item?.name === form?.component);
    setVersions(componentObject?.versions.map((item) => item?.version));
    setForm({ ...form, url: componentObject?.url, purl: componentObject?.purl });
    console.log('done');
  }, [form?.component, form?.notes, form?.version]);

  // License use Effect
  useEffect(() => {
    setLicenses(
      data
        ?.find((item) => item?.name === form?.component)
        ?.versions.find((item) => item?.version === form.version)
        ?.licenses.map((item) => item?.name)
    );
    console.log(licensescomponent);
  }, [form?.version]);

  useEffect(() => {
    if (versionscomponent) setForm({ ...form, version: versionscomponent[0] });
  }, [versionscomponent]);

  // function that checks if the form is complete
  const checkFormComplete = () => {
    console.log('chequeando...');
    const { version, component, url, purl, license, notes } = form;
    if (
      version === undefined ||
      component === undefined ||
      url === undefined ||
      purl === undefined ||
      license === undefined ||
      notes === undefined ||
      version.trim() === '' ||
      component.trim() === '' ||
      url.trim() === '' ||
      purl.trim() === '' ||
      license.trim() === '' ||
      notes.trim() === '' ||
      version === null ||
      component === null ||
      url === null ||
      purl === null ||
      license === null ||
      notes === null
    ) {
      setFormComplete(true);
    } else {
      setFormComplete(false);
    }
    console.log('CHEQUEADO');
    console.log(form);
  };
  useEffect(checkFormComplete, [form]);

  const options = [' ', ' ', ' '];

  return (
    <Dialog id="InventoryDialog" maxWidth="md" scroll="body" fullWidth open={open} onClose={onCancel}>
      <span className="dialog-title">Identify Component</span>
      <div className="identity-component">
        <div className="component-version-container">
          <div className="component-container">
            <label>Component</label>
            <Paper className={classes.paper}>
              <IconButton className={classes.iconButton} aria-label="menu">
                <SearchIcon />
              </IconButton>
              {/* <InputBase
                  name="component"
                  defaultValue={form?.component}
                  className={classes.component}
                  placeholder="Component"
                  fullWidth
                  onChange={(e) => inputHandler(e)}
                /> */}
              <Autocomplete
                id="grouped-demo"
                options={arrayNames}
                // groupBy={(option) => option.firstLetter}
                // getOptionLabel={(option) => option.title}
                style={{ outline: 'none' }}
                fullWidth
                onChange={(e, value) => autocompleteHandler('component', value)}
                renderInput={(params) => (
                  <TextField required {...params} InputProps={{ ...params.InputProps, disableUnderline: true }} />
                )}
                value={form?.component}
              />
            </Paper>
          </div>
          <div className="component-container">
            <label>Version</label>
            <Paper component="form" className={classes.paper}>
              {/* <InputBase
                name="version"
                className={classes.component}
                defaultValue={form?.version}
                placeholder="Version"
                fullWidth
                onChange={(e) => inputHandler(e)}
              /> */}
              <Autocomplete
                options={versionscomponent || options}
                // groupBy={(option) => option.firstLetter}
                // getOptionLabel={(option) => option.title}
                style={{ outline: 'none' }}
                fullWidth
                name="version"
                className={classes.component}
                value={form?.version}
                placeholder="Version"
                onChange={(e, value) => autocompleteHandler('version', value)}
                renderInput={(params) => (
                  <TextField required {...params} InputProps={{ ...params.InputProps, disableUnderline: true }} />
                )}
                onClick={(e) => setVersions(e.target.value)}
              />
            </Paper>
          </div>
        </div>
        <div className="component-container">
          <label>License</label>
          <Paper component="form" className={classes.paper}>
            {/* <InputBase
              name="license_name"
              defaultValue={form?.license_name}
              className={classes.component}
              placeholder="License"
              fullWidth
              onChange={(e) => inputHandler(e)}
            /> */}
            <Autocomplete
              id="grouped-demo"
              options={licensescomponent || options}
              // groupBy={(option) => option.firstLetter}
              // getOptionLabel={(option) => option.title}
              style={{ outline: 'none' }}
              fullWidth
              renderInput={(params) => (
                <TextField required {...params} InputProps={{ ...params.InputProps, disableUnderline: true }} />
              )}
              name="license_name"
              value={licensescomponent?.[0] || form?.license}
              className={classes.component}
              placeholder="License"
              onChange={(e, value) => autocompleteHandler('license_name', value)}
              onClick={(e) => setLicenses(e.target.value)}
            />
          </Paper>
        </div>
        <div className="component-container">
          <label>URL</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="url"
              value={form?.url}
              className={classes.component}
              placeholder="url"
              fullWidth
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
              value={form?.purl}
              className={classes.component}
              placeholder="Purl"
              fullWidth
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
                value={form?.usage}
                className={classes.component}
                fullWidth
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
                className={classes.component}
                cols={30}
                rows={8}
                onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
        </div>
      </div>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="secondary" onClick={handleClose} disabled={formcomplete}>
          Identify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryDialog;
