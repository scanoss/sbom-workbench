import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tab,
  Tabs
} from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Inventory } from '../../../../api/types';
import { FileList } from '../ComponentList/components/FileList';
import { InventoryList } from '../ComponentList/components/InventoryList';
import { ComponentInfo } from '../../components/ComponentInfo/ComponentInfo';
import { DialogContext, IDialogContext } from '../../../context/DialogProvider';
import { setFile } from '../../actions';
import { inventoryService } from '../../../../api/inventory-service';
import { componentService } from '../../../../api/component-service';
import { useEffect } from 'react';
import { mapFiles } from '../../../../utils/scan-util';
import { MATCH_CARD_ACTIONS } from '../../components/MatchCard/MatchCard';

export const ComponentDetail = () => {
  const history = useHistory();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state, dispatch, createInventory, ignoreFile, restoreFile } = useContext(WorkbenchContext) as IWorkbenchContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { component } = state;

  const [files, setFiles] = useState<any[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
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
      case MATCH_CARD_ACTIONS.ACTION_RESTORE:
        onRestorePressed(file);
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
    const inventory = await dialogCtrl.openInventory(inv);

    if (inventory) {
      create({
        ...inventory,
        files: [file.path]
      });
    }
  };

  const onIdentifyAllPressed = async () => {
    const inv = {
      ...component,
      component: component?.name,
      license: component?.licenses[0]?.name,
      usage: 'file',
    };
    const inventory = await dialogCtrl.openInventory(inv);
    const selFiles = files
      .filter( file => file.status === 'pending')
      .map( file => file.path);

    if (inventory) {
      create({
        ...inventory,
        files: selFiles
      });
    }
  };

  const onIgnorePressed = async (file) => {
    await ignoreFile([file.path]);
    getFiles();
  };

  const onIgnoreAllPressed = async () => {
    const selFiles = files
      .filter( file => file.status === 'pending')
      .map( file => file.path);
    await ignoreFile(selFiles);
    getFiles();
  };

  const onRestoreAllPressed = async () => {
    const selFiles = files
      .filter( file => file.status === 'ignored')
      .map( file => file.path);
    await restoreFile(selFiles);
    getFiles();
  };

  const onRestorePressed = async (file)  => {
    await restoreFile([file.path]);
    getFiles();
  };

  const create = async (inventory: Inventory) => {
    const newInventory = await createInventory(inventory);
    setInventories((previous) => [...previous, newInventory]);
    getFiles();
    setTab(1);
  };

  const handleCloseButtonGroup = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
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

            {tab === 0 && (
              <>
                <ButtonGroup
                  disabled={component?.summary.pending === 0}
                  ref={anchorRef} variant="contained" color="secondary" aria-label="split button">
                  <Button
                    variant="contained" color="secondary" onClick={onIdentifyAllPressed}>
                    Identify All ({component?.summary.pending})
                  </Button>
                  <Button
                    color="secondary"
                    size="small"
                    onClick={() => setOpen((prevOpen) => !prevOpen)}
                  >
                    <ArrowDropDownIcon />
                  </Button>
                </ButtonGroup>
                <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
                  <Paper>
                    <ClickAwayListener onClickAway={handleCloseButtonGroup}>
                      <MenuList id="split-button-menu">
                          <MenuItem
                            key="test"
                            onClick={ () => { setOpen(false); onIgnoreAllPressed() }}>
                            Ignore All ({component?.summary.pending})
                          </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Popper>
              </>
            )}
            {tab === 2 && (
              <Button
                disabled={component?.summary.ignored === 0}
                variant="contained" color="secondary" onClick={onRestoreAllPressed}>
                Restore All ({component?.summary.ignored})
              </Button>
            )}
          </section>
        </header>

        <main className="app-content">{renderTab()}</main>
      </section>
    </>
  );
};

export default ComponentDetail;
