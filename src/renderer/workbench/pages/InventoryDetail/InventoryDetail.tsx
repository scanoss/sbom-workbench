import { Button, Chip } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { IWorkbenchContext, WorkbenchContext } from '../../store';
import { Inventory } from '../../../../api/types';
import { FileList } from './components/FileList';
import { ComponentInfo } from '../../components/ComponentInfo/ComponentInfo';
import { inventoryService } from '../../../../api/inventory-service';
import { MATCH_CARD_ACTIONS } from '../../components/MatchCard/MatchCard';
import Label from '../../components/Label/Label';
import { mapFiles } from '../../../../utils/scan-util';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { DialogContext, IDialogContext } from '../../../context/DialogProvider';
import { DIALOG_ACTIONS } from '../../../context/types';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';

export const InventoryDetail = () => {
  const history = useHistory();
  const { id } = useParams();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { detachFile, deleteInventory } = useContext(WorkbenchContext) as IWorkbenchContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [inventory, setInventory] = useState<Inventory>();
  const [files, setFiles] = useState<string[]>([]);

  const getInventory = async () => {
    const response = await inventoryService.get({ id });
    console.log(response);
    if (response.status === 'fail') {
      history.goBack();
      return;
    }
    setInventory(response.data);
    setFiles(mapFiles(response.data?.files));
  };

  const onRemoveClicked = async () => {
    const { action } = await dialogCtrl.openConfirmDialog();
    if (action == DIALOG_ACTIONS.OK) {
      await deleteInventory(inventory?.id);
      history.goBack();
    }
  }

  const onAction = (fileId: number, action: MATCH_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_CARD_ACTIONS.ACTION_ENTER:
        history.push(`/workbench/file?path=${file}`);
        break;
      case MATCH_CARD_ACTIONS.ACTION_DETACH:
        detachFile(inventory?.id, [fileId]);
        getInventory();
        break;
    }
  };

  useEffect(() => {
    getInventory();
  }, []);

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <div className="header">
            <div>
              <h4 className="header-subtitle back">
                <IconButton onClick={() => history.goBack()} component="span">
                  <ArrowBackIcon />
                </IconButton>
                {scanBasePath}
              </h4>
            </div>
            <ComponentInfo component={inventory?.component} />
          </div>
          <div className="identified-info-card">
            <IconButton className="btn-delete" onClick={onRemoveClicked} >
              <DeleteOutlineOutlinedIcon />
            </IconButton>
            <div className="first-part-card">
              <Chip className="identified" variant="outlined" label="Identified Group" />
            </div>
            <div className="second-part-card">
              <div className="usage-part">
                <Label label="USAGE" textColor="gray" />
                <h2>{inventory?.usage}</h2>
              </div>
              <div className="note-part">
                <Label label="NOTE" textColor="gray" />
                <span>{inventory?.notes}</span>
              </div>
            </div>

          </div>
        </header>
        <main className="app-content">
          <FileList files={files} onAction={onAction} />
        </main>
      </section>
    </>
  );
};

export default InventoryDetail;
