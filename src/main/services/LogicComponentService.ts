import { Component } from '../../api/types';
import { ComponentSource } from '../db/scan_component_db';
import { workspace } from '../workspace/Workspace';

class LogicComponentService {
  public async getAll(): Promise<Component> {
    try {
      const project = workspace.getOpenedProjects()[0];
      const component = await project.scans_db.components.getAll({ source: ComponentSource.ENGINE });
      return component;
    } catch (error: any) {
      return error;
    }
  }
}

export const logicComponentService = new LogicComponentService();
