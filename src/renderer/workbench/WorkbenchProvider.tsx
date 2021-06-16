import React, { useEffect, useState } from 'react';
import { workbenchController } from '../workbench-controller';

export interface FileContent {
  content: string | null;
  error: boolean;
}

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  tree: [] | null;
  file: string | null;
  matchInfo: Record<string, unknown> | null;
  localFileContent: FileContent | null;
  remoteFileContent: FileContent | null;
  setFile: (file: string) => void;
  setTree: (tree: []) => void;
}

export const WorkbenchContext = React.createContext<IWorkbenchContext | null>(
  null
);

export const WorkbenchProvider: React.FC<IWorkbenchContext> = ({
  children,
}) => {
  const [tree, setTree] = useState<[] | null>(null);
  const [scan, setScan] = useState<Record<string, unknown> | null>(null);

  const [file, setFile] = useState<string | null>(null);
  const [matchInfo, setMatchInfo] = useState<Record<string, unknown> | null>(
    null
  );

  // TODO: remove from provider? in Editor?
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
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const loadLocalFile = async (path: string): Promise<void> => {
    try {
      const content = await workbenchController.fetchLocalFile(path);
      setLocalFileContent({ content, error: false });
    } catch (error) {
      setLocalFileContent({ content: null, error: true });
    }
  };

  const loadRemoteFile = async (path: string): Promise<void> => {
    try {
      const content = await workbenchController.fetchRemoteFile(path);
      setRemoteFileContent({ content, error: false });
    } catch (error) {
      setRemoteFileContent({ content: null, error: true });
    }
  };

  useEffect(() => {
    if (scan && file) {
      const [info] = scan[file];
      setMatchInfo(info);
      loadLocalFile(file);
      loadRemoteFile(info.file_hash);
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
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export default WorkbenchProvider;
