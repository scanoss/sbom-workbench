/* eslint-disable prettier/prettier */
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tab,
  Tabs,
} from '@material-ui/core';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { Inventory } from '../../../../api/types';
import { FileList } from '../ComponentList/components/FileList';
import { InventoryList } from '../ComponentList/components/InventoryList';
import { ComponentInfo } from '../../components/ComponentInfo/ComponentInfo';
import { DialogContext, IDialogContext } from '../../../context/DialogProvider';
import { inventoryService } from '../../../../api/inventory-service';
import { componentService } from '../../../../api/component-service';

import { mapFiles } from '../../../../utils/scan-util';
import { MATCH_CARD_ACTIONS } from '../../components/MatchCard/MatchCard';
import { DIALOG_ACTIONS } from '../../../context/types';
import IdentifiedList from '../ComponentList/components/IdentifiedList';

export const ComponentDetail = () => {
  const history = useHistory();

  const { state, detachFile, createInventory, ignoreFile, restoreFile, attachFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { name, component } = state;

  const [files, setFiles] = useState<any[]>([]);
  const [filterFiles, setFilterFiles] = useState<{ pending: any[], identified: any[], ignored: any[] }>();

  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [versions, setVersions] = useState<any[]>(null);
  const [version, setVersion] = useState<string>(null);

  const anchorRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = useState<number>(component?.summary?.pending !== 0 ? 0 : 1);

  const getFiles = async () => {
    const response = await componentService.getFiles({ purl: component.purl, version });
    console.log('FILES BY COMP', response);
    setFiles(mapFiles(response.data));
  };

  const getInventories = async () => {
    const query =  version ? { purl: component.purl, version } : { purl: component.purl };
    const response = await inventoryService.getAll(query);
    console.log('INVENTORIES BY COMP', response);
    setInventories(response.message || []);
  };

  const onAction = async (file: any, action: MATCH_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_CARD_ACTIONS.ACTION_ENTER:
        history.push(`/workbench/file?path=${file.path}`);
        break;
      case MATCH_CARD_ACTIONS.ACTION_IDENTIFY:
        await onIdentifyPressed(file);
        break;
      case MATCH_CARD_ACTIONS.ACTION_IGNORE:
        await onIgnorePressed(file);
        break;
      case MATCH_CARD_ACTIONS.ACTION_DETACH:
        await onDetachPressed(file);
        break;
      case MATCH_CARD_ACTIONS.ACTION_RESTORE:
        await onRestorePressed(file);
        break;
      case MATCH_CARD_ACTIONS.ACTION_DETAIL:
        await onDetailPressed(file);
        break;
      default:
        break;
    }

    getFiles();
  };

  const onIdentifyPressed = async (file) => {
   const inv: Partial<Inventory> = {
      component: file.component.name,
      url: file.component.url,
      purl: file.component.purl,
      version: file.component.version,
      license_name: file.component.licenses[0]?.name,
      usage: file.type,
    };

    create(inv, [file.id]);
  };

  const onIdentifyAllPressed = async () => {
    const selFiles = files.filter((file) => file.status === 'pending').map((file) => file.id);

    const inv: Partial<Inventory> = {
      component: component?.name,
      version: version || component?.versions[0]?.version,
      license_name: component?.versions[0].licenses[0]?.name,
      url: component?.url,
      purl: component?.purl,
      usage: 'file',
    };

    create(inv, selFiles);
  };

  const onIgnorePressed = async (file) => {
    await ignoreFile([file.id]);
  };

  const onIgnoreAllPressed = async () => {
    const selFiles = filterFiles.pending.map((file) => file.id);
    await ignoreFile(selFiles);
    getFiles();
  };

  const onRestoreAllPressed = async () => {
    const selFiles = filterFiles.ignored.map((file) => file.id);
    await restoreFile(selFiles);
    getFiles();
  };

  const onDetachAllPressed = async () => {
    const selFiles = filterFiles.identified.map((file) => file.id);
    await detachFile(0, selFiles); // FIXME: 0 is hardcoded
    getFiles();
  };

  const onDetachPressed = async (file) => {
      await detachFile(file.inventoryid, [file.id]);
  }

  const onRestorePressed = async (file) => {
    await restoreFile([file.id]);
  };

  const onDetailPressed = async (file) => {
    history.push(`/workbench/inventory/${file.inventoryid}`);
  };


  const create = async (defaultInventory, selFiles) => {
    const showSelector = inventories.length > 0;
    let action = DIALOG_ACTIONS.NEW;
    let inventory;

    if (showSelector) {
      const response = await dialogCtrl.openInventorySelector(inventories);
      action = response.action;
      inventory = response.inventory;
    }

    if (action === DIALOG_ACTIONS.CANCEL) return;

    if (action === DIALOG_ACTIONS.NEW) {
      inventory = await dialogCtrl.openInventory(defaultInventory);
      if (!inventory) return;

      const newInventory = await createInventory({
        ...inventory,
        files: selFiles,
      });
      setInventories((previous) => [...previous, newInventory]);
    } else if (action === DIALOG_ACTIONS.OK) {
      await attachFile(inventory.id, selFiles);
    }

    getFiles();
    setTab(1);
  };

  const handleCloseVersionGroup = () => {
    setAnchorEl(null);
  };

  const handleVersionSelected = (version: string) => {
    setVersion(version);
    setAnchorEl(null);
  };

  const handleCloseButtonGroup = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    if (!files) return;
    setFilterFiles({
      pending: files.filter((file) => file.status === 'pending'),
      identified: files.filter((file) => file.status === 'identified'),
      ignored: files.filter((file) => file.status === 'ignored'),
    });
  }, [files]);

  useEffect(() => {
    setVersions(component ? component.versions : null);
  }, [component]);

  useEffect(() => {
    setFilterFiles({
      pending: [],
      identified: [],
      ignored: [],
    });
    getFiles();
    getInventories();
  }, [version]);

  const renderTab = () => {
    switch (tab) {
      case 0:
        return <FileList files={filterFiles.pending} onAction={onAction} />;
      case 1:
        return <IdentifiedList files={filterFiles.identified} inventories={inventories} onAction={onAction} />;
      case 2:
        return <FileList files={filterFiles.ignored} onAction={onAction} />;
      default:
        return 'no data';
    }
  };

  return (
    <>
      <section id="ComponentDetail" className="app-page">
        <header className="app-header">
          <div className="header">
            <div>
              <h4 className="header-subtitle back">
                <IconButton onClick={() => history.goBack()} component="span">
                  <ArrowBackIcon />
                </IconButton>
                {name}
              </h4>
              <div className="filter-container">
                <h1 className="header-title">Matches</h1>
                { (component?.versions?.length > 1) &&
                  <Button
                    className={`filter btn-version ${version ? 'selected' : ''}`}
                    aria-controls="menu"
                    aria-haspopup="true"
                    endIcon={<ArrowDropDownIcon />}
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                  >
                    { version || 'version' }
                  </Button>
                }
              </div>
              <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleCloseVersionGroup}>
                <MenuItem key="all" onClick={() => handleVersionSelected(null)}>
                  All versions
                </MenuItem>
                {versions?.map(({ version }) => (
                  <MenuItem key={version} onClick={() => handleVersionSelected(version)}>
                    {version}
                  </MenuItem>
                ))}
              </Menu>
            </div>

            <ComponentInfo component={component} />
          </div>

          <section className="subheader">
            <div className="tabs d-flex">
              <Paper square>
                <Tabs
                  selectionFollowsFocus
                  value={tab}
                  TabIndicatorProps={{ style: { display: 'none' } }}
                  onChange={(event, value) => setTab(value)}
                >
                  <Tab label={`Pending (${version ? `${filterFiles.pending.length}/` : ''}${component?.summary.pending})`} />
                  <Tab label={`Identified (${version ? `${filterFiles.identified.length}/` : ''}${component?.summary.identified})`} />
                  <Tab label={`Ignored (${version ? `${filterFiles.ignored.length}/` : ''}${component?.summary.ignored})`} />
                </Tabs>
              </Paper>
            </div>

            {tab === 0 && (
              <>
                <ButtonGroup
                  disabled={component?.summary.pending === 0}
                  ref={anchorRef}
                  variant="contained"
                  color="secondary"
                  aria-label="split button"
                >
                  <Button variant="contained" color="secondary" onClick={onIdentifyAllPressed}>
                    Identify All ({component?.summary.pending})
                  </Button>
                  <Button color="secondary" size="small" onClick={() => setOpen((prevOpen) => !prevOpen)}>
                    <ArrowDropDownIcon />
                  </Button>
                </ButtonGroup>
                <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
                  <Paper>
                    <ClickAwayListener onClickAway={handleCloseButtonGroup}>
                      <MenuList id="split-button-menu">
                        <MenuItem
                          key="test"
                          onClick={() => {
                            setOpen(false);
                            onIgnoreAllPressed();
                          }}
                        >
                          Ignore All ({component?.summary.pending})
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Popper>
              </>
            )}
            {tab === 1 && (
              <Button
                disabled={component?.summary.identified === 0}
                variant="contained"
                color="secondary"
                onClick={onDetachAllPressed}
              >
                Restore All ({component?.summary.identified})
              </Button>
            )}
            {tab === 2 && (
              <Button
                disabled={component?.summary.ignored === 0}
                variant="contained"
                color="secondary"
                onClick={onRestoreAllPressed}
              >
                Restore All ({component?.summary.ignored})
              </Button>
            )}
          </section>
        </header>

        <main className="app-content">{filterFiles && renderTab()}</main>

        {/* { inventories && inventories.length > 0 && (
          <footer className="app-footer">
            <div className="groups d-flex space-between align-center">
               <span>You have identified <b>{inventories.length} {inventories.length > 1 ? 'groups' : 'group'}</b> for this detected component.</span>
              <Button color="primary" onClick={(event) => history.push('/workbench/inventory')}>View groups</Button>
            </div>
          </footer>
        ) } */}
      </section>
    </>
  );
};

export default ComponentDetail;
