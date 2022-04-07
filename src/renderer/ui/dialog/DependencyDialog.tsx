/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/label-has-associated-control */

import {
  Dialog,
  Tooltip,
  Paper,
  DialogActions,
  Button,
  makeStyles,
  InputBase,
  TextField,
  IconButton,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import { Autocomplete } from '@material-ui/lab';
import { Dependency } from '../../../api/types';
import { DialogResponse, DIALOG_ACTIONS } from '../../context/types';
import { ResponseStatus } from '../../../api/Response';
import { licenseService } from '../../../api/services/license.service';
import { DialogContext } from '../../context/DialogProvider';
import { NewDependencyDTO } from '../../../api/dto';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '500px',
    },
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '2fr 0.7fr',
    gridGap: '20px',
  },
  search: {
    padding: '10px 0px 10px 10px',
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

interface DependencyDialogProps {
  open: boolean;
  dependency: Partial<Dependency>;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const DependencyDialog = (props: DependencyDialogProps) => {
  const classes = useStyles();
  const dialogCtrl = useContext<any>(DialogContext);

  const { open, dependency, onClose, onCancel } = props;
  const [form, setForm] = useState<Partial<NewDependencyDTO>>({});
  const [licenses, setLicenses] = useState<any[]>();

  const setDefaults = () => {
    if (!dependency) return;

    setForm({
      dependencyId: dependency.dependencyId,
      purl: dependency.purl,
      version: dependency.version,
      license: dependency.licenses && dependency.licenses[0],
    });
  };

  const init = async () => {
    if (open) {
      const { data } = await licenseService.getAll();
      setLicenses(data);
    }
  };

  useEffect(() => init(), [open]);
  useEffect(() => setDefaults(), [dependency]);

  const inputHandler = (name, value) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleClose = async (e) => {
    e.preventDefault();
    onClose({ action: DIALOG_ACTIONS.OK, data: form });
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate();
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([...licenses, response.data]);
      setForm({ ...form, license: response.data.spdxid });
    }
  };

  const isValid = () => {
    const { dependencyId, purl, license, version } = form;
    return license && purl && dependencyId && version;
  };

  return (
    <Dialog
      id="DependencyDialog"
      className={`${classes.size} dialog`}
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <span className="dialog-title">
        Accept <b>{decodeURIComponent(dependency.component?.name || dependency.componentName || dependency.purl)}</b>
      </span>

      <form onSubmit={handleClose}>
        <div className="dialog-content">
          <div className="dialog-form-field">
            <div className="dialog-form-field-label">
              <label>License</label>
              <Tooltip title="Add new license">
                <IconButton color="inherit" size="small" onClick={openLicenseDialog}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </div>
            <Paper className="dialog-form-field-control">
              <SearchIcon className={classes.search} />
              <Autocomplete
                fullWidth
                options={licenses || []}
                groupBy={(option) => option?.type}
                value={
                  licenses && form.license
                    ? { spdxid: form.license, name: licenses.find((item) => item.spdxid === form.license)?.name }
                    : ''
                }
                getOptionSelected={(option: any) => option.spdxid === form.license}
                getOptionLabel={(option: any) => option.name || option.spdxid}
                renderOption={(option: any) => (
                  <div className={classes.option}>
                    <span>{option.name}</span>
                    <span className="middle">{option.spdxid}</span>
                  </div>
                )}
                filterOptions={(options, params) => {
                  return options.filter(
                    (option) =>
                      option.name.toLowerCase().includes(params.inputValue.toLowerCase()) ||
                      option.spdxid.toLowerCase().includes(params.inputValue.toLowerCase())
                  );
                }}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      className: 'autocomplete-option',
                    }}
                  />
                )}
                onChange={(e, { spdxid }) => setForm({ ...form, license: spdxid })}
              />
            </Paper>
          </div>

          <div className="dialog-form-field d-flex flex-column space-between">
            <label className="dialog-form-field-label">Version</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="version"
                fullWidth
                value={form.version || ''}
                placeholder="Version"
                onChange={(e) => inputHandler(e.target.name, e.target.value)}
                required
              />
            </Paper>
          </div>
        </div>

        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            Accept
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DependencyDialog;
