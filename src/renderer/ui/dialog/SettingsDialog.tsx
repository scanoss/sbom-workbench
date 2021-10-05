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
  
  const [indexSelectedUrl, setIndexSelectedUrl] = useState(0);
  const [sbomLedger, setSbomLedger] = useState(null); 


  const [urls, setUrls] = useState([]);

  const classes = useStyles();

  const submit = () => {
    const config:Partial<IWorkspaceCfg> = {
      DEFAULT_URL_API: urls.findIndex(url => url.url === indexSelectedUrl.url) || null,
      AVAILABLE_URL_API: urls.map((url) => url.url) || null,
      TOKEN: sbomLedger || null,
    }
    console.log(config);

  }


 const setDefault = (partialWorkspaceCfg) => {
    console.log(partialWorkspaceCfg);
    setIndexSelectedUrl(partialWorkspaceCfg.DEFAULT_URL_API);
    setSbomLedger(partialWorkspaceCfg.TOKEN);
    const {AVAILABLE_URL_API, DEFAULT_URL_API} = partialWorkspaceCfg;
    const newArray = AVAILABLE_URL_API.map((str: string) => ({url: str}));
    setUrls(newArray);
    console.log(newArray);
  }

  useEffect(() => {
    if (open) {
      //do something
      // consultar servicio
      const config:Partial<IWorkspaceCfg> = {
        DEFAULT_URL_API: 5,
        AVAILABLE_URL_API: ['www.cancu0.com', 'www.cancu1.com', 'www.cancu2.com', 'www.cancu3.com', 'www.cancu4.com', 'www.cancu5.com', 'www.cancu6.com', 'www.cancu7.com'],
        TOKEN: 'lkjdfasnda',
      }
      setDefault(config)
    }
  }, [open]);

  useEffect(() => {
    console.log(sbomLedger);
    console.log(indexSelectedUrl);
  }, [sbomLedger, indexSelectedUrl])

  const handleClose = async (e) => {
    e.preventDefault();
    console.log('opened');
  };

  return (
    <Dialog
      id="LicenseDialog"
      maxWidth="md"
      scroll="body"
      className={`${classes.size} dialog`}
      fullWidth
      open={open}
    >
      <span className="dialog-title">Settings</span>
      <form onSubmit={handleClose}>
        <div className="dialog-content">
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">API Connections</label>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">Knowledgebase API</label>
            <Paper> 
              <Autocomplete
                value={urls[indexSelectedUrl]}
                className={classes.search}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    setIndexSelectedUrl({
                      url: newValue,
                    });
                  } else if (newValue && newValue.inputValue) {
                    // Create a new value from the user input
                    setIndexSelectedUrl({
                      url: newValue.inputValue,
                    });
                    setUrls([...urls, {
                      url: newValue.inputValue,
                    }])
                  } else {
                    setIndexSelectedUrl(newValue);
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);

                  const { inputValue } = params;
                  // Suggest the creation of a new value
                  const isExisting = options.some(
                    (option) => inputValue === option.url
                  );
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
                id="free-solo-with-text-demo"
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
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">SBOM Ledger API</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="url"
                fullWidth
                value={sbomLedger}
                onChange={(e) => setSbomLedger(e.target.value)}
                required
              />
            </Paper>
          </div>
        </div>
        <DialogActions>
          <Button onClick={onCancel}>Back</Button>
          <Button type="submit" variant="contained" color="secondary" >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SettingDialog;
