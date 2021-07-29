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
import React, { useState, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Inventory } from '../../../../api/types';
import { Component } from '../../WorkbenchProvider';

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
  component: Component;
  onClose: (inventory: Inventory) => void;
  onCancel: () => void;
}

export const InventoryDialog = (props: InventoryDialogProps) => {
  const classes = useStyles();
  const { onClose, open, component, onCancel } = props;
  const [form, setForm] = useState({
    component: component?.name,
    version: component?.version,
    license_name: component?.licenses[0] ? component?.licenses[0].name : '',
    url: component?.url,
    purl: component?.purl[0],
    usage: 'file',
    notes: '',
  });

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

  useEffect(() => {
    console.log(form);
  }, [form]);

  const [data, setData] = useState([
    {
      name: 'scanner',
      purl: 'asdas',
      url: 'bla bla',
      versions: [
        {
          version: '2.0.3',
          licenses: [{ name: 'MIT' }, { name: 'MIT 2' }, { name: 'Apache' }],
        },
        {
          version: '2.0.2',
          licenses: [{ name: 'MIT' }, { name: 'MIT 2' }, { name: 'Apache' }],
        },
        {
          version: '2.0.1',
          licenses: [{ name: 'MIT' }, { name: 'MIT 2' }, { name: 'Apache' }],
        },
      ],
    },
    {
      name: 'react',
      purl: 'asdas',
      url: 'bla bla',
      versions: [
        {
          version: '5.5.5',
          licenses: [{ name: 'MIT' }, { name: 'MIT 2' }, { name: 'Apache' }],
        },
        {
          version: '5.5.5',
          licenses: [{ name: 'MIT' }, { name: 'MIT 2' }, { name: 'Apache' }],
        },
        {
          version: '5.5.5',
          licenses: [{ name: 'MIT' }, { name: 'MIT 2' }, { name: 'Apache' }],
        },
      ],
    },
  ]);

  const [namecomponent, setNamecomponent] = useState<string>('');
  const [versionscomponent, setVersions] = useState<any>([]);
  const [licensescomponent, setLicenses] = useState<any>([]);

  const changeNameComponent = async (e, value) => {
    await setNamecomponent(value);
    console.log(value);
  };

  useEffect(() => {
    setVersions(data?.find((item) => item?.name === namecomponent)?.versions.map((item) => item?.version));
  }, [namecomponent]);

    // useEffect(() => {
    //   setLicenses(
    //     data
    //       ?.find((item) => item?.name === namecomponent)
    //       ?.versions.map((item) => item?.licenses)
    //       .map((item) => item?.name)
    //   );
    // }, [versionscomponent]);

  const options = ['sugus', 'bananita dolca', 'media hora', 'react', 'scanner'];

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
                options={options}
                // groupBy={(option) => option.firstLetter}
                // getOptionLabel={(option) => option.title}
                style={{ outline: 'none' }}
                fullWidth
                renderInput={(params) => <TextField {...params} />}
                onChange={changeNameComponent}
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
                options={versionscomponent}
                // groupBy={(option) => option.firstLetter}
                // getOptionLabel={(option) => option.title}
                style={{ outline: 'none' }}
                fullWidth
                name="version"
                className={classes.component}
                defaultValue={form?.version}
                placeholder="Version"
                onChange={(e) => inputHandler(e)}
                renderInput={(params) => <TextField {...params} />}
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
              options={licensescomponent}
              // groupBy={(option) => option.firstLetter}
              // getOptionLabel={(option) => option.title}
              style={{ outline: 'none' }}
              fullWidth
              renderInput={(params) => <TextField {...params} />}
              name="license_name"
              defaultValue={form?.license_name}
              className={classes.component}
              placeholder="License"
              onClick={(e) => setLicenses(e.target.value)}
            />
          </Paper>
        </div>
        <div className="component-container">
          <label>URL</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="url"
              defaultValue={form?.url}
              className={classes.component}
              placeholder="url"
              fullWidth
              onChange={(e) => inputHandler(e)}
            />
          </Paper>
        </div>
        <div className="component-container">
          <label>PURL</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="purl"
              defaultValue={form?.purl}
              className={classes.component}
              placeholder="Purl"
              fullWidth
              onChange={(e) => inputHandler(e)}
            />
          </Paper>
        </div>
        <div className="usage-notes">
          <div>
            <label>Usage</label>
            <Paper component="form" className={classes.paper}>
              <Select
                name="usage"
                defaultValue={form?.usage}
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
                defaultValue={form?.notes}
                className={classes.component}
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
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Identify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryDialog;
