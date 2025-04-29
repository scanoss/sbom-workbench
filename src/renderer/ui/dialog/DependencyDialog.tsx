/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Dialog, Tooltip, Paper, DialogActions, Button, InputBase, TextField, IconButton } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Dependency } from '@api/types';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { ResponseStatus } from '@api/Response';
import { licenseService } from '@api/services/license.service';
import { DialogContext } from '@context/DialogProvider';
import { NewDependencyDTO } from '@api/dto';
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from 'react-i18next';
import LicenseSelector from '@components/LicenseSelector/LicenseSelector';

interface DependencyDialogProps {
  open: boolean;
  dependency: Partial<Dependency>;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const DependencyDialog = (props: DependencyDialogProps) => {
  const dialogCtrl = useContext<any>(DialogContext);
  const { t } = useTranslation();

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
      const data = await licenseService.getAll();
      setLicenses(data);
    }
  };

  useEffect(() => {
    init();
  }, [open]);
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
      className="dialog"
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
      sx={{
        '& .MuiDialog-paper': {
          width: 500,
        },
      }}
    >
      <header className="dialog-title">
        <span dangerouslySetInnerHTML={
          { __html: t('Dialog:AcceptDependency', { dependency: decodeURIComponent(dependency.component?.name || dependency.componentName || dependency.purl), interpolation: { escapeValue: false } }) }
          } />
        <IconButton aria-label="close" tabIndex={-1} onClick={onCancel} size="large">
          <CloseIcon />
        </IconButton>
      </header>

      <form onSubmit={handleClose}>
        <div className="dialog-content">
          <div className="dialog-form-field">
            <div className="dialog-form-field-label">
              <label>{t('Title:License')}</label>
              <Tooltip title={t('Tooltip:AddNewLicense')}>
                <IconButton color="inherit" size="small" onClick={openLicenseDialog}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </div>
            <div className="dialog-form-field-control">
              <LicenseSelector
                options={licenses || []}
                value={licenses?.find((item) => item.spdxid === form.license) || {}}
                onChange={(e, { spdxid }) => setForm({ ...form, license: spdxid })}
              />
            </div>
          </div>

          <div className="dialog-form-field d-flex flex-column space-between">
            <label className="dialog-form-field-label">{t('Title:Version')}</label>
            <Paper className="dialog-form-field-control">
              <TextField
                name="version"
                size="small"
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
          <Button color="inherit" tabIndex={-1} onClick={onCancel}>
            {t('Button:Cancel')}
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
            {t('Button:Accept')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DependencyDialog;
