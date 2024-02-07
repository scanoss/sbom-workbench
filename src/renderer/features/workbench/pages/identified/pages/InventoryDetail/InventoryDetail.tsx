import React, { useContext, useEffect, useState } from 'react';
import { Chip } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Inventory } from '@api/types';
import { inventoryService } from '@api/services/inventory.service';
import { mapFiles } from '@shared/utils/scan-util';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { DIALOG_ACTIONS, InventoryForm } from '@context/types';
import { useDispatch } from 'react-redux';
import { deleteInventory, detachFile, updateInventory } from '@store/inventory-store/inventoryThunks';
import { useTranslation } from 'react-i18next';
import Label from '../../../../components/Label/Label';
import { MATCH_CARD_ACTIONS } from '../../../../components/MatchCard/MatchCard';
import { FileList } from './components/FileList';
import useMode from '@hooks/useMode';

export const InventoryDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<any>();
  const { t } = useTranslation();
  const { props } = useMode();

  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [inventory, setInventory] = useState<Inventory>();
  const [files, setFiles] = useState<string[]>([]);

  const getInventory = async () => {
    try {
      const inv = await inventoryService.get({ id: +id });
      setInventory(inv);
      setFiles(mapFiles(inv.files));
    } catch (error) {
      console.error(error);
      navigate(-1);
    }
  };

  const onEditClicked = async () => {
    const inventoryForm: Partial<InventoryForm> = {
      ...inventory,
      id: inventory.id,
      component: inventory.component.name,
      purl: inventory.component.purl,
      version: inventory.component.version,
    };

    // TODO: use recent components
    const nInv = await dialogCtrl.openInventory(inventoryForm);
    if (!nInv) return;

    dispatch(updateInventory(nInv));
    // setInventory(inv);
  };

  const onRemoveClicked = async () => {
    const { action } = await dialogCtrl.openConfirmDialog('Are you sure you want to delete this group?', {
      label: 'Delete',
      role: 'delete',
    });
    if (action === DIALOG_ACTIONS.OK) {
      await dispatch(deleteInventory(inventory.id));
      navigate(-1);
    }
  };

  const onAction = (file: any, action: MATCH_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_CARD_ACTIONS.ACTION_ENTER:
        navigate({
          pathname: `/workbench/detected/file`,
          search: `?path=file|${encodeURIComponent(file.path)}`,
        });
        break;
      case MATCH_CARD_ACTIONS.ACTION_DETACH:
        dispatch(detachFile([file.id]));
        getInventory();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    getInventory();
  }, []);

  return <>
    <section className="app-page">
      <header className="app-header">
        <div className="identified-info-card">
          <div className="actions">
            <IconButton data-write {...props} className="btn-edit" onClick={onEditClicked} size="large">
              <EditOutlinedIcon />
            </IconButton>
            <IconButton data-write {...props} className="btn-delete" onClick={onRemoveClicked} size="large">
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </div>

          <Chip className="identified" variant="outlined" label="Identified Group" />

          <div className="d-flex">
            <div className="info">
              <Label label={t('Title:Component').toUpperCase()} textColor="gray" />
              <h4>{inventory?.component.name}</h4>
            </div>
            <div className="info">
              <Label label={t('Title:Version').toUpperCase()} textColor="gray" />
              <h4>{inventory?.component.version}</h4>
            </div>
            <div className="info">
              <Label label={t('Title:License').toUpperCase()} textColor="gray" />
              <h4>{inventory?.license_name}</h4>
            </div>
          </div>
          <div className="d-flex">
            <div className="info">
              <Label label={t('Title:Usage').toUpperCase()} textColor="gray" />
              <h4>{inventory?.usage}</h4>
            </div>
            <div className="info">
              <Label label={t('Title:Notes').toUpperCase()} textColor="gray" />
              <span className="notes">{inventory?.notes}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="app-content">
        <FileList files={files} onAction={onAction} />
      </main>
    </section>
  </>;
};

export default InventoryDetail;
