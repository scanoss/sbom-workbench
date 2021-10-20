import { Button, Dialog, DialogActions, IconButton, InputBase, makeStyles, Paper, Tooltip } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import React, { useEffect, useState } from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import { DialogResponse, DIALOG_ACTIONS } from '../../context/types';
import { IWorkspaceCfg } from '../../../api/types';
import { userSettingService } from '../../../api/userSetting-service';

const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '600px',
    },
  },
  search: {
    padding: '0px 15px',
  },
  new: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: theme.palette.primary.light,
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
    '& span.middle': {
      fontSize: '0.8rem',
      color: '#6c6c6e',
    },
  },
}));

interface NewEndpointDialogProps {
  open: boolean;
  defaultData: any;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const NewEndpointDialog = (props: NewEndpointDialogProps) => {
  const { open, onClose, onCancel, defaultData } = props;

  const initial = {
    URL: '',
    API_KEY: '',
    DESCRIPTION: '',
  };
  const [data, setData] = useState<any>(initial);

  const isValid = () => {
    return data.URL.trim().length > 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (isValid()) {
      onClose({ action: DIALOG_ACTIONS.OK, data });
    }
  };

  const setDefaults = () => {
    setData(defaultData || initial);
  };

  useEffect(setDefaults, [open]);

  return (
    <Dialog id="NewEndpointDialog" maxWidth="xs" fullWidth className="dialog" open={open} onClose={onCancel}>
      <form onSubmit={onSubmit}>
        <div className="dialog-content">
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">API URL</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="url"
                fullWidth
                value={data.URL}
                onChange={(e) => setData({ ...data, URL: e.target.value })}
                required
                autoFocus
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">
              API KEY <span className="optional">- Optional</span>
            </label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="apikey"
                fullWidth
                value={data.API_KEY}
                onChange={(e) => setData({ ...data, API_KEY: e.target.value })}
              />
            </Paper>
          </div>
        </div>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface SettingDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const SettingDialog = ({ open, onClose, onCancel }: SettingDialogProps) => {
  const [selectedApi, setSelectedApi] = useState(null);
  const [apis, setApis] = useState([]);
  const [sbomLedgerToken, setSbomLedgerToken] = useState(null);
  const [apiDialog, setApiDialog] = useState({
    open: false,
    data: null,
  });

  const classes = useStyles();

  const submit = async () => {
    const config: Partial<IWorkspaceCfg> = {
      DEFAULT_API_INDEX: selectedApi ? apis.findIndex((api) => api === selectedApi) : -1,
      APIS: apis,
      TOKEN: sbomLedgerToken || null,
    };

    await userSettingService.set(config);
    onClose({ action: DIALOG_ACTIONS.OK });
  };

  const setDefault = (config: Partial<IWorkspaceCfg>) => {
    const { DEFAULT_API_INDEX, APIS, TOKEN } = config;

    const urlsDefault = APIS || [];
    const selectedUrlDefault = APIS && APIS[DEFAULT_API_INDEX] ? APIS[DEFAULT_API_INDEX] : null;

    setSbomLedgerToken(TOKEN);
    setApis(urlsDefault);
    setSelectedApi(selectedUrlDefault);
  };

  const fetchConfig = async () => {
    const config = await userSettingService.get();
    setDefault(config || {});
  };

  const onNewEndpointHandler = () => {
    setApiDialog({ ...apiDialog, open: true, data: null });
  };

  const onCloseDialogHandler = (response: DialogResponse) => {
    setApiDialog({ ...apiDialog, open: false });
    setSelectedApi(response.data);
    setApis([...apis, response.data]);
  };

  const handleClose = (e) => {
    e.preventDefault();
    submit();
  };

  const handleOnChange = (event, newValue) => {
    if (typeof newValue === 'string') {
      setSelectedApi({
        url: newValue,
      });
    } else if (newValue && newValue.new) {
      const value = {
        URL: newValue.inputValue,
        API_KEY: '',
      };
      setApiDialog({ ...apiDialog, open: true, data: value });
    } else {
      setSelectedApi(newValue);
    }
  };

  const handleTrash = (e, option) => {
    e.stopPropagation();
    setApis(apis.filter((url) => url !== option));
    if (selectedApi && option.url === selectedApi.url) {
      setSelectedApi(null);
    }
  };

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  return (
    <>
      <Dialog
        id="SettingsDialog"
        maxWidth="md"
        scroll="body"
        className={`${classes.size} dialog`}
        fullWidth
        open={open}
        onClose={onCancel}
      >
        <span className="dialog-title">Settings</span>
        <form onSubmit={handleClose}>
          <div className="dialog-content">
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">
                <b>API Connections</b>
              </label>
            </div>
            <div className="dialog-form-field">
              <div className="dialog-form-field-label">
                <label>Knowledgebase API</label>
                <Tooltip title="Add new endpoint" onClick={onNewEndpointHandler}>
                  <IconButton color="inherit" size="small">
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </div>
              <Paper>
                <Autocomplete
                  value={selectedApi}
                  className={classes.search}
                  onChange={handleOnChange}
                  onKeyPress={(e: any) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const { value } = e.target;
                      const isExisting = apis.some((option) => value === option.URL);
                      if (!isExisting) {
                        handleOnChange(e, { new: true, inputValue: value });
                      } else {
                        setSelectedApi({ URL: value });
                      }
                    }
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    const { inputValue } = params;
                    // Suggest the creation of a new value
                    const isExisting = options.some((option) => inputValue === option.URL);
                    if (inputValue !== '' && !isExisting) {
                      filtered.push({
                        inputValue,
                        new: true,
                        URL: `Click or enter to add "${inputValue}"`,
                      });
                    }

                    return filtered;
                  }}
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  options={apis}
                  getOptionLabel={(option) => {
                    // Value selected with enter, right from the input
                    if (typeof option === 'string') {
                      return option;
                    }
                    // Add "xxx" option created dynamically
                    if (option.inputValue) {
                      return option.inputValue;
                    }
                    // Regular option
                    return `${option.URL} ${option.API_KEY ? `(${option.API_KEY})` : ''}`;
                  }}
                  renderOption={(option, props) =>
                    option.new ? (
                      <li {...props} className={classes.new}>
                        {option.URL}
                      </li>
                    ) : (
                      <li {...props} className="w-100 d-flex space-between align-center">
                        <div className={classes.option}>
                          <span>{option.URL}</span>
                          {option.API_KEY && <span className="middle">API KEY: {option.API_KEY}</span>}
                        </div>
                        <IconButton
                          size="small"
                          aria-label="delete"
                          className="btn-delete"
                          onClick={(e) => handleTrash(e, option)}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </li>
                    )
                  }
                  renderInput={(params) => (
                    <TextField {...params} InputProps={{ ...params.InputProps, disableUnderline: true }} />
                  )}
                />
              </Paper>
              <p className="dialog-form-field-hint">
                This value is optional for dedicated SCANOSS server instances. When this value is empty, scans will be
                launched against our free of charge public service. If you are interested in a dedicated instance with
                guaranteed availability and throughput please contact us at sales@scanoss.com.
              </p>
            </div>
            <div className="dialog-form-field mt-7">
              <label className="dialog-form-field-label">
                SBOM Ledger Token <span className="optional">- Optional</span>
              </label>
              <Paper className="dialog-form-field-control">
                <InputBase
                  name="url"
                  fullWidth
                  value={sbomLedgerToken}
                  onChange={(e) => setSbomLedgerToken(e.target.value)}
                />
              </Paper>
            </div>
          </div>
          <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <NewEndpointDialog
        open={apiDialog.open}
        defaultData={apiDialog.data}
        onCancel={() => setApiDialog({ ...apiDialog, open: false })}
        onClose={(e) => onCloseDialogHandler(e)}
      />
    </>
  );
};

export default SettingDialog;
