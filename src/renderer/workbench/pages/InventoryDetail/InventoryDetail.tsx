import {  Chip } from '@material-ui/core';
import React, { useContext, useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { Inventory } from '../../../../api/types';
import { FileList } from './components/FileList';
import { ComponentInfo } from '../../components/ComponentInfo/ComponentInfo';
import { setFile } from '../../actions';
import { inventoryService } from '../../../../api/inventory-service';
import { MATCH_CARD_ACTIONS } from '../../components/MatchCard/MatchCard';
import Label from '../../components/Label/Label';
import { mapFiles } from '../../../../utils/scan-util';
import { AppContext, IAppContext } from '../../../context/AppProvider';

export const InventoryDetail = () => {
  const history = useHistory();
  const { id } = useParams();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { dispatch, detachFile } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [inventory, setInventory] = useState<Inventory>();
  const [files, setFiles] = useState<string[]>([]);

  const getInventory = async () => {
    const response = await inventoryService.get({ id });
    setInventory(response.data);
    setFiles(mapFiles(response.data?.files));
  };

  const onAction = (file: string, action: MATCH_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_CARD_ACTIONS.ACTION_ENTER:
        history.push(`/workbench/file?path=${file}`);
        break;
      case MATCH_CARD_ACTIONS.ACTION_DETACH:
        detachFile(inventory?.id, inventory?.component.purl, inventory?.component.version, [file]);
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
