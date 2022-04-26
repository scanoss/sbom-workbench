import React, { useContext, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { DIALOG_ACTIONS } from '@context/types';
import { Dependency, FileType } from '@api/types';
import { getExtension } from '@shared/utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { reset, selectDependencyState } from '@store/dependency-store/dependencySlice';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import { accept, acceptAll, getAll, reject, rejectAll, restore } from '@store/dependency-store/dependencyThunks';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { workbenchController } from '../../../../../../controllers/workbench-controller';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import CodeViewSelector, { CodeViewSelectorMode } from './components/CodeViewSelector/CodeViewSelector';
import DependencyTree from './components/DependencyTree/DependencyTree';
import NoLocalFile from './components/NoLocalFile/NoLocalFile';
import CodeEditor from '../../../../components/CodeEditor/CodeEditor';
import SearchBox from '../../../../../../components/SearchBox/SearchBox';
import WorkbenchDialogContext, { IWorkbenchDialogContext } from '../../../../../../context/WorkbenchDialogProvider';
import ActionButton from './components/ActionButton/ActionButton';

export interface FileContent {
  content: string | null;
  error: boolean;
}

const filter = (items, query) => {
  if (!items) {
    return null;
  }

  if (!query) {
    return items;
  }

  return items.filter((item) => {
    const name = item.purl.toLowerCase();
    return name.includes(query.toLowerCase());
  });
};

const MemoCodeEditor = React.memo(CodeEditor);

const DependencyViewer = () => {
  const dispatch = useDispatch();

  const workbenchDialogCtrl = useContext(WorkbenchDialogContext) as IWorkbenchDialogContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { dependencies, loading } = useSelector(selectDependencyState);
  const { path: scanBasePath, imported } = useSelector(selectWorkbench);
  const { node } = useSelector(selectNavigationState);

  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [view, setView] = useState<CodeViewSelectorMode>(CodeViewSelectorMode.GRAPH);

  const file = node?.type === 'file' ? node.path : null;
  const items: Array<Dependency> = filter(dependencies, searchQuery);
  const pendingItems: Array<Dependency> = items?.filter((item) => item.status === 'pending');
  const validItems: Array<Dependency> = pendingItems.filter((item) => item.valid);

  const init = () => {
    dispatch(reset());
    setLocalFileContent({ content: null, error: false });

    if (file) {
      dispatch(getAll(file));
      loadLocalFile(file);
    }
  };

  const loadLocalFile = async (path: string): Promise<void> => {
    try {
      setLocalFileContent({ content: null, error: false });
      const content = await workbenchController.fetchLocalFile(`${scanBasePath}/${path}`);
      if (content === FileType.BINARY) throw new Error(FileType.BINARY);
      setLocalFileContent({ content, error: false });
    } catch (error) {
      setLocalFileContent({ content: null, error: true });
    }
  };

  const onAcceptAllHandler = async () => {
    const message = `All valid pending dependencies will be accepted.
      <div class="custom-alert mt-3">
        <div class="MuiAlert-icon"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path></svg></div>
        <div class="MuiAlert-message">Those dependencies that lack the version or license details will not be accepted.</div>
      </div>`;

    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: 'Cancel', role: 'cancel' },
      { label: 'Accept All', action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(acceptAll({ dependencies: validItems }));
    }
  };

  const onDismissAllHandler = async () => {
    const message = `All pending dependencies will be dismissed.`;

    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: 'Cancel', role: 'cancel' },
      { label: 'Dismiss All', action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(rejectAll({ dependencyIds: pendingItems.map((item: Dependency) => item.dependencyId) }));
    }
  };

  const onAcceptHandler = async (dependency: Dependency) => {
    const { action, data } = await workbenchDialogCtrl.openDependencyDialog(dependency);
    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(accept(data));
    }
  };

  const onRestoreHandler = async (dependency) => {
    dispatch(restore(dependency.dependencyId));
  };

  const onRejectHandler = (dependency) => {
    dispatch(reject(dependency.dependencyId));
  };

  useEffect(() => {
    init();
  }, [file]);

  return (
    <>
      <section id="Dependency" className="app-page">
        <header className="app-header">
          <div className="d-flex space-between">
            <Breadcrumb />
            <CodeViewSelector active={view} setView={setView} />
          </div>
          <div className="d-flex align-center mb-2">
            <h3 className="mt-0 mb-0">Declared Dependencies</h3>
          </div>
          <section className="subheader">
            <div className="search-box">
              <SearchBox
                disabled={view === CodeViewSelectorMode.CODE}
                onChange={(value) => setSearchQuery(value.trim().toLowerCase())}
              />
            </div>

            <ActionButton
              count={[validItems.length, pendingItems.length]}
              onAcceptAll={onAcceptAllHandler}
              onDismissAll={onDismissAllHandler}
            />
          </section>
        </header>
        <main className="editors editors-full app-content">
          <div className="editor">
            {localFileContent?.content ? (
              <>
                {view === CodeViewSelectorMode.CODE ? (
                  <MemoCodeEditor language={getExtension(file)} content={localFileContent.content} highlight={null} />
                ) : (
                  <>
                    <div className="dependencies-tree-header mt-1 mb-2">
                      <div className="dependencies-tree-header-title">
                        <Typography variant="subtitle2">
                          Showing{' '}
                          <b>
                            {items.length} of {dependencies.length}
                          </b>{' '}
                          {dependencies.length > 1 ? 'dependencies' : 'dependency'} found in <b>{file}</b>
                        </Typography>
                      </div>
                    </div>

                    <DependencyTree
                      dependencies={items}
                      onDependencyAccept={onAcceptHandler}
                      onDependencyReject={onRejectHandler}
                      onDependencyRestore={onRestoreHandler}
                    />
                  </>
                )}
              </>
            ) : imported ? (
              <NoLocalFile />
            ) : null}
          </div>
        </main>
      </section>
    </>
  );
};

export default DependencyViewer;
