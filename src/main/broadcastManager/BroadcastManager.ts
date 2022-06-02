class BroadcastManager {
private event: Electron.WebContents;

  public set(event: Electron.WebContents){
    this.event = event;
  }

  public get():Electron.WebContents{
    return this.event;
  }

}

export const broadcastManager = new BroadcastManager();
