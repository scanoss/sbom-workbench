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
  DialogContentText,
} from '@material-ui/core';
import React from 'react';
import { Inventory } from '../../../../api/types';
import { Component } from '../../WorkbenchProvider';
import Label from '../Label/Label';
import Title from '../Title/Title';

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
  onCancel: () => void;
}

export const InventoryDialog = (props: InventoryDialogProps) => {
  const classes = useStyles();
  const { onClose, open, component, onCancel } = props;

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
          <DialogContentText>
            Are you sure you want to mark all these files as identified?
          </DialogContentText>
          <div className="d-flex flex-column mb-3">
            <Label label="COMPONENT" textColor="gray" />
            <Title title={component.name} />
          </div>
          <div className="d-flex flex-column">
            <Label label="VENDOR" textColor="gray" />
            <Title title={component.vendor} />
          </div>
        </DialogContent>
        <DialogActions className={classes.content}>
          <Button onClick={onCancel} color="primary">
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
