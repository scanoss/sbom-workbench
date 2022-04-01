interface ITask <T> {
  run(): Promise<T>;
}
