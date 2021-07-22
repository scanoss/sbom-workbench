import { Button, Paper, Tab, Tabs } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { InventoryDialog } from '../../components/InventoryDialog/InventoryDialog';
import { Inventory } from '../../../../api/types';
import { FileList } from '../ComponentList/components/FileList';
import { InventoryList } from '../ComponentList/components/InventoryList';
import { ComponentInfo } from '../../components/ComponentInfo/ComponentInfo';
import { DialogContext } from '../../../context/DialogProvider';
import { setFile } from '../../actions';
import { inventoryService } from '../../../../api/inventory-service';
import { componentService } from '../../../../api/component-service';
import { useEffect } from 'react';
import { mapFiles } from '../../../../utils/scan-util';
import { MATCH_CARD_ACTIONS } from '../../components/MatchCard/MatchCard';

export const ComponentDetail = () => {
  const history = useHistory();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state, dispatch, createInventory, ignoreFile } = useContext(WorkbenchContext) as IWorkbenchContext;
  const dialogCtrl = useContext<any>(DialogContext);

  const { component } = state;

  const [files, setFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [tab, setTab] = useState<number>(component?.summary.pending !== 0 ? 0 : 1);

  const getFiles = async () => {
    const response = await componentService.getFiles( { purl: component.purl, version: component.version });
    console.log('FILES BY COMP', response);
    setFiles(mapFiles(response.data));
  };

  const getInventories = async () => {
    const response = await inventoryService
      .getAll({ purl: component.purl, version: component.version });
    console.log('INVENTORIES BY COMP', response);
    setInventories(response.message || []);
  };

  const onAction = (file: string, action: MATCH_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_CARD_ACTIONS.ACTION_ENTER:
        history.push(`/workbench/file/${file.path}`);
        dispatch(setFile(file.path));
        break;
      case MATCH_CARD_ACTIONS.ACTION_IDENTIFY:
        onIdentifyPressed(file);
        break;
      case MATCH_CARD_ACTIONS.ACTION_IGNORE:
        onIgnorePressed(file);
        break;
    }
  };

  const onIdentifyPressed = async (file) => {
    const inv = {
      ...component,
      component: component?.name,
      license: component?.licenses[0]?.name,
      usage: file.type,
    };
    dialogCtrl.openInventory(inv);
    setSelectedFiles([file.path]);
  };

  const onIdentifyAllPressed = async () => {
    const inv = {
      ...component,
      component: component?.name,
      license: component?.licenses[0]?.name,
      usage: 'file',
    };
    dialogCtrl.openInventory(inv);
    const selFiles = files
      .filter( file => file.status === 'pending')
      .map( file => file.path);
    setSelectedFiles(selFiles);
  };

  const onIgnorePressed = async (file) => {
    await ignoreFile([file.path]);
    getFiles();
  };

  const handleClose = async (inventory: Inventory) => {
    const  newInventory = await createInventory({
      ...inventory,
      files: selectedFiles
    });

    setInventories((previous) => [...previous, newInventory]);
    getFiles();
    setTab(1);
  };


  useEffect(() => {
    getFiles();
    getInventories();
  }, []);

  const renderTab = () => {
    switch (tab) {
      case 0:
        return <FileList files={files} filter="pending" onAction={onAction} />;
      case 1:
        return <InventoryList inventories={inventories} />;
      case 2:
        return <FileList files={files} filter="ignored" onAction={onAction} />;
      default:
        return 'no data';
    }
  };

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

              <h1 className="header-title">Matches</h1>
            </div>

            <ComponentInfo component={component} />
          </div>

          <section className="subheader">
            <div className="tabs">
              <Paper square>
                <Tabs
                  value={tab}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={(event, value) => setTab(value)}
                >
                  <Tab label={`Pendings (${component?.summary.pending})`} />
                  <Tab label={`Identified (${component?.summary.identified})`} />
                  <Tab label={`Ignored (${component?.summary.ignored})`} />
                </Tabs>
              </Paper>
            </div>

            {tab === 0 ? (
              <Button
                disabled={component?.summary.pending === 0}
                variant="contained" color="secondary" onClick={onIdentifyAllPressed}>
                Identify All ({component?.summary.pending})
              </Button>
            ) : null}
          </section>
        </header>

        <main className="app-content">{renderTab()}</main>
      </section>

      <InventoryDialog
        onClose={handleClose}
      />
    </>
  );
};

export default ComponentDetail;
