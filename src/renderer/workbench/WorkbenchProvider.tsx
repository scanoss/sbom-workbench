import React, { useEffect, useState } from 'react';
import { workbenchController } from '../workbench-controller';

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  tree: [] | null;
  file: string | null;
  matchInfo: [] | null;
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
  const [matchInfo, setMatchInfo] = useState<[] | null>(null);

  useEffect(() => {
    if (scan && file) {
      const info = scan[file] as [];
      setMatchInfo(info);
    }
  }, [file]);

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

  return (
    <WorkbenchContext.Provider
      value={{
        loadScan,
        tree,
        setTree,
        file,
        matchInfo,
        setFile,
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export default WorkbenchProvider;
