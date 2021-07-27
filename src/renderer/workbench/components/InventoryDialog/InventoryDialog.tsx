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
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useState } from 'react';
import { Inventory } from '../../../../api/types';
import { InventoryForm } from '../../../context/types';

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

  const setDefaults = () => {
    setForm(inventory);
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  const handleClose = () => {
    onClose(form);
  };

  const inputHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(setDefaults, [inventory]);

  return (
    <Dialog id="InventoryDialog" maxWidth="md" scroll="body" fullWidth open={open} onClose={handleCancel}>
      <span className="dialog-title">Identify Component</span>
      <div className="identity-component">
        <div className="component-version-container">
          <div className="component-container">
            <label>Component</label>
            <Paper className={classes.paper}>
              <IconButton className={classes.iconButton} aria-label="menu">
                <SearchIcon />
              </IconButton>
              <InputBase
                name="component"
                defaultValue={form?.component}
                className={classes.component}
                placeholder="Component"
                fullWidth
                readOnly
                onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
          <div className="component-container">
            <label>Version</label>
            <Paper component="form" className={classes.paper}>
              <InputBase
                name="version"
                className={classes.component}
                defaultValue={form?.version}
                placeholder="Version"
                fullWidth
                readOnly
                onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
        </div>
        <div className="component-container">
          <label>License</label>
          <Paper component="form" className={classes.paper}>
            <InputBase
              name="license"
              defaultValue={form?.license}
              className={classes.component}
              placeholder="License"
              fullWidth
              readOnly
              onChange={(e) => inputHandler(e)}
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
              readOnly
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
              readOnly
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
                maxLength={500}
                onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
        </div>
      </div>

      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Identify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryDialog;
