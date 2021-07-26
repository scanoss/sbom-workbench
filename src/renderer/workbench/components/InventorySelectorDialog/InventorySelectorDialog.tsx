import { Dialog, DialogActions, Button, makeStyles, DialogContentText, Card, DialogContent } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import React, { useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Inventory } from '../../../../api/types';
import Label from '../Label/Label';

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: 400,
  },
  paper: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  actions: {
    backgroundColor: 'var(--background-color-primary)',
  },
}));

interface InventorySelectorDialogProps {
  open: boolean;
  inventories: Inventory[];
  onClose: (response: { action: string; inventory?: Inventory | null }) => void;
}

export const InventorySelectorDialog = (props: InventorySelectorDialogProps) => {
  const classes = useStyles();
  const { open, inventories, onClose } = props;

  const [selected, setSelected] = useState<Inventory | null>(null);

  const handleCancel = () => {
    onClose({ action: 'cancel' });
  };

  const handleAccept = () => {
    onClose({ action: 'ok', inventory: selected });
  };

  const handleNew = () => {
    onClose({ action: 'new' });
  };

  return (
    <Dialog
      id="InventorySelectorDialog"
      className="dialog"
      maxWidth="sm"
      scroll="body"
      fullWidth
      open={open}
      onClose={handleCancel}
    >
      <MuiDialogTitle>
        <span>Existing groups</span>
        <IconButton aria-label="close" className={classes.closeButton} onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </MuiDialogTitle>
      <DialogContent>
        <DialogContentText>
          You already have groups for the component you want to identify. Do you want to add this file to the group?
        </DialogContentText>
        <Label label="GROUPS USAGE" />
        <section className="list-groups">
          {inventories.map((inventory) => (
            <Card
              className={`usage-card ${inventory === selected && 'selected'}`}
              onClick={() => setSelected(inventory)}
              onDoubleClick={() => handleAccept()}
              key={inventory.id}
              elevation={1}
            >
              <div className="usage-card-content">{inventory.usage}</div>
            </Card>
          ))}
        </section>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleNew}>Identify new</Button>
        <Button disabled={!selected} variant="contained" color="secondary" onClick={handleAccept}>
          Add files(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventorySelectorDialog;
