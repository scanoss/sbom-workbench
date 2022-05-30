/**
 * Return a list of query terms by splitting the search query
 * @param querySearch The search query
 * @param regex The regex to split the query by. The default use same regex as the tokenizer
 */
const getTerms = (querySearch: string, regex = /[\W_]+/): string[] => {
  return querySearch.split(regex);
};

/**
 * Get tokens family asocciated to a single token
 * @param token The token to get the family
 */
const getTokensFamily = (token: string): string[] => {
  const data = {
    licensed: ['licensed', 'licenses'],
    licenses: ['licensed', 'licenses'],
    license: ['licensed', 'licenses'],
  };

  return data[token] ?? null;
};

export {
  getTerms,
}
