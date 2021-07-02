export enum IpcEvents {
  SCANNER_INIT_SCAN = 'SCANNER_INIT_SCAN',
  SCANNER_FINISH_SCAN = 'SCANNER_FINISH_SCAN',

  INVENTORY_CREATE = 'INVENTORY_CREATE',
  INVENTORY_GET = 'INVENTORY_GET',
}

export const ipcMainEvents = [IpcEvents.SCANNER_FINISH_SCAN];

export const ipcRendererEvents = [
  IpcEvents.SCANNER_INIT_SCAN,
  IpcEvents.INVENTORY_CREATE,
  IpcEvents.INVENTORY_GET,
];
