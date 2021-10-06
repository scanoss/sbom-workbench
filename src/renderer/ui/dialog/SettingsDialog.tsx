import {
  Button,
  Dialog,
  DialogActions,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  TextareaAutosize,
  Tooltip,
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete';
import AddIcon from '@material-ui/icons/Add';
import React, { useEffect, useState } from 'react';
import { DialogResponse } from '../../context/types';
import { IWorkspaceCfg } from '../../../api/types';

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

  const submit = () => {
    const config: Partial<IWorkspaceCfg> = {
      DEFAULT_URL_API: urls.findIndex(({ url }) => url === selectedUrl.url),
      AVAILABLE_URL_API: urls.map(({ url }) => url),
      TOKEN: sbomLedgerToken,
    };
    console.log(config);
  };

  const setDefault = (config: Partial<IWorkspaceCfg>) => {
    setSelectedUrl({url: config.AVAILABLE_URL_API[config.DEFAULT_URL_API]});
    setSbomLedgerToken(config.TOKEN);
    setUrls(config.AVAILABLE_URL_API.map((url) => ({ url })));
  };

  useEffect(() => {
    if (open) {
      // consultar servicio
      const config:Partial<IWorkspaceCfg> = {
        DEFAULT_URL_API: 5,
        AVAILABLE_URL_API: ['www.cancu0.com', 'www.cancu1.com', 'www.cancu2.com', 'www.cancu3.com', 'www.cancu4.com', 'www.cancu5.com', 'www.cancu6.com', 'www.cancu7.com'],
        TOKEN: 'lkjdfasnda',
      }
      setDefault(config)
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
            <label className="dialog-form-field-label"><b>API Connections</b></label>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">Knowledgebase API</label>
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
                    setUrls([...urls, {
                      url: newValue.inputValue,
                    }])
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
                renderInput={(params) => <TextField {...params}
                InputProps={{...params.InputProps, disableUnderline: true}} />}
              />
            </Paper>
            <p className="dialog-form-field-hint">
              This value is optional for dedicated SCANOSS server instances. When this value is empty, scans will
              be launched against our free of charge public service. If you are interested in a dedicated instance with
              guaranteed availability and throughput please contact us at sales@scanoss.com.
            </p>
          </div>
          <div className="dialog-form-field mt-3">
            <label className="dialog-form-field-label">SBOM Ledger Token</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="url"
                fullWidth
                value={sbomLedgerToken}
                onChange={(e) => setSbomLedgerToken(e.target.value)}
                required
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
