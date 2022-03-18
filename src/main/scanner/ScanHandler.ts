
import { EventEmitter } from 'events';
import { Scanner } from 'scanoss';
import { ScanState } from '../../api/types';
import { Project } from '../workspace/Project';

export abstract class ScanHandler extends EventEmitter {
  private msgToUI!: Electron.WebContents;

  protected scanner: Scanner;

  protected scannerState: ScanState;

  protected project: Project;

  constructor(project: Project, msgToUI: Electron.WebContents) {
    super();
    this.project = project;
    this.msgToUI = msgToUI;
  }

  public abstract init(): Promise<void>;

  sendToUI(eventName, data: any) {
    if (this.msgToUI) this.msgToUI.send(eventName, data);
  }

  public abstract scan(): Promise<void>;
}
