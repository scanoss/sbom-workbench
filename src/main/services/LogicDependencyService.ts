import { IDependencyResponse } from 'scanoss';
import { DependencyDTO } from '../../api/types';
import { dependencyHelper } from '../helpers/DependencyHelper';
import { fileHelper } from '../helpers/FileHelper';
import { QueryBuilderCreator } from '../queryBuilder/QueryBuilderCreator';
import { serviceProvider } from './ServiceProvider';

class LogicDependencyService {
  public async insert(dependencies: IDependencyResponse): Promise<void> {
    const filesDependencies = dependencyHelper.dependecyModelAdapter(dependencies);
    const files = await fileHelper.getPathFileId();
    await serviceProvider.model.dependency.insert(files, filesDependencies);
  }

  public async getAll(params: any): Promise<Array<DependencyDTO>> {
    const queryBuilder = QueryBuilderCreator.create(params);
    const dependencies = await serviceProvider.model.dependency.getAll(queryBuilder);
    return dependencies;
  }
}

export const logicDependencyService = new LogicDependencyService();
