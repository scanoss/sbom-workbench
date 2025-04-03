import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, Button, DialogContentText, Card, DialogContent, Tooltip } from '@mui/material';
import MuiDialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Inventory } from '../../../../../api/types';
import Label from '../Label/Label';
import { DIALOG_ACTIONS, InventorySelectorResponse } from '../../../../context/types';
import { useTheme } from '@mui/material';


interface InventorySelectorDialogProps {
  open: boolean;
  inventories: Inventory[];
  onClose: (response: InventorySelectorResponse) => void;
}

export const InventorySelectorDialog = (props: InventorySelectorDialogProps) => {
  const theme = useTheme();
  const { open, inventories, onClose } = props;
  const [selected, setSelected] = useState<Inventory | null>(null);

  const handleCancel = () => onClose({ action: DIALOG_ACTIONS.CANCEL });
  const handleAccept = () => onClose({ action: DIALOG_ACTIONS.OK, inventory: selected });
  const handleNew = () => onClose({ action: DIALOG_ACTIONS.NEW });

  const setDefault = () => {
    if (open && selected && !inventories.find((inventory) => inventory.id === selected.id)) {
      setSelected(null);
    }
  };

  useEffect(setDefault, [open]);

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
        <IconButton
          aria-label="close"
          sx={{
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
          }}
          onClick={handleCancel}
          size="large">
          <CloseIcon />
        </IconButton>
      </MuiDialogTitle>
      <DialogContent>
        <DialogContentText>
          You already have groups for the component you want to identify. Do you want to add this file to the group?
        </DialogContentText>
        <Label label="GROUPS USAGE" textColor="gray" />
        <section className="list-groups">
          {inventories.map((inventory) => (
            <Card
              className={`usage-card ${inventory.id === selected?.id && 'selected'}`}
              onClick={() => setSelected(inventory)}
              onDoubleClick={() => handleAccept()}
              key={inventory.id}
              elevation={1}
            >
              <div className="usage-card-content">{inventory.usage}</div>
              <Tooltip title={inventory.notes}
                       sx={{
                         maxWidth: 300,
                       }}
                       arrow>
                <InfoIcon className="icon" />
              </Tooltip>
            </Card>
          ))}
        </section>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleNew}>Identify new</Button>
        <Button disabled={!selected} variant="contained" color="secondary" autoFocus onClick={handleAccept}>
          Add files(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventorySelectorDialog;
