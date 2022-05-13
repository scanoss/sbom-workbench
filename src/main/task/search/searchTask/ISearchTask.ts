export interface ISearchTask {
  query: string;
  params? : {
    offset?: number;
    limit?: number;
    bool?: "or" | "and";
    tokenize ? : "strict" | "forward" | "reverse" | "full";
  }
}
