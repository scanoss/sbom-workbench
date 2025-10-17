import * as monaco from 'monaco-editor';

export class CodeViewerManager {
  public static readonly LEFT: string = 'left';

  public static readonly RIGHT: string = 'right';

  public static readonly MAIN: string = 'main';

  public static readonly CRYPTO: string = 'crypto';

  private mosaic: Map<string, monaco.editor.IStandaloneCodeEditor | null>;

  constructor() {
    this.mosaic = new Map();
    this.mosaic.set(CodeViewerManager.LEFT, null);
    this.mosaic.set(CodeViewerManager.RIGHT, null);
    this.mosaic.set(CodeViewerManager.MAIN, null);
    this.mosaic.set(CodeViewerManager.CRYPTO, null);
  }

  public set(key: string, editor: monaco.editor.IStandaloneCodeEditor | null): void {
    this.mosaic.set(key, editor);
  }

  public get(key: string): monaco.editor.IStandaloneCodeEditor | null {
    return this.mosaic.get(key);
  }
}

const CodeViewerManagerInstance = new CodeViewerManager();

export default CodeViewerManagerInstance;
