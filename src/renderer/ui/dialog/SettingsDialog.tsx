import { Button, Dialog, DialogActions, IconButton, InputBase, makeStyles, Paper } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
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
}));

interface SettingDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const SettingDialog = ({ open, onClose, onCancel }: SettingDialogProps) => {
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [urls, setUrls] = useState([]);
  const [sbomLedgerToken, setSbomLedgerToken] = useState(null);

  const classes = useStyles();

  const submit = async () => {
    const config: Partial<IWorkspaceCfg> = {
      TOKEN: null,
      DEFAULT_API_INDEX: -1,
      APIS: [],
      // APIS: selectedUrl ? urls.findIndex(({ url }) => url === selectedUrl.url) : -1,
      // AVAILABLE_URL_API: urls.map(({ url }) => url),
      // TOKEN: sbomLedgerToken || null,
    };

    await userSettingService.set(config);
    onClose({ action: DIALOG_ACTIONS.OK });
  };

  const setDefault = (config: Partial<IWorkspaceCfg>) => {
    const { DEFAULT_API_INDEX, APIS, TOKEN } = config;

    const urlsDefault = APIS ? APIS.map((url) => ({ url })) : [];
    const selectedUrlDefault = APIS && APIS[DEFAULT_API_INDEX] ? { url: APIS[DEFAULT_API_INDEX] } : null;

    setSbomLedgerToken(TOKEN);
    setUrls(urlsDefault);
    setSelectedUrl(selectedUrlDefault);
  };

  const fetchConfig = async () => {
    const config = await userSettingService.get();
    setDefault(config || {});
  };

  const handleClose = (e) => {
    e.preventDefault();
    submit();
  };

  const handleOnChange = (event, newValue) => {
    if (typeof newValue === 'string') {
      setSelectedUrl({
        url: newValue,
      });
    } else if (newValue && newValue.new) {
      const value = {
        url: newValue.inputValue,
      };
      setSelectedUrl(value);
      setUrls([...urls, value]);
    } else {
      setSelectedUrl(newValue);
    }
  };

  const handleTrash = (e, option) => {
    e.stopPropagation();
    setUrls(urls.filter((url) => url.url !== option.url));
    if (selectedUrl && option.url === selectedUrl.url) {
      setSelectedUrl(null);
    }
  };

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  return (
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
            <label className="dialog-form-field-label">
              Knowledgebase API <span className="optional">- Optional</span>
            </label>
            <Paper>
              <Autocomplete
                value={selectedUrl}
                className={classes.search}
                onChange={handleOnChange}
                onKeyPress={(e: any) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const { value } = e.target;
                    const isExisting = urls.some((option) => value === option.url);
                    if (!isExisting) {
                      handleOnChange(e, { new: true, inputValue: value });
                    } else {
                      setSelectedUrl({ url: value });
                    }
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);

                  const { inputValue } = params;
                  // Suggest the creation of a new value
                  const isExisting = options.some((option) => inputValue === option.url);
                  if (inputValue !== '' && !isExisting) {
                    filtered.push({
                      inputValue,
                      new: true,
                      url: `Click or enter to add "${inputValue}"`,
                    });
                  }

                  return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                options={urls}
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
                  return option.url;
                }}
                renderOption={(option, props) =>
                  option.new ? (
                    <li {...props} className={classes.new}>
                      {option.url}
                    </li>
                  ) : (
                    <li {...props} className="w-100 d-flex space-between align-center">
                      {option.url}
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
  );
};

export default SettingDialog;
