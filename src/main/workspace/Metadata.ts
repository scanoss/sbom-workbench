import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { app } from 'electron';
import { IProject, ScanState } from '../../api/types';
import packageJson from '../../../release/app/package.json';
import { Scanner } from '../task/scanner/types';
import * as ScannerCFG from '../task/scanner/types';
import { workspace } from './Workspace';

export class Metadata {
  private appVersion: string;

  private date: string;

  private name: string;

  private work_root: string;

  private scan_root: string;

  private scannerState: ScanState;

  private files: number;

  private api: string;

  private apiKey: string;

  private token: string;

  private uuid: string;

  private default_license: string;

  private source: string;

  private scannerConfig: Scanner.ScannerConfig;

  private sourceCodePath: string;

  constructor(name: string) {
    this.name = name;
    this.appVersion = app.isPackaged === true ? app.getVersion() : packageJson.version;
    this.date = new Date().toISOString();
    this.uuid = uuidv4();
  }

  public static async readFromPath(pathToProject: string): Promise<Metadata> {
    const data: Metadata = JSON.parse(await fs.promises.readFile(`${pathToProject}/metadata.json`, 'utf8'));
    return Object.assign(Object.create(Metadata.prototype), data);
  }

  public save(): void {
    const str = JSON.stringify(this, null, 2);
    fs.writeFileSync(`${this.getMyPath()}/metadata.json`, str);
  }

  public setAppVersion(appVersion: string) {
    this.appVersion = appVersion;
  }

  public getVersion(): string {
    return this.appVersion;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setDate(date: string) {
    this.date = date;
  }

  public getDate(): string {
    return this.date;
  }

  public setMyPath(workRoot: string) {
    this.work_root = workRoot;
  }

  public getWorkRoot() {
    return this.work_root;
  }

  public setScanRoot(scanRoot: string) {
    this.scan_root = scanRoot;
  }

  public setScannerState(s: ScanState) {
    this.scannerState = s;
  }

  public getScannerState(): ScanState {
    return this.scannerState;
  }

  public setApi(api: string) {
    this.api = api;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public setUuid(uuid: string) {
    this.uuid = uuid;
  }

  public setFileCounter(c: number) {
    this.files = c;
  }

  public setLicense(license: string) {
    this.default_license = license;
  }

  public setSource(source: string) {
    this.source = source;
  }

  public getSource(): string {
    return this.source;
  }

  public getName() {
    return this.name;
  }

  public getMyPath(): string {
    return `${workspace.getMyPath()}/${this.work_root}`;
  }

  public getUUID(): string {
    return this.uuid;
  }

  public getScanRoot() {
    return this.scan_root;
  }

  public getState() {
    return this.scannerState;
  }

  public getLicense(): string {
    return this.default_license;
  }

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public getApi(): string {
    return this.api;
  }

  public getToken(): string {
    return this.token;
  }

  public getScannerConfig(): ScannerCFG.Scanner.ScannerConfig {
    return this.scannerConfig;
  }

  public setScannerConfig(value: ScannerCFG.Scanner.ScannerConfig) {
    this.scannerConfig = value;
  }

  public setSourceCodePath(sourceCodePath: string) {
    this.sourceCodePath = sourceCodePath;
  }

  public getSourceCodePath() {
    return this.sourceCodePath;
  }

  public getDto(): IProject {
    const Ip: IProject = {
      appVersion: this.appVersion,
      date: this.date,
      name: this.name,
      work_root: this.work_root,
      scan_root: this.scan_root,
      scannerState: this.scannerState,
      files: this.files,
      api: this.api,
      token: this.token,
      uuid: this.uuid,
      default_license: this.default_license,
      api_key: this.apiKey,
      source: this.source,
      scannerConfig: this.scannerConfig,
      sourceCodePath: this.sourceCodePath,
    };
    return Ip;
  }
}
