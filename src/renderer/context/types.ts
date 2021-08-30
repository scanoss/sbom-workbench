import { Inventory } from '../../api/types';

export enum DIALOG_ACTIONS {
  OK = 'ok',
  CANCEL = 'cancel',
  NEW = 'new',
}

export interface DialogResponse {
  action: DIALOG_ACTIONS;
  data?: any | null;
}
export interface InventorySelectorResponse {
  action: DIALOG_ACTIONS;
  inventory?: Inventory | null;
}

export interface InventoryForm {
  id?: string;
  component: string;
  version: string;
  license_name: string;
  url: string;
  purl: string;
  usage: string;
  notes: string;
}

