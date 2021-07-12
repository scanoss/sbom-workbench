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
import { useEffect } from 'react';

export const ComponentDetail = () => {
  const history = useHistory();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state, dispatch, createInventory } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { inventoryBool, setInventoryBool } = useContext<any>(DialogContext);

  const { component, scan } = state;

  const [files, setFiles] = useState<any[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [tab, setTab] = useState<number>(0);

  const getFiles = () => {
    // const response = fileService.get({ compid: component.id });
    const { files } = component;
    setFiles(files);
  };

  const getInventories = async () => {
    //const response = await inventoryService.get({ purl: component.purl[0], version: component.version });
    const response = await inventoryService.get({});

    console.log(response);
    const inv = [];
    setInventories(inv);
  };

  const onSelectFile = (file: string) => {
    history.push(`/workbench/file/${file}`);
    dispatch(setFile(file));
  };

  const onIdentifyAllPressed = async () => {
    setInventoryBool(true);
  };

  const handleClose = async (inventory: Inventory) => {
    setInventoryBool(false);
    const newInventory = {
      ...inventory,
      files: component ? component.files : [],
    };
    await createInventory(newInventory);

    setInventories((previous) => [...previous, newInventory]);
    setTab(1);
  };

  useEffect(() => {
    getFiles();
    getInventories();
  }, []);

  const renderTab = () => {
    switch (tab) {
      case 0:
        return <FileList files={files} scan={scan} filter="pending" onSelectFile={onSelectFile} />;
      case 1:
        return <InventoryList inventories={inventories} />;
      case 2:
        return <FileList files={files} scan={scan} filter="ignored" onSelectFile={onSelectFile} />;
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
                  <Tab label={`Pendings (${component?.count.pending})`} />
                  <Tab label={`Identified (${component?.count.identified})`} />
                  <Tab label={`Ignored (${component?.count.ignored})`} />
                </Tabs>
              </Paper>
            </div>

            {tab === 0 ? (
              <Button variant="contained" color="secondary" onClick={onIdentifyAllPressed}>
                Identify All ({component?.count.pending})
              </Button>
            ) : null}
          </section>
        </header>

        <main className="app-content">{renderTab()}</main>
      </section>

      <InventoryDialog
        open={inventoryBool}
        onClose={handleClose}
        onCancel={() => setInventoryBool(false)}
        component={component}
      />
    </>
  );
};

export default ComponentDetail;
