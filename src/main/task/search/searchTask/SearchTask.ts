import { Searcher }  from "../../../modules/searchEngine/searcher/Searcher";
import { workspace } from "../../../workspace/Workspace";
import { ITask } from "../../Task";
import { modelProvider } from "../../../services/ModelProvider";
import { ISearchTask } from "./ISearchTask";
import { QueryBuilderCreator } from "../../../model/queryBuilder/QueryBuilderCreator";

export class SearchTask implements ITask<ISearchTask, ISearchTask> {
  private searcher : Searcher;

  constructor() {
    this.searcher = new Searcher();
    this.searcher.loadIndex(`${workspace.getOpenProject().getMyPath()}/dictionary/`);
  }

  public async run(params : ISearchTask): Promise<ISearchTask> {
    const fileIds = this.searcher.search(params);
    const results = (await modelProvider.model.file.getAll(QueryBuilderCreator.create({ fileId: fileIds }))) as unknown as ISearchTask;
    return results;
  }

}
