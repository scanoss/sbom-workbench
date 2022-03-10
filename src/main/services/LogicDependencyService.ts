import { IDependencyResponse } from 'scanoss';
import { dependencyHelper } from '../helpers/DependencyHelper';
import { fileHelper } from '../helpers/FileHelper';
import { serviceProvider } from './ServiceProvider';

class LogicDependencyService {
  public async insert(dependencies: IDependencyResponse): Promise<void> {
    const filesDependencies = dependencyHelper.dependecyModelAdapter(dependencies);
    const files = await fileHelper.getPathFileId();
    await serviceProvider.model.dependency.insert(files, filesDependencies);
  }
}

export const logicDependencyService = new LogicDependencyService();
