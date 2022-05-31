/**
 * Return a list of query terms by splitting the search query
 * @param querySearch The search query
 * @param regex The regex to split the query by. The default use same regex as the tokenizer
 */
import { familyToken } from './FamilyToken';

const getTerms = (querySearch: string, regex = /[\W_]+/): string[] => {
  return querySearch.split(regex);
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

export { getTerms, getTokensFamily };
