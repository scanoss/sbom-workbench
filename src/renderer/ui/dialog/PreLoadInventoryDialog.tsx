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
  Paper,
  FormControlLabel,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { inventoryService } from '../../../api/inventory-service';
import componentDefault from '../../../../assets/imgs/component-default.svg';



// or


const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '700px',
    },
  },
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
  checkbox: {
    padding: '0px',
  },
  listItem: {
    padding: '0px',
    margin: '0px',
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
  const classes = useStyles();

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
    const inv = await inventoryService.acceptAllPreLoadInventory(path);
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
      <Dialog open={open} maxWidth="sm" scroll="body" fullWidth onClose={onCancel} className={`${classes.size} dialog`}>
        <span className="dialog-title">Accept all</span>
        <DialogContent>
          <div>
            <List>
              <FormControlLabel control={<Checkbox className={classes.checkbox} checked={AllChecked()} onClick={() => selectAll()} />} label="All" />
              {inventories.map((value) => {
                const labelId = `checkbox-list-label-${value.cvid}`;
                return (
                  <ListItem className={classes.listItem} key={value}>
                    <ListItemIcon role={undefined} onClick={handleToggle(value)}>
                      <Checkbox
                        className={classes.checkbox}
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
                    <div className='checkbox-info'>
                      <img alt="component logo" className="list-item-icon" src={componentDefault} />
                      <p className='list-item-text'>{`${value.purl}`}</p>
                      <div className='pills'>
                        <div className='version-pill'>
                          <p>{`${value.version}`}</p>
                        </div>
                        <div className='license-pill'>
                          <p>{`${value.spdxid}`}</p>
                        </div>
                      </div>
                    </div>
                  </ListItem>
                );
              })}
            </List>
          </div>
          <div>
            <label className="dialog-form-field-label">
              Notes <span className="optional">- Optional</span>
            </label>
            <div className="dialog-form-field-control">
              <textarea name="notes" value={notes || ''} cols={30} rows={8} onChange={(e) => inputHandler(e)} />
            </div>
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
