import {
  Dialog,
  ListItem,
  Checkbox,
  ListItemText,
  DialogContent,
  List,
  makeStyles,
  ListItemIcon,
  Button,
  TextareaAutosize,
  Paper,
  FormControlLabel,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { inventoryService } from '../../../api/inventory-service';

// or

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: 800,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  content: {
    backgroundColor: 'white !important',
  },
  text: {
    width: '90%',
    fontSize: '20px',
    color: '#27272A !important',
    whiteSpace: 'pre-line',
  },
  actions: {
    padding: theme.spacing(2),
    borderTop: '1px solid #D4D4D8',
    backgroundColor: '#f4f4f5',
  },
}));

interface IPreLoadInventoryDialog {
  open: boolean;
  path: string;
  onClose: (response: any) => void;
  onCancel: () => void;
}

export const PreLoadInventoryDialog = (props: IPreLoadInventoryDialog) => {
  const { open, path, onClose, onCancel } = props;

  const [inventories, setInventories] = useState<any[]>([]);

  const [checked, setChecked] = useState<any[]>([]);

  const [notes, setNotes] = useState<string>('');

  const handleToggle = (value: any) => () => {
    const currentIndex = checked.findIndex(
      (x) =>
        x.purl === value.purl && x.version === value.version && x.spdxid === value.spdxid && x.usage === value.usage
    );
    const newChecked = [...checked];
    if (currentIndex === -1) newChecked.push(value);
    else newChecked.splice(currentIndex, 1);

    setChecked(newChecked);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    onClose({ inventories: checked, notes });
  };

  const inputHandler = (e) => {
    setNotes(e.target.value);
  };

  const selectAll = () => {
    if (checked.length === inventories.length) {
      setChecked([]);
    } else setChecked(inventories);
  };

  const AllChecked = () => {
    return checked.length === inventories.length;
  };

  const init = async () => {
    // TO DO add overwrite property
    const inv = await inventoryService.acceptAllPreLoadInventory({ folder: path });
    setInventories(inv);
    setChecked(inv);
  };

  const isValid = () => {
    return checked.length > 0;
  };

  useEffect(() => {
    if (open) init();
    else {
      setInventories([]);
      setChecked([]);
      setNotes('');
    }
  }, [open]);

  return (
    <div>
      <Dialog open={open} maxWidth="sm" scroll="body" fullWidth onClose={onCancel}>
        <span className="dialog-title">Accept all</span>
        <DialogContent>
          <div>
            <List>
              <FormControlLabel control={<Checkbox checked={AllChecked()} onClick={() => selectAll()} />} label="All" />
              {inventories.map((value) => {
                const labelId = `checkbox-list-label-${value.cvid}`;
                return (
                  <ListItem key={value}>
                    <ListItemIcon role={undefined} onClick={handleToggle(value)}>
                      <Checkbox
                        edge="start"
                        checked={
                          checked.findIndex(
                            (x) =>
                              x.version === value.version &&
                              x.purl === value.purl &&
                              x.spdxid === value.spdxid &&
                              x.usage === value.usage
                          ) !== -1
                        }
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      id={labelId}
                      primary={`Component: ${value.purl} Version: ${value.version} License:${value.spdxid}  `}
                    />
                  </ListItem>
                );
              })}
            </List>
          </div>
          <div>
            <label className="dialog-form-field-label">
              Notes <span className="optional">- Optional</span>
            </label>
            <Paper className="dialog-form-field-control">
              <TextareaAutosize name="notes" value={notes || ''} cols={30} rows={8} onChange={(e) => inputHandler(e)} />
            </Paper>
          </div>
          <div>
            <form onSubmit={onSubmit}>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
                {' '}
                Identify{' '}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreLoadInventoryDialog;
