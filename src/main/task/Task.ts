export interface ITask<UseCasePort, UseCaseResult> {
  run(params: UseCasePort): Promise<UseCaseResult>;
}
