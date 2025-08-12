import { Inventory, ProjectAccessMode } from '@api/types';
import { Scanner } from '../../main/task/scanner/types';

export enum DIALOG_ACTIONS {
  OK = 'ok',
  CANCEL = 'cancel',
  NEW = 'new',
}

export interface DialogResponse {
  action: DIALOG_ACTIONS | string;
  data?: any | null;
}
export interface InventorySelectorResponse {
  action: DIALOG_ACTIONS;
  inventory?: Inventory | null;
}

export interface LoaderController {
  present: ({ message }?: { message?: React.ReactNode }) => void;
  finish: ({ message }: { message?: React.ReactNode }) => void;
  dismiss: ({ delay }?: { delay?: number }) => void;
}

export interface InventoryForm {
  id?: number;
  component: string;
  version: string;
  spdxid: string;
  url: string;
  purl: string;
  usage: string;
  notes: string;
}

export interface IScan {
  projectName?: string;
  path: string;
  sourceCodePath?: string;
  action: string;
  source?: Scanner.ScannerSource,
  mode?: ProjectAccessMode,
}

export interface ImportProjectDialogProps {
  title: string;
  placeHolder: string;
  openDialogProperties: Electron.OpenDialogOptions;
}
