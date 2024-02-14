import sqlite3 from 'sqlite3';
import util from 'util';

export interface Lock {
  project: string;
  username: string;
  hostname: string;
  updatedAt: string;
  createdAt: string;
}

export class LockModel {
  private connection: sqlite3.Database;

  constructor(conn: sqlite3.Database) {
    this.connection = conn;
  }

  public setConnection(conn: sqlite3.Database) {
    this.connection = conn;
  }

  public async get(projectPath: string, username: string, hostname: string): Promise<Lock> {
    const call: any = util.promisify(this.connection.get.bind(this.connection));
    return await call(
      'SELECT l.project, l.username, l.hostname, l.createdAt , l.updatedAt FROM lock as l WHERE l.project = ? AND l.username = ? AND l.hostname = ?;',
      projectPath,
      username,
      hostname
    ); // filter by projectName
  }

  public async delete(projectPath: string, username: string, hostname: string): Promise<Lock> {
    const call: any = util.promisify(this.connection.run.bind(this.connection));
    const deletedRow = this.get(projectPath, username, hostname);
    await call('DELETE FROM lock WHERE project = ? AND username = ? AND hostname = ?;', projectPath, username, hostname);
    return deletedRow;
  }

  public async getByProjectPath(projectPath: string): Promise<Lock> {
    const call: any = util.promisify(this.connection.get.bind(this.connection));
    const lockedProject = await call('SELECT l.project, l.username, l.hostname, l.createdAt , l.updatedAt FROM lock as l WHERE l.project = ? ;', projectPath);
    return lockedProject;
  }

  public async create(data: { projectPath: string; username: string; hostname: string }): Promise<Lock> {
    const call: any = util.promisify(this.connection.get.bind(this.connection));
    await call(
      'INSERT INTO lock (project, username, hostname, createdAt, updatedAt) values(?,?,?,?,?);',
      data.projectPath,
      data.username,
      data.hostname,
      new Date().toISOString(),
      new Date().toISOString()
    );
    return this.get(data.projectPath, data.username, data.hostname);
  }

  public async update(data: { projectPath: string; username: string; hostname: string; createdAt: string; updatedAt: string }): Promise<Lock> {
    const call: any = util.promisify(this.connection.get.bind(this.connection));
    await call(
      'UPDATE lock SET  username=? , hostname=?, createdAt=?, updatedAt=? WHERE project = ?;',
      data.username,
      data.hostname,
      data.createdAt,
      data.updatedAt,
      data.projectPath
    );
    return this.get(data.projectPath, data.username, data.hostname);
  }

  public async updateTimer(data: { projectPath: string }): Promise<Lock> {
    const call: any = util.promisify(this.connection.get.bind(this.connection));
    await call('UPDATE lock SET  updatedAt=? WHERE project = ?;', new Date().toISOString(), data.projectPath);
    return this.getByProjectPath(data.projectPath);
  }
}
