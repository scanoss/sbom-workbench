import { Inventory } from '../../api/types';

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
  present: () => void;
  finish: ({ message }: { message?: string }) => void;
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
