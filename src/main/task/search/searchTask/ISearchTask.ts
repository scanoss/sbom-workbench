export interface ISearchTask {
  query: string;
  params?: {
    offset?: number;
    limit?: number;
    suggest?: boolean;
  };
}
