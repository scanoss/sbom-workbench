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
import React from 'react';
import { Inventory } from '../../../../api/types';
import { Component } from '../../WorkbenchProvider';

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: '',
    width: '733px',

  },

  paper: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  dialog: {

  },
  component: {
    padding: theme.spacing(1),
    width: '685px',
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

  const handleClose = () => {
    const inventory: Inventory = {
      purl: component.purl[0],
      url: component.url,
      notes: 'no notes',
      usage: 'file',
      license_name: component.licences[0]
        ? component.licences[0].name
        : 'no-data',
    };

    onClose(inventory);
  };

  return (
    <div className='container-principal'>
      <Dialog
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
                />
              </Paper>
            </div>
            <div className="component-container">
              <label>Version</label>
              <Paper component="form" className={classes.paper}>
                <InputBase
                  className={classes.component}
                  placeholder="Component"
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
              />
            </Paper>
          </div>
          <div className="component-container">
            <label>URL</label>
            <Paper component="form" className={classes.paper}>
              <InputBase className={classes.component} placeholder="License" />
            </Paper>
          </div>
          <div className="component-container">
            <label>PURL</label>
            <Paper component="form" className={classes.paper}>
              <InputBase className={classes.component} placeholder="License" />
            </Paper>
          </div>
          <div className="usage-notes">
            <div>
              <label>Usage</label>
              <Paper component="form" className={classes.paper}>
                <InputBase className={classes.component} placeholder="Choose" />
              </Paper>
            </div>
            <div>
              <label>Notes</label>
              <Paper component="form" className={classes.paper}>
                <textarea
                  name=""
                  id=""
                  cols="30"
                  rows="10"
                  className="textarea"
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
    </div>
  );
};

export default InventoryDialog;
