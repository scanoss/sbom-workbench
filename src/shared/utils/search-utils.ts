import { familyToken } from './FamilyToken';

/**
 * Return the default configuration for the search engine. It used by flexsearch on index and searcher creation.
 * @returns The default configuration
 */
const getSearchConfig = (): Record<string, any> => ({
  depth: 1,
  bidirectional: 0,
  resolution: 9,
  minlength: 2,
  stemmer: getDefaultStemmer(),
});

/**
 * Return the default stemmer for the search engine
 * @param language The language to use for the stemmer
 */
const getDefaultStemmer = (language = 'US'): Record<string, string> => {
  return {
    es: 'e',
    ed: 'e',
    ing: '',
  };
};

/**
 * Transform a query search in a list of tokens. This list will be enriched with the reverse of default stemmer.
 * @param text The search query
 * @return A list of tokens
 */
const unStemmify = (text: string): string[] => {
  const terms = getTerms(text);
  const stemms = [];
  terms.forEach(term => {
    Object.keys(getDefaultStemmer()).forEach(key => {
      if (term.endsWith(key)) {
        stemms.push(term.replace(key, getDefaultStemmer()[key]));
      }
    });
  });
  return terms.concat(stemms);
};

/**
 * Return a list of query terms by splitting the search query
 * @param querySearch The search query
 * @param regex The regex to split the query by. The default use same regex as the tokenizer
 */
const getTerms = (querySearch: string, regex = /[\W_]+/): string[] => {
  return querySearch.split(regex);
};

/**
 * Return a list of query terms by splitting the search query, including the tokens family
 * @param querySearch The search query
 * @param regex The regex to split the query by. The default use same regex as the tokenizer
 */
const getTermsFamily = (querySearch: string, regex = /[\W_]+/): string[] => {
  return getTerms(querySearch, regex).concat(
    getTerms(querySearch, regex)
      .map(getTokensFamily)
      .filter((item) => item)
      .flat()
  );
};

/**
 * Get tokens family associated to a single token
 * @param token The token to get the family
 */
const getTokensFamily = (token: string): string[] => {
  return familyToken.getFamily(token);
};

const addFamilyToken = (newFamily: Array<string>) => {
  familyToken.addFamily(newFamily);
};

export { getSearchConfig, unStemmify, getTerms, getTermsFamily, getTokensFamily };
