export interface ITask<T> {
  run(params: T): Promise<T>;
}
