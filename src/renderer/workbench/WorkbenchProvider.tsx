import React, { useContext, useEffect, useState } from 'react';
import { workbenchController } from '../workbench-controller';
import { AppContext } from '../context/AppProvider';

export interface FileContent {
  content: string | null;
  error: boolean;
}

interface Component {
  component: string;
  vendor: string;
  version: string;
  latest: string;
  url: string;
}

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  tree: [] | null;
  file: string | null;
  matchInfo: Record<string, any> | null;
  localFileContent: FileContent | null;
  remoteFileContent: FileContent | null;
  setFile: (file: string) => void;
  setTree: (tree: []) => void;
  resetWorkbench: () => void;
}

export const WorkbenchContext = React.createContext<IWorkbenchContext | null>(
  null
);


export const WorkbenchProvider: React.FC<IWorkbenchContext> = ({
  children,
}) => {
  const { scanBasePath } = useContext<any>(AppContext);

  const [tree, setTree] = useState<[] | null>(null);
  const [scan, setScan] = useState<Record<string, unknown> | null>(null);

  const [components, setComponents] = useState<Component[] | null>(null);
  const [component, setComponent] = useState<Component | null>(null);

  const [file, setFile] = useState<string | null>(null);

  // TODO: remove from provider?
  const [matchInfo, setMatchInfo] = useState<Record<string, unknown> | null>(
    null
  );
  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(
    null
  );
  const [
    remoteFileContent,
    setRemoteFileContent,
  ] = useState<FileContent | null>(null);

  const loadScan = async (path: string) => {
    try {
      const scanResult = await workbenchController.loadScan(path);
      setScan(scanResult.scan);
      setTree(scanResult.fileTree);
      setComponents(scanResult.components);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const loadLocalFile = async (path: string): Promise<void> => {
    try {
      setLocalFileContent({ content: null, error: false });
      console.log("file", scanBasePath + path);
      const content = await workbenchController.fetchLocalFile(scanBasePath + path);
      setLocalFileContent({ content, error: false });
    } catch (error) {
      setLocalFileContent({ content: null, error: true });
    }
  };

  const loadRemoteFile = async (path: string): Promise<void> => {
    try {
      setRemoteFileContent({ content: null, error: false });
      const content = await workbenchController.fetchRemoteFile(path);
      setRemoteFileContent({ content, error: false });
    } catch (error) {
      setRemoteFileContent({ content: null, error: true });
    }
  };

  const resetWorkbench = () => {
    console.log('reset workbench provider');
    setFile(null);
    setScan(null);
    setTree(null);
  };

  useEffect(() => {
    if (scan && file) {
      const [info] = scan[file];
      loadLocalFile(file);
      if (info.id !== 'none') {
        loadRemoteFile(info.file_hash);
        setMatchInfo(info);
      } else {
        setRemoteFileContent({ content: null, error: false });
        setMatchInfo(null);
      }
    }
  }, [file, scan]);

  return (
    <WorkbenchContext.Provider
      value={{
        loadScan,
        tree,
        setTree,
        file,
        matchInfo,
        localFileContent,
        remoteFileContent,
        setFile,
        resetWorkbench,
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export default WorkbenchProvider;
