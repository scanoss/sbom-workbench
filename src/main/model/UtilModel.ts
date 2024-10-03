import fs from 'fs';

class UtilModel {
  // READ RESULTS FROM A FILE
  public async readFile(path: string) {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(path, async (err: any, jsonString: any) => {
        if (err) reject(err);
        const result: any = JSON.parse(jsonString);
        resolve(result);
      });
    });
  }

  public async read(path: string) {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(path, async (err: any, result: any) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  getTimeStamp() {
    const time = new Date();
    const timeStamp = `${time.toISOString().split('.')[0]}Z`;
    return timeStamp;
  }
}

export const utilModel = new UtilModel();
