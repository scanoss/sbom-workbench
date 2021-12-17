import {
  Dialog,
  ListItem,
  Checkbox,
  ListItemText,
  Avatar,
  ListItemAvatar,
  DialogContent,
  List,
  makeStyles,
  ListItemIcon,
  Button,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { DIALOG_ACTIONS, DialogResponse } from '../../context/types';
import { inventoryService } from '../../../api/inventory-service';
import { Inventory } from '../../../api/types';
import { check } from 'prettier';

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
}

export const PreLoadInventoryDialog = (props: IPreLoadInventoryDialog) => {
  const { open, path, onClose } = props;

  const [inventories, setInventories] = useState<any[]>([]);

  const [checked, setChecked] = useState<any[]>([]);

  const handleToggle = (value: any) => () => {
    const currentIndex = checked.findIndex(
      (x) => x.purl === value.purl && x.version === value.version && x.spdxid === value.spdxid && x.usage === value.usage
    );
    const newChecked = [...checked];
    if (currentIndex === -1) newChecked.push(value);
    else newChecked.splice(currentIndex, 1);

    setChecked(newChecked);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    onClose(checked);
  };

  const init = async () => {
    const inv = await inventoryService.acceptAllPreLoadInventory(path);
    console.log("INVENTORIES RESPONSE", inv);
    setInventories(inv);
  };

  useEffect(() => {
    if (open) {
      init();
    }
  }, [open]);

  return (
    <div>
      <Dialog open={open} maxWidth="sm" scroll="body" fullWidth>
        <DialogContent>
          <div>
            <List>
              {inventories.map((value) => {
                const labelId = `checkbox-list-label-${value.cvid}`;

                return (
                  <ListItem key={value}>
                    {/* <ListItemButton > */}
                    <ListItemIcon role={undefined} onClick={handleToggle(value)}>
                      <Checkbox
                        edge="start"
                        checked={
                          checked.findIndex(
                            (x) => x.version === value.version && x.purl === value.purl && x.spdxid === value.spdxid && x.usage === value.usage
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
                    {/* </ListItemButton> */}
                  </ListItem>
                );
              })}
            </List>
          </div>
          <div>
            <form onSubmit={onSubmit}>
              <Button type="submit">Submit</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreLoadInventoryDialog;
