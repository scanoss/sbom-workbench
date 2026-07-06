import { ITask } from '../Task';
import { DependencyKnowledgeExtraction, FileStatusType } from '../../../api/types';
import { modelProvider } from '../../services/ModelProvider';
import { dependencyService } from '../../services/DependencyService';

export interface ReuseDependencyIdentificationTaskDTO {
  dependencyKnowledgeExtraction: DependencyKnowledgeExtraction;
  overwrite: boolean;
  path?: string;
}

/**
 * @brief creates new dependency identifications from dependency identifications extracted from another project
 * */
export class ReuseDependencyIdentificationTask implements ITask<void, void> {
  private readonly params: ReuseDependencyIdentificationTaskDTO;

  constructor(params: ReuseDependencyIdentificationTaskDTO) {
    this.params = params;
  }

  public async run(): Promise<void> {
    const extraction = this.params.dependencyKnowledgeExtraction;
    if (!extraction || Object.keys(extraction).length === 0) return;

    // Index the extracted dependency identifications by manifest path + purl.
    // Dependencies are correlated by path (manifest content changes over time, so md5 is unreliable).
    const extractedByKey = new Map<string, any>();
    for (const manifestPath of Object.keys(extraction)) {
      extraction[manifestPath].dependencies.forEach((dep) => extractedByKey.set(`${manifestPath}-${dep.purl}`, dep));
    }

    // Match local dependencies against the extracted identifications
    const localDependencies = await modelProvider.model.dependency.getAll(null);
    const dependenciesToAccept = [];
    localDependencies.forEach((dep: any) => {
      // Skip already identified dependencies unless overwriting
      if (dep.status === FileStatusType.IDENTIFIED && !this.params.overwrite) return;
      const extracted = extractedByKey.get(`${dep.path}-${dep.purl}`);
      if (!extracted) return;
      const licenses = extracted.licenses ? extracted.licenses.split(',').filter((l) => l) : [];
      // A declared dependency identification requires a license; skip incomplete ones
      if (licenses.length === 0) return;
      dep.version = extracted.version;
      dep.licenses = licenses;
      dep.scope = extracted.scope;
      dependenciesToAccept.push(dep);
    });

    if (dependenciesToAccept.length === 0) return;

    // Materializes licenses/components + declared dependency inventories
    await dependencyService.acceptAllByIds(dependenciesToAccept);

    // Persist the accepted version/license/scope on the dependency rows
    await modelProvider.model.dependency.updateBulk(dependenciesToAccept.map((d) => ({
      dependencyId: d.dependencyId,
      rejectedAt: null,
      scope: d.scope,
      purl: d.purl,
      version: d.version,
      licenses: d.licenses,
    })));
  }
}
