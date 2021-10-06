import {
  Button,
  Dialog,
  DialogActions,
  InputBase,
  makeStyles,
  Paper,
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import React, { useEffect, useState } from 'react';
import { DialogResponse, DIALOG_ACTIONS } from '../../context/types';
import { IWorkspaceCfg } from '../../../api/types';
import { workspaceService } from '../../../api/workspace-service';

const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '500px',
    },
  },
  search: {
    padding: '0px 15px',
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
      DEFAULT_URL_API: selectedUrl ? urls.findIndex(({ url }) => url === selectedUrl.url) : -1,
      AVAILABLE_URL_API: urls.map(({ url }) => url),
      TOKEN: sbomLedgerToken || null,
    };

    await workspaceService.setWSConfig(config);
    onClose({ action: DIALOG_ACTIONS.OK });
  };

  const setDefault = (config: Partial<IWorkspaceCfg>) => {
    const { DEFAULT_URL_API, AVAILABLE_URL_API, TOKEN } = config;

    const urlsDefault = AVAILABLE_URL_API ? AVAILABLE_URL_API.map((url) => ({ url })) : [];
    const selectedUrlDefault = AVAILABLE_URL_API ? { url: AVAILABLE_URL_API[DEFAULT_URL_API] } : null;

    setSbomLedgerToken(TOKEN);
    setUrls(urlsDefault);
    setSelectedUrl(selectedUrlDefault);
  };

  const fetchConfig = async () => {
    const config = await workspaceService.getWSConfig();
    console.log('config', config);
    setDefault(config || {});
  };

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const handleClose = async (e) => {
    e.preventDefault();
    submit();
  };

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
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    setSelectedUrl({
                      url: newValue,
                    });
                  } else if (newValue && newValue.inputValue) {
                    // Create a new value from the user input
                    setSelectedUrl({
                      url: newValue.inputValue,
                    });
                    setUrls([
                      ...urls,
                      {
                        url: newValue.inputValue,
                      },
                    ]);
                  } else {
                    setSelectedUrl(newValue);
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
                      url: `Add "${inputValue}"`,
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
                renderOption={(option, props) => <li {...props}>{option.url}</li>}
                // freeSolo
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
