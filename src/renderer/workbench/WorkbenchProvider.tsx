import React, { useContext, useEffect, useState } from 'react';
import { workbenchController } from '../workbench-controller';
import { AppContext } from '../context/AppProvider';
import { Inventory } from '../../api/types';
import { inventoryService } from '../../api/inventory-service';
import * as scanUtil from '../../utils/scan-util';

export interface FileContent {
  content: string | null;
  error: boolean;
}

export interface Component {
  name: string;
  vendor: string;
  version: string;
  latest: string;
  url: string;
  purl: string[];
  licenses: any[];
  files: string[];
  count: {
    all: number;
    pending: number;
    ignored: number;
    identified: number;
  };
}

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  createInventory: (inventory: Inventory) => Promise<Inventory>;

  scan: Record<string, any> | null;
  tree: [] | null;
  file: string | null;
  components: Record<string, Component> | null;
  component: Component | null;
  matchInfo: Record<string, any> | null;
  localFileContent: FileContent | null;
  remoteFileContent: FileContent | null;
  setFile: (file: string) => void;
  setTree: (tree: []) => void;
  setComponent: (component) => void;
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

  const [components, setComponents] = useState<Record<
    string,
    Component
  > | null>(null);
  const [component, setComponent] = useState<Component | null>(null);

  const [file, setFile] = useState<string | null>(null);

  // TODO: remove from provider?
  const [matchInfo, setMatchInfo] = useState<Record<string, unknown> | null>(
    null
  );
  const [localFileContent, setLocalFileContent] = useState<FileContent | null>(
    null
  );
  const [remoteFileContent, setRemoteFileContent] =
    useState<FileContent | null>(null);

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
      console.log('file', scanBasePath + path);
      const content = await workbenchController.fetchLocalFile(
        scanBasePath + path
      );
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

  const createInventory = async (inventory: Inventory) => {
    const response = await inventoryService.create({
      ...inventory,
      files: component ? component.files : [],
    });
    const updateScan = scanUtil.updateTree(scan, inventory);
    setScan({ ...scan, ...updateScan });
    const updateComponents = scanUtil.getComponents(scan);
    setComponents(updateComponents);
    return inventory;
  };

  const resetWorkbench = () => {
    console.log('reset workbench provider');
    setFile(null);
    setScan(null);
    setTree(null);
    setComponents(null);
    setComponents(null);
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
        createInventory,
        scan,
        tree,
        setTree,
        file,
        matchInfo,
        localFileContent,
        remoteFileContent,
        setFile,
        components,
        component,
        setComponent,
        resetWorkbench,
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export default WorkbenchProvider;
