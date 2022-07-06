import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { Inventory } from '@api/types';
import { componentService } from '@api/services/component.service';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { DIALOG_ACTIONS } from '@context/types';
import { mapFiles } from '@shared/utils/scan-util';
import { useDispatch, useSelector } from 'react-redux';
import { createInventory, detachFile, ignoreFile, restoreFile } from '@store/inventory-store/inventoryThunks';
import { selectNavigationState, setVersion } from '@store/navigation-store/navigationSlice';
import { selectComponentState } from '@store/component-store/componentSlice';
import { selectWorkbench, setHistory } from '@store/workbench-store/workbenchSlice';
import { FileList } from '../ComponentList/components/FileList';
import { ComponentInfo } from '../../../../components/ComponentInfo/ComponentInfo';
import { IdentifiedList } from '../ComponentList/components/IdentifiedList';
import { MATCH_CARD_ACTIONS } from '../../../../components/MatchCard/MatchCard';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import SearchBox from '../../../../../../components/SearchBox/SearchBox';
import TabNavigation from './components/TabNavigation/TabNavigation';
import ActionButton from './components/ActionButton/ActionButton';
import VersionSelector from './components/VersionSelector/VersionSelector';

const TABS = {
  pending: '0',
  identified: '1',
  original: '2',
};

export const ComponentDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { summary, history: stateHistory } = useSelector(selectWorkbench);
  const { component } = useSelector(selectComponentState);
  const { filter, node, version } = useSelector(selectNavigationState);

  const [files, setFiles] = useState<any[]>([]);
  const [filterFiles, setFilterFiles] = useState<{ pending: any[]; identified: any[]; ignored: any[] }>({
    pending: [],
    identified: [],
    ignored: [],
  });

  const [tab, setTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const getFiles = async () => {
    const response = await componentService.getFiles({ purl: component.purl, version }, { status: null });
    setFiles(mapFiles(response));
  };

  const onAction = async (file: any, action: MATCH_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_CARD_ACTIONS.ACTION_ENTER:
        navigate({
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
    // result is "file join result"
    const inv: Partial<Inventory> = {
      component: result.componentName,
      url: result.url,
      purl: result.purl,
      version: result.version,
      spdxid: result.license ? result.license[0] : null,
      usage: result.type,
    };

    create(inv, [result.id]);
  };

  const onIdentifyAllPressed = async () => {
    const selFiles = filterFiles.pending.map((file) => file.id);
    console.log(component);
    const inv: Partial<Inventory> = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      component: component?.name,
      version: version || component?.versions[0]?.version,
      spdxid: component?.versions[0].reliableLicense,
      url: component?.url,
      purl: component?.purl,
      usage: 'file',
    };

    await create(inv, selFiles);
  };

  const onIgnorePressed = async (file) => {
    dispatch(ignoreFile([file.id]));
  };

  const onIgnoreAllPressed = async () => {
    const { action } = await dialogCtrl.openConfirmDialog(
      `Are you sure you want to ignore ${filterFiles.pending.length} ${
        filterFiles.pending.length === 1 ? 'file' : 'files'
      }?`
    );
    if (action === DIALOG_ACTIONS.OK) {
      const selFiles = filterFiles.pending.map((file) => file.id);
      dispatch(ignoreFile(selFiles));
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
      dispatch(restoreFile(selFiles));
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
      dispatch(detachFile(selFiles));
    }
  };

  const onDetachPressed = async (file) => {
    dispatch(detachFile([file.id]));
  };

  const onRestorePressed = async (file) => {
    dispatch(restoreFile([file.id]));
  };

  const onDetailPressed = async (file) => {
    navigate(`/workbench/identified/inventory/${file.inventoryid}`);
  };

  const create = async (defaultInventory, selFiles) => {
    // TODO: use recent componebnts
    const inventory = await dialogCtrl.openInventory(defaultInventory);
    if (!inventory) return;

    dispatch(
      createInventory({
        ...inventory,
        files: selFiles,
      })
    );
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
    const nTab = TABS[filter?.status] || stateHistory.section || tab || TABS.pending;

    setTab(parseInt(nTab, 10));
  }, [filter]);

  useEffect(() => {
    setFilterFiles({
      pending: [],
      identified: [],
      ignored: [],
    });
    getFiles();
  }, [version, node]);

  useEffect(() => {
    setFilterFiles({
      pending: files.filter((file) => file.path.toLowerCase().includes(searchQuery) && file.status === 'pending'),
      identified: files.filter((file) => file.path.toLowerCase().includes(searchQuery) && file.status === 'identified'),
      ignored: files.filter((file) => file.path.toLowerCase().includes(searchQuery) && file.status === 'ignored'),
    });
  }, [searchQuery, files]);

  useEffect(() => {
    getFiles();
  }, [summary]);

  useEffect(() => {
    dispatch(setHistory({ section: tab }));
  }, [tab]);

  const renderTab = () => {
    switch (tab) {
      case 0:
        return (
          <FileList
            files={filterFiles.pending}
            emptyMessage={searchQuery ? `No pending files found with "${searchQuery}"` : 'No pending files'}
            onAction={onAction}
          />
        );
      case 1:
        return (
          <IdentifiedList
            files={filterFiles.identified}
            emptyMessage={searchQuery ? `No identified files found with "${searchQuery}"` : 'No identified files'}
            onAction={onAction}
          />
        );
      case 2:
        return (
          <FileList
            files={filterFiles.ignored}
            emptyMessage={searchQuery ? `No original files found with "${searchQuery}"` : 'No original files'}
            onAction={onAction}
          />
        );
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
            <div className="search-box">
              <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
            </div>

            <div className="tab-navigation">
              <TabNavigation
                tab={tab}
                version={version}
                query={searchQuery}
                component={component}
                filterFiles={filterFiles}
                onSelect={(tab) => setTab(tab)}
              />

              <ActionButton
                tab={tab}
                files={filterFiles}
                onIdentifyAllPressed={onIdentifyAllPressed}
                onIgnoreAllPressed={onIgnoreAllPressed}
                onRestoreAllPressed={onRestoreAllPressed}
                onDetachAllPressed={onDetachAllPressed}
              />
            </div>
          </section>
        </header>

        <main className="app-content">{filterFiles && renderTab()}</main>
      </section>
    </>
  );
};

export default ComponentDetail;
