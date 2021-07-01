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
} from '@material-ui/core';
import React from 'react';
import { Inventory } from '../../../../api/types';
import { Component } from '../../WorkbenchProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    padding: theme.spacing(1),
  },
  content: {
    backgroundColor: 'var(--background-color-primary)',
    padding: theme.spacing(1),
  },
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
      version: component.version,
      notes: 'no notes',
      usage: 'file',
      license_name: component.licenses[0]
        ? component.licenses[0].name
        : 'no-data',
    };

    onClose(inventory);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Identify Component</DialogTitle>
        <DialogContent className={classes.content} dividers>
          {/* <TextField
            autoFocus
            margin="dense"
            variant="filled"
            id="component"
            label="Component"
            type="text"
            fullWidth
          /> */}

          <Paper component="form" className={classes.root}>
            <InputBase
              className={classes.input}
              placeholder="Component"
              fullWidth
            />
          </Paper>
        </DialogContent>
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
