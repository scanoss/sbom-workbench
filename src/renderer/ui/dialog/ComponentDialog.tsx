/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useContext, useEffect, useState } from 'react';
import { Dialog, Tooltip, Paper, DialogActions, Button, InputBase, TextField, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import { NewComponentDTO } from '@api/types';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { ResponseStatus } from '@api/Response';
import { componentService } from '@api/services/component.service';
import { licenseService } from '@api/services/license.service';
import { DialogContext } from '@context/DialogProvider';
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '500px',
    },
  },
  componentVersion: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 0.75fr',
    gridGap: '20px',
  },
}));

interface ComponentDialogProps {
  open: boolean;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
  component: Partial<NewComponentDTO>;
  label: string;
}

export const ComponentDialog = (props: ComponentDialogProps) => {
  const classes = useStyles();
  const { open, onClose, onCancel, component, label } = props;
  const [form, setForm] = useState<
    Partial<{
      name: string;
      version;
      licenseId: number;
      purl: string;
      url: string;
    }>
  >({});
  const dialogCtrl = useContext<any>(DialogContext);
  const [licenses, setLicenses] = useState<any[]>();
  const [readOnly, setReadOnly] = useState<boolean>();

  const setDefaults = () => {
    setForm(component);
    setReadOnly(!!component.name);
  };

  const fetchData = async () => {
    if (open) {
      const data = await licenseService.getAll();
      setLicenses(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [open]);
  useEffect(setDefaults, [component]);

  const inputHandler = (name, value) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleClose = async (e) => {
    e.preventDefault();
    try {
      const { name, version, licenseId, purl, url } = form;
      const dto: NewComponentDTO = {
        name,
        purl,
        url,
        versions: [
          {
            version,
            licenses: [licenseId],
          },
        ],
      };

      const response = await componentService.create(dto);
      onClose({ action: DIALOG_ACTIONS.OK, data: { component: response, created: dto } });
    } catch (error: any) {
      console.log('error', error);
      await dialogCtrl.openConfirmDialog(error.message, { label: 'Accept', role: 'accept' }, true);
    }
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate();
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([...licenses, response.data]);
      setForm({ ...form, licenseId: response.data.id });
    }
  };

  const isValid = () => {
    const { name, version, licenseId, purl } = form;
    return name && version && licenseId && purl;
  };

  return (
    <Dialog
      id="ComponentDialog"
      className={`${classes.size} dialog`}
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <header className="dialog-title">
        <span>{label}</span>
        <IconButton aria-label="close" tabIndex={-1} onClick={onCancel} size="large">
          <CloseIcon />
        </IconButton>
      </header>

      <form onSubmit={handleClose}>
        <div className="dialog-content">
          <div className={`dialog-row ${classes.componentVersion} `}>
            <div className="dialog-form-field">
              <label className="dialog-form-field-label">Component</label>
              <Paper className="dialog-form-field-control">
                <TextField
                  name="name"
                  size="small"
                  fullWidth
                  autoFocus
                  disabled={readOnly}
                  value={form?.name}
                  onChange={(e) => inputHandler(e.target.name, e.target.value)}
                  required
                />
              </Paper>
            </div>

            <div className="dialog-form-field">
              <label className="dialog-form-field-label">Version</label>
              <Paper className="dialog-form-field-control">
                <TextField
                  name="version"
                  size="small"
                  fullWidth
                  value={form?.version}
                  onChange={(e) => inputHandler(e.target.name, e.target.value)}
                  required
                />
              </Paper>
            </div>
          </div>

          <div className="dialog-form-field">
            <div className="dialog-form-field-label">
              <label>License</label>
              <Tooltip title="Add new license">
                <IconButton tabIndex={-1} color="inherit" size="small" onClick={openLicenseDialog}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </div>
            <Paper className="dialog-form-field-control">
              <Autocomplete
                fullWidth
                size="small"
                options={licenses || []}
                // value={{ id: form?.licenseId }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name || ''}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchIcon />,
                      disableUnderline: true,
                      className: 'autocomplete-option',
                    }}
                  />
                )}
                onChange={(e, { id, name }) => setForm({ ...form, licenseId: id })}
              />
            </Paper>
          </div>

          {!readOnly && (
            <>
              <div className="dialog-form-field">
                <label className="dialog-form-field-label">PURL</label>
                <Paper className="dialog-form-field-control">
                  <TextField
                    name="purl"
                    size="small"
                    fullWidth
                    value={form?.purl}
                    onChange={(e) => inputHandler(e.target.name, e.target.value)}
                    required
                  />
                </Paper>
              </div>

              <div className="dialog-form-field">
                <label className="dialog-form-field-label">
                  URL <span className="optional">- Optional</span>
                </label>
                <Paper className="dialog-form-field-control">
                  <TextField
                    name="url"
                    size="small"
                    fullWidth
                    value={form?.url}
                    onChange={(e) => inputHandler(e.target.name, e.target.value)}
                  />
                </Paper>
              </div>
            </>
          )}
        </div>

        <DialogActions>
          <Button tabIndex={-1} color="inherit" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComponentDialog;
