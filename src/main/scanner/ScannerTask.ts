import { EventEmitter } from 'events';
import { Scanner } from 'scanoss';
import { INewProject, ScanState } from '../../api/types';
import { Project } from '../workspace/Project';

export abstract class ScannerTask extends EventEmitter {
  protected msgToUI!: Electron.WebContents;

  protected scanner: Scanner;

  protected scannerState: ScanState;

  protected project: Project;

  constructor(msgToUI: Electron.WebContents) {
    super();
    this.msgToUI = msgToUI;
  }

  protected sendToUI(eventName, data: any) {
    if (this.msgToUI) this.msgToUI.send(eventName, data);
  }

  public abstract set(project: INewProject | string): Promise<void>;

  public abstract init(): Promise<void>;

  public abstract run(): Promise<void>;
}
