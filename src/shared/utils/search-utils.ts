/**
 * Version of the keyword search index. Bump it when the index config changes so
 * dictionaries built with an older config are detected and rebuilt.
 */
const SEARCH_INDEX_VERSION = 2;

// Dictionaries without a version file were built before versioning existed.
const LEGACY_INDEX_VERSION = 1;

const SEARCH_INDEX_FOLDER = 'dictionary';

const SEARCH_INDEX_VERSION_FILE = 'version.json';

const NGRAM_SIZE = 3;

// Caps the n-grams produced by very long tokens (minified code, base64 blobs).
const MAX_TOKEN_LENGTH = 256;

/**
 * Turns each token into its unique character trigrams, so a keyword matches anywhere
 * inside a word ("crypt" in "encryption"). Tokens shorter than a trigram are kept whole.
 */
const toTrigrams = (tokens: string[]): string[] => {
  const grams = new Set<string>();
  tokens.forEach((token) => {
    const t = token.length > MAX_TOKEN_LENGTH ? token.slice(0, MAX_TOKEN_LENGTH) : token;
    if (t.length < NGRAM_SIZE) {
      grams.add(t);
      return;
    }
    for (let i = 0; i + NGRAM_SIZE <= t.length; i += 1) grams.add(t.substring(i, i + NGRAM_SIZE));
  });
  return Array.from(grams);
};

/**
 * Flexsearch config shared by the indexer and the searcher. Dedupe and numeric are disabled:
 * they collapse repeated letters and split numbers, which yields false positives.
 */
const getSearchConfig = (): Record<string, any> => ({
  tokenize: 'strict',
  resolution: 1,
  fastupdate: false,
  cache: false,
  encoder: {
    normalize: false,
    dedupe: false,
    numeric: false,
    cache: false,
    minlength: 1,
    // The default drops long tokens entirely; toTrigrams truncates them instead.
    maxlength: Number.MAX_SAFE_INTEGER,
    prepare: (text: string) => text.toLowerCase(),
    finalize: toTrigrams,
  },
});

/**
 * Configuration of dictionaries built before SEARCH_INDEX_VERSION existed.
 */
const getLegacySearchConfig = (): Record<string, any> => ({
  depth: 1,
  bidirectional: 0,
  resolution: 9,
  minlength: 2,
  stemmer: { es: 'e', ed: 'e', ing: '' },
});

/**
 * Transform a query search in a list of crypto tokens.
 * @param text The search query
 * @return A list of tokens
 */
const unStemmifyCryptoKeywords = (text: string): string[] => {
  if(!text) return [];
  return text.replace(/[{}]/g, '').split(/,/).map(t => t.trim());
};

/**
 * Return a list of query terms by splitting the search query
 * @param querySearch The search query
 * @param regex The regex to split the query by. The default use same regex as the tokenizer
 */
const getTerms = (querySearch: string, regex = /[^\p{L}\p{N}]+/u): string[] => {
  return querySearch.split(regex);
};

/**
 * Returns the unique lowercase terms of a query.
 */
const getQueryTerms = (query: string): string[] => Array.from(
  new Set(getTerms(query.toLowerCase()).filter((t) => t.length > 0)),
);

/**
 * True when index hits need no verification: a 3-char term is itself a trigram, and shorter
 * terms are indexed whole, so they match whole words as before trigrams.
 */
const isExactIndexQuery = (terms: string[]): boolean => terms.length === 1 && terms[0].length <= NGRAM_SIZE;

const containsAllTerms = (content: string, terms: string[]): boolean => {
  const text = content.toLowerCase();
  return terms.every((t) => text.includes(t));
};

export {
  SEARCH_INDEX_VERSION,
  LEGACY_INDEX_VERSION,
  SEARCH_INDEX_FOLDER,
  SEARCH_INDEX_VERSION_FILE,
  NGRAM_SIZE,
  getSearchConfig,
  getLegacySearchConfig,
  getTerms,
  getQueryTerms,
  isExactIndexQuery,
  containsAllTerms,
  unStemmifyCryptoKeywords,
};
