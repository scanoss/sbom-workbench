/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  TextField,
  DialogActions,
  Button,
  makeStyles,
  InputBase,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React, { useState, useEffect } from 'react';
import { Inventory } from '../../../../api/types';
import { Component } from '../../WorkbenchProvider';

const useStyles = makeStyles((theme) => ({
  container: {},
  paper: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  dialog: {},
  component: {
    padding: theme.spacing(0.5),
  },
  // content: {
  //   backgroundColor: 'var(--background-color-primary)',
  //   padding: theme.spacing(1),
  //   display: grid,
  //   gridTemplateColumns: 1fr,
  //   gridTemplateRows: 1fr 1fr 1fr 1fr 2fr,
  //   gap: 5% 0%,
  // },
  actions: {
    backgroundColor: 'var(--background-color-primary)',
  },
}));

interface InventoryDialogProps {
  open: boolean;
  component: Component;
  onClose: (inventory: Inventory) => void;
}

export const InventoryDialog = (props: InventoryDialogProps) => {
  const classes = useStyles();
  const { onClose, open, component } = props;

  const [form, setForm] = useState({
    component: component.name,
    version: component.version,
    license_name: component.licences[0] ? component.licences[0].name : '',
    url: component.url,
    purl: component.purl[0],
    usage: '',
    notes: '',
  });

  const handleClose = () => {
    const inventory: Inventory = form;

    onClose(inventory);
    console.log(inventory);
  };

  useEffect(() => {
    console.table(form);
  }, [form]);

  const inputHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open={open}
      onClose={handleClose}
      className={classes.container}
    >
      <span className="dialog-title">Identify Component</span>
      <div className="identity-component">
        <div className="component-version-container">
          <div className="component-container">
            <label>Component</label>
            <Paper className={classes.paper}>
              <SearchIcon />
              <InputBase
                className={classes.component}
                placeholder="Component"
                fullWidth
                defaultValue={form?.component}
                name="component"
                onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
          <div className="component-container">
            <label>Version</label>
            <Paper component="form" className={classes.paper}>
              <InputBase
                className={classes.component}
                defaultValue={form?.version}
                name="version"
                onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
        </div>
        <div className="component-container">
          <label>License</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              className={classes.component}
              placeholder="License"
              fullWidth
              defaultValue={form?.license_name}
              name="license_name"
              onChange={(e) => inputHandler(e)}
            />
          </Paper>
        </div>
        <div className="component-container">
          <label>URL</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              className={classes.component}
              placeholder="url"
              defaultValue={form?.url}
              name="url"
              onChange={(e) => inputHandler(e)}
            />
          </Paper>
        </div>
        <div className="component-container">
          <label>PURL</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              className={classes.component}
              placeholder="Purl"
              defaultValue={form?.purl}
              name="purl"
              onChange={(e) => inputHandler(e)}
            />
          </Paper>
        </div>
        <div className="usage-notes">
          <div>
            <label>Usage</label>
            <Paper component="form" className={classes.paper}>
              <SearchIcon />
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                fullWidth
                name="usage"
                onChange={(e) => inputHandler(e)}
              >
                <MenuItem value="File">File</MenuItem>
                <MenuItem value="Snippet">Snippet</MenuItem>
                <MenuItem value="pre-requisite">pre-requisite</MenuItem>
              </Select>
            </Paper>
          </div>
          <div>
            <label>Notes</label>
            <Paper component="form" className={classes.paper}>
              <TextareaAutosize
                id=""
                cols="30"
                rows="10"
                className="textarea"
                defaultValue={form?.notes}
                name="notes"
                onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
        </div>
      </div>

      <DialogActions className={classes.content}>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Identify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryDialog;
