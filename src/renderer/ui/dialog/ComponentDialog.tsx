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
import { useTranslation } from 'react-i18next';
import LicenseSelector from '@components/LicenseSelector/LicenseSelector';

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
  const { t } = useTranslation();

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
  const [license, setLicense] = useState<any>({}); // <License>

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
      await dialogCtrl.openConfirmDialog(error.message, { label: t('Button:Accept'), role: 'accept' }, true);
    }
  };

  const openLicenseDialog = async () => {
    const response = await dialogCtrl.openLicenseCreate();
    if (response && response.action === ResponseStatus.OK) {
      setLicenses([...licenses, response.data]);
      setLicense(response.data);
    }
  };

  const isValid = () => {
    const { name, version, licenseId, purl } = form;
    return name && version && licenseId && purl;
  };

  useEffect(() => {
    fetchData();
  }, [open]);


  useEffect(() => {
    setForm({
      ...form,
      licenseId: license?.id || null
    });
  }, [license]);

  useEffect(setDefaults, [component]);

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
              <label className="dialog-form-field-label">{t('Title:Component')}</label>
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
              <label className="dialog-form-field-label">{t('Title:Version')}</label>
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
              <label>{t('Title:License')}</label>
              <Tooltip title={t('Tooltip:AddNewLicense')}>
                <IconButton tabIndex={-1} color="inherit" size="small" onClick={openLicenseDialog}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </div>
            <div className="dialog-form-field-control">
              <LicenseSelector
                options={licenses || []}
                value={license}
                isOptionEqualToValue={(option, value) => option.spdxid === value.spdxid}
                getOptionLabel={(option) => option.name || ''}
                onChange={(e, lic ) => setLicense(lic)}
              />
            </div>
          </div>

          {!readOnly && (
            <>
              <div className="dialog-form-field">
                <label className="dialog-form-field-label">{t('Title:PURL')}</label>
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
                  {t('Title:URL')} <span className="optional">- {t('Optional')}</span>
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
          <Button tabIndex={-1} color="inherit" onClick={onCancel}>{t('Button:Cancel')}</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            {t('Button:Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComponentDialog;
