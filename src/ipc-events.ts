export enum IpcEvents {
  SCANNER_INIT_SCAN = 'SCANNER_INIT_SCAN',
  SCANNER_FINISH_SCAN = 'SCANNER_FINISH_SCAN',
}

export const ipcMainEvents = [
  IpcEvents.SCANNER_FINISH_SCAN,
];

export const ipcRendererEvents = [
  IpcEvents.SCANNER_INIT_SCAN,
]
