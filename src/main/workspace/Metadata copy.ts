import fs from 'fs';
import { ProjectState } from './Project';

export class Metadata {
  private myPath: string;

  private appVersion: string;

  private date: Date;

  private name: string;

  private workRoot: string;

  private scanRoot: string;

  private state: ProjectState;

  private fileCounter: number;


  constructor (mt: Metadata) {
      this.appVersion = mt.appVersion;
      this.date = mt.date;
      this.name = mt.name;
      // this.workRoot = fromFile.workRoot;
      // this.scanRoot = fromFile.scanRoot;
      // this.state = fromFile.state;
      // this.fileCounter = fromFile.fileCounter;

  }

  public static async buildFromPath(pathToMetadata: string): Promise<Metadata> {
    const data: Metadata = await Metadata.readOrCreateFromPath(pathToMetadata);
    const mt = new Metadata(data);
    mt.myPath = pathToMetadata;
    return mt;
  }


  private static async readOrCreateFromPath(pathToMetadata: string) {
    const objAsText = await fs.promises.readFile(pathToMetadata, 'utf8');
    return JSON.parse(objAsText);
  }

  public async save() {
    const str = JSON.stringify(this, null, 2);
    await fs.promises.writeFile(this.myPath, str);
  }

  public setFilesCount(c: number){
    this.fileCounter = c;
  }

  public setState(s: ProjectState) {
    this.state = s;
  }

  public getName(){
    return this.name;
  }

}
