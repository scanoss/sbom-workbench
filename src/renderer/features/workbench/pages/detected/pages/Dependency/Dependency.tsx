import React, { useContext, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { DIALOG_ACTIONS } from '@context/types';
import { dependencyService } from '@api/services/dependency.service';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { AppContext, IAppContext } from '@context/AppProvider';
import { Dependency, FileType } from '@api/types';
import { getExtension } from '@shared/utils/utils';
import { DeclaredDependencyContext, IDeclaredDependencyContext } from '@context/DeclaredDependencyProvider';
import { IWorkbenchContext, WorkbenchContext } from '../../../../store';
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
  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;
  const store = useContext(DeclaredDependencyContext) as IDeclaredDependencyContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const workbenchDialogCtrl = useContext(WorkbenchDialogContext) as IWorkbenchDialogContext;

  const { imported } = state;

  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [view, setView] = useState<CodeViewSelectorMode>(CodeViewSelectorMode.GRAPH);

  const file = state.node?.type === 'file' ? state.node.path : null;
  const items: Array<Dependency> = filter(dependencies, searchQuery);
  const pendingItems: Array<Dependency> = items?.filter((item) => item.status === 'pending');
  const validItems: Array<Dependency> = pendingItems.filter((item) => item.valid);

  const init = () => {
    setLocalFileContent({ content: null, error: false });
    setDependencies([]);

    if (file) {
      loadLocalFile(file);
      getDependencies(file);
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

  const getDependencies = async (path: string): Promise<any> => {
    const dep = await dependencyService.getAll({ path });
    setDependencies(dep);
  };

  const onAcceptAllHandler = async () => {
    store.acceptAll(validItems);
  };

  const onDismissAllHandler = async () => {
    store.rejectAll({ dependencyIds: pendingItems.map((item: Dependency) => item.dependencyId) });
  };

  const onAcceptHandler = async (dependency: Dependency) => {
    const { action, data } = await workbenchDialogCtrl.openDependencyDialog(dependency);
    if (action === DIALOG_ACTIONS.CANCEL) return;

    store.accept(data);
  };

  const onRestoreHandler = async (dependency) => {
    store.restore(dependency.dependencyId);
  };

  const onRejectHandler = (dependency) => {
    store.reject(dependency.dependencyId);
  };

  useEffect(() => {
    init();
  }, [file]);

  useEffect(() => {
    if (!store.loading && file) getDependencies(file);
  }, [store.loading]); // TODO: remove this after migrate to redux

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
