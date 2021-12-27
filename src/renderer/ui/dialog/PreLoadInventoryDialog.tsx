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
  listItem: {
    padding: '0px',
    margin: '24px 0px',
    height: '25px',
  },
  icon: {
    minWidth: '0px !important',
  }
}));

interface IPreLoadInventoryDialog {
  open: boolean;
  folder: string;
  overwrite: boolean;
  onClose: (response: any) => void;
  onCancel: () => void;
}

export const PreLoadInventoryDialog = (props: IPreLoadInventoryDialog) => {
  const { open, folder, overwrite, onClose, onCancel } = props;
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
    const inv = await inventoryService.acceptAllPreLoadInventory({ folder, overwrite });
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
              <FormControlLabel control={<Checkbox checked={AllChecked()} onClick={() => selectAll()} />} label="All" />
              <hr className='divider' />
              <div className='scroll-list'>
              {inventories.map((value) => {
                const labelId = `checkbox-list-label-${value.cvid}`;
                return (
                  <ListItem className={classes.listItem} key={value}>
                    <ListItemIcon className={classes.icon} role={undefined} onClick={handleToggle(value)}>
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
                        className={classes.icon}
                      />
                    </ListItemIcon>
                    <div className='checkbox-info'>
                      <div className='name-component'>
                      <svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.3333 9.58203V4.30391C18.3333 3.60078 17.8973 2.97266 17.2364 2.72422L12.9239 1.10703C12.5442 0.961719 12.1223 0.961719 11.7379 1.10703L7.42544 2.72422C6.7645 2.97266 6.32856 3.60078 6.32856 4.30391V9.58203L1.43013 11.4242C0.769189 11.668 0.333252 12.3008 0.333252 13.0039V18.0008C0.333252 18.6383 0.694189 19.2242 1.26606 19.5101L5.88794 21.8211C6.36138 22.0602 6.92388 22.0602 7.39731 21.8211L12.3333 19.3555L17.2692 21.8211C17.7426 22.0602 18.3051 22.0602 18.7786 21.8211L23.4004 19.5101C23.9723 19.2242 24.3333 18.6383 24.3333 18.0008V13.0039C24.3333 12.3008 23.8973 11.6727 23.2364 11.4242L18.3333 9.58203ZM12.8958 11.2133V6.62422L17.2083 5.13828V9.71328L12.8958 11.2133ZM7.45825 3.91484L12.3333 2.08672L17.2083 3.91484V3.92422L12.3333 5.63984L7.45825 3.91953V3.91484ZM7.45825 5.13828L11.7708 6.62422V11.2133L7.45825 9.71328V5.13828ZM6.052 20.5789L1.5145 18.3102V13.9367L6.052 15.7789V20.5789ZM1.5145 12.6617V12.6523L6.64263 10.7305L11.7098 12.6289V12.6852L6.64263 14.743L1.5145 12.6617ZM7.23325 15.7789L11.7098 13.9602V18.343L7.23325 20.5836V15.7789ZM17.4333 20.5789L12.9567 18.343V13.9648L17.4333 15.7836V20.5789ZM23.152 18.3102L18.6145 20.5789V15.7789L23.152 13.9367V18.3102ZM23.152 12.6617L18.0239 14.743L12.9567 12.6852V12.6289L18.0239 10.7305L23.152 12.6523V12.6617Z" fill="#3B82F6"/>
                      </svg>
                      <p className='list-item-text'>{`${value.purl}`}</p>
                      </div>
                      <div className='pills'>
                        <div className='version-pill'>
                          <p>{`${value.version}`.slice(0, 10).trim()}</p>
                        </div>
                        <div className='license-pill'>
                          <p>{`${value.spdxid}`.slice(0, 10).trim()}</p>
                        </div>
                      </div>
                    </div>
                  </ListItem>
                );
              })}
              </div>
            </List>
          </div>
            <hr className='divider' />
          <div>
            <label className="dialog-form-field-label">
              Notes <span className="optional">(Optional)</span>
            </label>
            <div className="dialog-form-field-control">
              <textarea placeholder="Example" name="notes" value={notes || ''} cols={30} rows={5} onChange={(e) => inputHandler(e)} />
            </div>
          </div>
          <div className='button-container'>
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
