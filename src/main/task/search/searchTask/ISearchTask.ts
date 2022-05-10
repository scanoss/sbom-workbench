export interface ISearchTask {
  query: string;
  params? : {
    offset?: number;
    limit?: number;
    bool?: "or" | "and";
    tokenizer? : "strict" | "forward" | "reverse" | "full";
  }
}
