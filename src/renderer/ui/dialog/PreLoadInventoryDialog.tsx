import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel, IconButton,
  ListItem,
  ListItemIcon,
  Paper,
  TextareaAutosize,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Alert from '@mui/material/Alert';
import { AutoSizer, List } from 'react-virtualized';
import { useSelector } from 'react-redux';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { inventoryService } from '@api/services/inventory.service';
import { InventorySourceType } from '@api/types';
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from 'react-i18next';

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
    margin: '0px',
  },
}));

interface IPreLoadInventoryDialog {
  open: boolean;
  folder: string;
  overwrite: boolean;
  onClose: (response: any) => void;
  onCancel: () => void;
}

export const PreLoadInventoryDialog = (props: IPreLoadInventoryDialog) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { open, folder, overwrite, onClose, onCancel } = props;

  const { isFilterActive } = useSelector(selectNavigationState);
  const { dependencies } = useSelector(selectWorkbench);
  const [inventories, setInventories] = useState<any[]>([]);
  const [checked, setChecked] = useState<any[]>([]);
  const [inventoryNoLicenseCount, setInventoryNoLicenseCount] = useState<number>(0);
  const [validInventories, setValidInventories] = useState<any[]>([]);

  const dependenciesInFolder = dependencies.filter((dependency) => dependency.startsWith(folder));

  const handleToggle = (value: any) => () => {
    const currentIndex = checked.findIndex(
      (x) =>
        x.purl === value.purl &&
        x.version === value.version &&
        x.spdxid === value.spdxid &&
        x.usage === value.usage &&
        value.spdxid !== null
    );
    const newChecked = [...checked];
    if (currentIndex === -1) newChecked.push(value);
    else newChecked.splice(currentIndex, 1);
    setChecked(newChecked);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const notes = new FormData(e.target).get('notes');
    onClose({ inventories: checked, notes });
  };

  const selectAll = () => {
    if (checked.length === validInventories?.length) {
      setChecked([]);
    } else setChecked(validInventories);
  };

  const AllChecked = () => {
    return checked.length === validInventories?.length && validInventories.length > 0;
  };

  const init = async () => {
    const response = await inventoryService.acceptAllPreLoadInventory({
      source: { type: InventorySourceType.PATH, input: folder },
      overwrite,
    });
    const inv = response.sort((a, b) => {
      if (a.spdxid === null) return 1;
      if (b.spdxid === null) return -1;
      if (a.purl > b.purl) return 1;
      if (a.purl < b.purl) return -1;
      return a.spdxid.localeCompare(b.spdxid);
    });
    const validInv = response.filter((el) => el.spdxid);
    setInventories(inv);
    setInventoryNoLicenseCount(inv.filter((x) => !x.spdxid).length);
    setChecked(validInv);
    setValidInventories(validInv);
  };

  const isValid = () => {
    return checked.length > 0;
  };

  useEffect(() => {
    if (open) init();
  }, [open]);

  return (
    <Dialog
      id="PreloadInventoryDialog"
      open={open}
      maxWidth="sm"
      scroll="body"
      fullWidth
      onClose={onCancel}
      className={`${classes.size} dialog`}
    >
      <header className="dialog-title">
        <span>{t('Title:AcceptAll')}</span>
        <IconButton aria-label="close" tabIndex={-1} onClick={onCancel} size="large">
          <CloseIcon />
        </IconButton>
      </header>

      <DialogContent>
        {isFilterActive && (
          <Alert className="mt-1 mb-1" severity="info">
            {t('ActionCurrentFilterCriteria')}
          </Alert>
        )}
        <FormControlLabel control={<Checkbox checked={AllChecked()} onClick={() => selectAll()} />} label="All" />
        <hr className="divider-no-license" />
        <div className="list-container">
          <AutoSizer style={{ width: '100%', height: '220px', border: 'transparent' }}>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                rowCount={inventories.length}
                rowHeight={40}
                rowRenderer={({ index, key, style, parent }) => {
                  const value = inventories[index];
                  return (
                    <ListItem
                      style={style}
                      onClick={value.spdxid ? handleToggle(value) : null}
                      disabled={!value.spdxid}
                      className={classes.listItem}
                      key={value.cvid + value.version + value.spdxid + value.purl + value.usage}
                    >
                      <ListItemIcon className="list-item">
                        <Checkbox
                          edge="start"
                          disabled={!value.spdxid}
                          checked={
                            value.spdxid === null
                              ? false
                              : checked.findIndex(
                                  (x) =>
                                    x.version === value.version &&
                                    x.purl === value.purl &&
                                    x.spdxid === value.spdxid &&
                                    x.usage === value.usage
                                ) !== -1
                          }
                          tabIndex={-1}
                          // inputProps={{ 'aria-labelledby': labelId }}
                        />
                        <div className="checkbox-info">
                          <div className="name-component">
                            <svg
                              width="25"
                              height="22"
                              viewBox="0 0 25 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18.3333 9.58203V4.30391C18.3333 3.60078 17.8973 2.97266 17.2364 2.72422L12.9239 1.10703C12.5442 0.961719 12.1223 0.961719 11.7379 1.10703L7.42544 2.72422C6.7645 2.97266 6.32856 3.60078 6.32856 4.30391V9.58203L1.43013 11.4242C0.769189 11.668 0.333252 12.3008 0.333252 13.0039V18.0008C0.333252 18.6383 0.694189 19.2242 1.26606 19.5101L5.88794 21.8211C6.36138 22.0602 6.92388 22.0602 7.39731 21.8211L12.3333 19.3555L17.2692 21.8211C17.7426 22.0602 18.3051 22.0602 18.7786 21.8211L23.4004 19.5101C23.9723 19.2242 24.3333 18.6383 24.3333 18.0008V13.0039C24.3333 12.3008 23.8973 11.6727 23.2364 11.4242L18.3333 9.58203ZM12.8958 11.2133V6.62422L17.2083 5.13828V9.71328L12.8958 11.2133ZM7.45825 3.91484L12.3333 2.08672L17.2083 3.91484V3.92422L12.3333 5.63984L7.45825 3.91953V3.91484ZM7.45825 5.13828L11.7708 6.62422V11.2133L7.45825 9.71328V5.13828ZM6.052 20.5789L1.5145 18.3102V13.9367L6.052 15.7789V20.5789ZM1.5145 12.6617V12.6523L6.64263 10.7305L11.7098 12.6289V12.6852L6.64263 14.743L1.5145 12.6617ZM7.23325 15.7789L11.7098 13.9602V18.343L7.23325 20.5836V15.7789ZM17.4333 20.5789L12.9567 18.343V13.9648L17.4333 15.7836V20.5789ZM23.152 18.3102L18.6145 20.5789V15.7789L23.152 13.9367V18.3102ZM23.152 12.6617L18.0239 14.743L12.9567 12.6852V12.6289L18.0239 10.7305L23.152 12.6523V12.6617Z"
                                fill={value.spdxid ? '#3B82F6' : '#7E7E7E'}
                              />
                            </svg>

                            <p className={value.spdxid ? 'list-item-text' : 'list-item-text-no-license'}>
                              {`${value.purl}`}
                            </p>
                          </div>
                          <div className="pills">
                            <div className={value.spdxid ? 'version-pill' : 'version-pill-no-license'}>
                              <p>{value.version.trim() === '' ? '-' : `${value.version}`.slice(0, 10)}</p>
                            </div>
                            {value.spdxid?.length > 10 ? (
                              <Tooltip title={value.spdxid}>
                                <div className="license-pill">
                                  <p>
                                    {value.spdxid?.trim() === '' || !value.spdxid
                                      ? '-'
                                      : `${value.spdxid?.slice(0, 10)}...`}
                                  </p>
                                </div>
                              </Tooltip>
                            ) : (
                              <div className="license-pill">
                                <p>{value.spdxid?.trim() === '' || !value.spdxid ? '-' : `${value.spdxid}`}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </ListItemIcon>
                    </ListItem>
                  );
                }}
              />
            )}
          </AutoSizer>
        </div>
        <div>
          <div className="info-box">
            {inventoryNoLicenseCount > 0 && (
              <>
                <hr className="divider-no-license" />
                <Alert severity="warning">
                  {t('NComponentWillNotIdentified', { count: inventoryNoLicenseCount })}.
                </Alert>
              </>
            )}
            {dependenciesInFolder.length > 0 && (
              <>
                <Alert severity="warning" className="mt-1 word-break">
                  {t('DependenciesDeclaredIdentifyManual')}
                </Alert>
              </>
            )}
          </div>
        </div>
        <hr className="divider" />
        <div className="dialog-form-field">
          <label className="dialog-form-field-label">
            {t('Title:Notes')} <span className="optional">- {t('Optional')}</span>
          </label>
          <Paper className="dialog-form-field-control">
            <TextareaAutosize name="notes" cols={30} minRows={6} />
          </Paper>
        </div>
        <form onSubmit={onSubmit}>
          <div className="button-container">
            <Button color="inherit" tabIndex={-1} onClick={onCancel}>{t('Button:Cancel')}</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
              {t('Button:Identify')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PreLoadInventoryDialog;
