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
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import { WorkbenchContext, IWorkbenchContext } from '../../../../store';
import { Inventory } from '../../../../../../../api/types';
import { FileList } from '../ComponentList/components/FileList';
import { ComponentInfo } from '../../../../components/ComponentInfo/ComponentInfo';
import { componentService } from '../../../../../../../api/component-service';

import { IdentifiedList } from '../ComponentList/components/IdentifiedList';
import { DialogContext, IDialogContext } from '../../../../../../context/DialogProvider';
import { inventoryService } from '../../../../../../../api/inventory-service';
import { DIALOG_ACTIONS } from '../../../../../../context/types';
import { MATCH_CARD_ACTIONS } from '../../../../components/MatchCard/MatchCard';
import { mapFiles } from '../../../../../../../utils/scan-util';
import { setHistoryCrumb, setVersion } from '../../../../actions';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';

// inner components
const VersionSelector = ({ versions, version, onSelect, component }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const totalFiles = component.summary.ignored + component.summary.pending + component.summary.identified;

  const handleSelected = (version: string) => {
    setAnchorEl(null);
    onSelect(version);
  };

  return (
    <>
      <div>
        {versions?.length > 1 ? (
          <Button
            className={`filter btn-version ${version ? 'selected' : ''}`}
            aria-controls="menu"
            aria-haspopup="true"
            endIcon={<ArrowDropDownIcon />}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            {version || 'version'}
          </Button>
        ) : (
          versions[0].version
        )}
      </div>
      <Menu id="VersionSelectorList" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem key="all" onClick={() => handleSelected(null)}>
          <div className="version-container">
            <div className="version"> All versions</div>
            <div className="files-counter">{totalFiles}</div>
          </div>
        </MenuItem>
        {versions?.map(({ version, files }) => (
          <MenuItem key={version} onClick={() => handleSelected(version)}>
            <div className="version-container">
              <div className="version"> {version}</div>
              <div className="files-counter">{files}</div>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const TabNavigation = ({ tab, version, component, filterFiles, onSelect }) => {
  return (
    <div className="tabs d-flex">
      <Paper square>
        <Tabs
          selectionFollowsFocus
          value={tab}
          TabIndicatorProps={{ style: { display: 'none' } }}
          onChange={(event, value) => onSelect(value)}
        >
          <Tab label={`Pending (${version ? `${filterFiles.pending.length}/` : ''}${component?.summary.pending})`} />
          <Tab
            label={`Identified (${version ? `${filterFiles.identified.length}/` : ''}${component?.summary.identified})`}
          />
          <Tab label={`Original (${version ? `${filterFiles.ignored.length}/` : ''}${component?.summary.ignored})`} />
        </Tabs>
      </Paper>
    </div>
  );
};

export const ComponentDetail = () => {
  const history = useHistory();

  const { state, dispatch, setNode, detachFile, createInventory, ignoreFile, restoreFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { name, component, filter } = state;
  const { version } = filter;

  const anchorRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState<any[]>([]);
  const [filterFiles, setFilterFiles] = useState<{ pending: any[]; identified: any[]; ignored: any[] }>({
    pending: [],
    identified: [],
    ignored: [],
  });

  const [inventories, setInventories] = useState<Inventory[]>([]);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<number>(state.history.section || 0);

  const getFiles = async () => {
    console.log("GET FILES");
    const response = await componentService.getFiles({ purl: component.purl, version }, filter.node?.path ? { path: filter.node.path } : null);
    console.log('FILES BY COMP', response);
    setFiles(mapFiles(response.data));
  };

  const getInventories = async () => {
    const query = version ? { purl: component.purl, version } : { purl: component.purl };
    const inv = await inventoryService.getAll(query);
    console.log('INVENTORIES BY COMP', inv);
    setInventories(inv || []);
  };

  const onAction = async (file: any, action: MATCH_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_CARD_ACTIONS.ACTION_ENTER:
        history.push({
          pathname: '/workbench/detected/file',
          search: `?path=file|${encodeURIComponent(file.path)}`,
        });
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

  const onIdentifyPressed = async (result) => {
    // Result is file join result
    const inv: Partial<Inventory> = {
      component: result.component.name,
      url: result.component.url,
      purl: result.purl,
      version: result.version,
      spdxid: result.license ? result.license[0] : null,
      usage: result.type,
    };

    create(inv, [result.id]);
  };

  const onIdentifyAllPressed = async () => {
    const selFiles = files.filter((file) => file.status === 'pending').map((file) => file.id);

    const inv: Partial<Inventory> = {
      component: component?.name,
      version: version || component?.versions[0]?.version,
      spdxid: component?.versions[0].licenses[0]?.spdxid,
      url: component?.url,
      purl: component?.purl,
      usage: 'file',
    };

    console.log(component?.versions[0].licenses);

    await create(inv, selFiles);
    setTab(1);
  };

  const onIgnorePressed = async (file) => {
    await ignoreFile([file.id]);
  };

  const onIgnoreAllPressed = async () => {
    const { action } = await dialogCtrl.openConfirmDialog(
      `Are you sure you want to ignore ${filterFiles.pending.length} ${
        filterFiles.pending.length === 1 ? 'file' : 'files'
      }?`
    );
    if (action === DIALOG_ACTIONS.OK) {
      const selFiles = filterFiles.pending.map((file) => file.id);
      await ignoreFile(selFiles);
    }
  };

  const onRestoreAllPressed = async () => {
    const { action } = await dialogCtrl.openConfirmDialog(
      `Are you sure you want to restore ${filterFiles.ignored.length} ${
        filterFiles.ignored.length === 1 ? 'file' : 'files'
      }?`
    );

    if (action === DIALOG_ACTIONS.OK) {
      const selFiles = filterFiles.ignored.map((file) => file.id);
      await restoreFile(selFiles);
    }
  };

  const onDetachAllPressed = async () => {
    const { action } = await dialogCtrl.openConfirmDialog(
      `Are you sure you want to restore ${filterFiles.identified.length} ${
        filterFiles.identified.length === 1 ? 'file' : 'files'
      }?`
    );
    if (action === DIALOG_ACTIONS.OK) {
      const selFiles = filterFiles.identified.map((file) => file.id);
      await detachFile(selFiles);
    }
  };

  const onDetachPressed = async (file) => {
    await detachFile([file.id]);
  };

  const onRestorePressed = async (file) => {
    await restoreFile([file.id]);
  };

  const onDetailPressed = async (file) => {
    history.push(`/workbench/identified/inventory/${file.inventoryid}`);
  };

  const create = async (defaultInventory, selFiles) => {
    const inventory = await dialogCtrl.openInventory(defaultInventory);
    if (!inventory) return;

    const newInventory = await createInventory({
      ...inventory,
      files: selFiles,
    });
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
    setFilterFiles({
      pending: [],
      identified: [],
      ignored: [],
    });
    getFiles();
    getInventories();
  }, [state.filter.version, state.filter.node]);

  useEffect(() => {
    getFiles();
    getInventories();
  }, [state.summary]);

  useEffect(() => {
    dispatch(setHistoryCrumb({ section: tab }));
  }, [tab]);

  const renderTab = () => {
    switch (tab) {
      case 0:
        return <FileList files={filterFiles.pending} emptyMessage="No pending files" onAction={onAction} />;
      case 1:
        return <IdentifiedList files={filterFiles.identified} inventories={inventories} onAction={onAction} />;
      case 2:
        return <FileList files={filterFiles.ignored} emptyMessage="No ignored files" onAction={onAction} />;
      default:
        return 'no data';
    }
  };

  return (
    <>
      <section id="ComponentDetail" className="app-page">
        <header className="app-header">
          <div className="header">
            <Breadcrumb />
            <div className="filter-container">
              <ComponentInfo component={component} />
              <ChevronRightOutlinedIcon fontSize="small" />
              <VersionSelector
                versions={component?.versions}
                version={version}
                onSelect={(version) => dispatch(setVersion(version))}
                component={component}
              />
            </div>
          </div>

          <section className="subheader">
            <TabNavigation
              tab={tab}
              version={version}
              component={component}
              filterFiles={filterFiles}
              onSelect={(tab) => setTab(tab)}
            />

            {tab === 0 && (
              <>
                <ButtonGroup
                  size="small"
                  disabled={filterFiles.pending.length === 0}
                  ref={anchorRef}
                  variant="contained"
                  color="secondary"
                  aria-label="split button"
                >
                  <Button variant="contained" color="secondary" onClick={onIdentifyAllPressed}>
                    Identify All ({filterFiles.pending.length})
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
                          Mark all as original ({component?.summary.pending})
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Popper>
              </>
            )}
            {tab === 1 && (
              <Button
                size="small"
                disabled={filterFiles.identified.length === 0}
                variant="contained"
                color="secondary"
                onClick={onDetachAllPressed}
              >
                Restore All ({filterFiles.identified.length})
              </Button>
            )}
            {tab === 2 && (
              <Button
                size="small"
                disabled={filterFiles.ignored.length === 0}
                variant="contained"
                color="secondary"
                onClick={onRestoreAllPressed}
              >
                Restore All ({filterFiles.ignored.length})
              </Button>
            )}
          </section>
        </header>

        <main className="app-content">{filterFiles && renderTab()}</main>
      </section>
    </>
  );
};

export default ComponentDetail;
