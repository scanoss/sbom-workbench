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


  constructor (fromFile: Metadata) {
      this.appVersion = fromFile.appVersion;
      this.date = fromFile.date;
      this.name = fromFile.name;
      // this.workRoot = fromFile.workRoot;
      // this.scanRoot = fromFile.scanRoot;
      // this.state = fromFile.state;
      // this.fileCounter = fromFile.fileCounter;

  }

  public static async build(pathToMetadata: string): Promise<Metadata> {
    const data: Metadata = await Metadata.readFromPath(pathToMetadata);
    const mt = new Metadata(data);
    mt.myPath = pathToMetadata;
    return mt;
  }

  private static async readFromPath(pathToMetadata: string) {
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
