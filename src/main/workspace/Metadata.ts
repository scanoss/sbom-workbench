import fs from 'fs';
import { ProjectState } from './Project';
import { app } from 'electron';
import { IProject } from '../../api/types';


export class Metadata {
  private myPath: string;

  private appVersion: string;

  private date: string;

  private name: string;

  private workRoot: string;

  private scanRoot: string;

  private state: ProjectState;

  private fileCounter: number;

  private api: string;

  private token: string;

  private uuid: string;

  constructor(name: string, scanPath: string) {
    this.name = name;
    this.scanRoot = scanPath;
    this.appVersion = app.getVersion();
    this.date = new Date().toISOString();
    this.uuid = (Math.random() * 9999999).toString();
  }

  public static async readFromPath(pathToMetadata: string): Promise<Metadata> {

    const mtDto: Metadata = JSON.parse(await fs.promises.readFile(pathToMetadata, 'utf8'));
    const mt = new Metadata('', '');



    mt.setMyPath(mtDto.myPath);
    mt.setAppVersion(mtDto.appVersion);
    mt.setDate(mtDto.date);
    mt.setName(mtDto.name);
    mt.setWorkRoot(mtDto.workRoot);
    mt.setScanRoot(mtDto.scanRoot);
    mt.setState(mtDto.state);
    mt.setFileCounter(mtDto.fileCounter);
    mt.setApi(mtDto.api);
    mt.setToken(mtDto.token);
    mt.setUuid(mtDto.uuid);


    mt.myPath = pathToMetadata;

    return mt;
  }

  public static async new(pathToMetadata: string, name: string, scanPath: string): Promise<Metadata> {
    const mt: Metadata = new Metadata(name, scanPath);
    mt.myPath = pathToMetadata;
    const str = JSON.stringify(this, null, 2);
    await fs.promises.writeFile(pathToMetadata, str);
    return mt;
  }

  public async save() {
    // const str = JSON.stringify(this, null, 2);
    // await fs.promises.writeFile(this.myPath, str);
  }





  public setMyPath(myPath: string) {
    this.myPath = myPath;
    this.save();
  }

  public setAppVersion(appVersion: string) {
    this.appVersion = appVersion;
    this.save();
  }

  public setName(name: string){
    this.name = name;
    this.save();
  }

  public setDate(date: string){
    this.date = date;
  }

  public setWorkRoot(workRoot: string) {
    this.workRoot= workRoot;
    this.save();
  }

  public setScanRoot(scanRoot: string) {
    this.scanRoot=scanRoot;
    this.save();
  }

  public setState(s: ProjectState) {
    this.state = s;
    this.save();
  }

  public setApi(api: string) {
    this.api = api;
    this.save();
  }

  public setToken(token: string) {
    this.token = token;
    this.save();
  }


 public setUuid(uuid: string){
   this.uuid = uuid;
   this.save();
 }

  public setFileCounter(c: number){
    this.fileCounter = c;
    this.save();
  }




  public getName(){
    return this.name;
  }

  public getMyPath() {
    return this.myPath;
  }

  public getUUID() {
    return this.uuid;
  }

  public getDto(): IProject {
    const Ip: IProject = {
      appVersion: this.appVersion,
      date: this.date,
      name: this.name,
      workRoot: this.workRoot,
      scanRoot: this.scanRoot,
      state: this.state,
      fileCounter: this.fileCounter,
      api: this.api,
      token: this.token,
      uuid: this.uuid,
    };
    return Ip;
  }
}
