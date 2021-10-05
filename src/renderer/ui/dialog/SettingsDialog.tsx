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
  const [value, setValue] = useState(null);

  const [urls, setUrls] = useState([{url: 'www.facebook.com'}, {url: 'www.google.com'},
  {url: 'www.amazon.com'},
  {url: 'www.twitter.com'},
  {url: 'www.reddit.com'},
  {url: 'www.taringa.com'},]);

  const classes = useStyles();

  useEffect(() => {
    // if (open) {
    //   //do something
    //   console.log('open is', open);
    // }
    console.log(value);
  }, [value]);

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
                value={value}
                className={classes.search}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    setValue({
                      url: newValue,
                    });
                  } else if (newValue && newValue.inputValue) {
                    // Create a new value from the user input
                    setValue({
                      url: newValue.inputValue,
                    });
                    setUrls([...urls, {
                      url: newValue.inputValue,
                    }])
                  } else {
                    setValue(newValue);
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
                // value={form?.url}
                // onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
        </div>
        <DialogActions>
          <Button>Back</Button>
          <Button type="submit" variant="contained" color="secondary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SettingDialog;
