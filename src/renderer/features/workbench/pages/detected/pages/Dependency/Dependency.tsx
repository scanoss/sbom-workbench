import React, { useContext, useEffect, useState } from 'react';
import { Button, Typography } from '@material-ui/core';
import { IWorkbenchContext, WorkbenchContext } from '../../../../store';
import { DialogContext, IDialogContext } from '../../../../../../context/DialogProvider';
import { workbenchController } from '../../../../../../controllers/workbench-controller';
import { AppContext, IAppContext } from '../../../../../../context/AppProvider';
import { DependencyDTO, FileType } from '../../../../../../../api/types';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import { getExtension } from '../../../../../../../shared/utils/utils';
import CodeViewSelector, { CodeViewSelectorMode } from './components/CodeViewSelector/CodeViewSelector';
import DependencyTree from './components/DependencyTree/DependencyTree';
import NoLocalFile from './components/NoLocalFile/NoLocalFile';
import { dependencyService } from '../../../../../../../api/services/dependency.service';
import CodeEditor from '../../../../components/CodeEditor/CodeEditor';
import SearchBox from '../../../../../../components/SearchBox/SearchBox';
import { DIALOG_ACTIONS } from '../../../../../../context/types';

const MemoCodeEditor = React.memo(CodeEditor);

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

  const result = items.filter((item) => {
    const name = item.purl.toLowerCase();
    return name.includes(query.toLowerCase());
  });

  return result;
};

const validDependencies = (filteredDependencies) => {
  return filteredDependencies?.filter((item) => item.valid === true && item.status === 'pending');
};

const Dependency = () => {
  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { imported } = state;

  const file = state.node?.type === 'file' ? state.node.path : null;

  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(null);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [view, setView] = useState<CodeViewSelectorMode>(CodeViewSelectorMode.GRAPH);

  const items = filter(dependencies, searchQuery);
  const validDep: Array<DependencyDTO> = validDependencies(items);

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
    const { action } = await dialogCtrl.openAlertDialog('Are you sure you want to accept all dependencies?', [
      { label: 'Cancel', role: 'cancel' },
      { label: 'Accept All', action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      await dependencyService.acceptAll(validDep);
      getDependencies(file);
    }
  };

  const onAcceptHandler = async (dependency) => {
    await dependencyService.accept(dependency);
    getDependencies(file);
  };

  const onRestoreHandler = async (dependency) => {
    await dependencyService.restore(dependency.dependencyId);
    getDependencies(file);
  };

  const onRejectHandler = async (dependency) => {
    await dependencyService.reject(dependency.dependencyId);
    getDependencies(file);
  };

  useEffect(() => {
    init();
  }, [file]);

  return (
    <>
      <section id="Dependency" className="app-page">
        <header className="app-header">
          <Breadcrumb />
          <div className="d-flex align-center mb-2">
            <CodeViewSelector active={view} setView={setView} />
            <h3 className="mt-0 mb-0">Declared Dependencies</h3>
          </div>

          <section className="subheader">
            <div className="search-box">
              <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
            </div>

            <Button
              size="small"
              disabled={validDep.length === 0}
              variant="contained"
              color="secondary"
              onClick={onAcceptAllHandler}
            >
              Accept All ({validDep.length})
            </Button>
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
                          <b>
                            {items.length}/{dependencies.length}
                          </b>{' '}
                          {dependencies.length > 1 ? 'dependencies' : 'dependency'} found
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

export default Dependency;
