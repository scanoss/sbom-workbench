module.exports = {
  extends: [
    'erb',
    'airbnb',
    'airbnb-typescript',
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'error',
    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 'off',
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    'class-methods-use-this': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-explicit-any': ['off'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['off'],
    'prettier/prettier': ['off', { printWidth: 120 }],
    'max-len': ['warn', { code: 120, comments: 180 }],
    'no-nested-ternary': ['off'],
    'jsx-a11y/anchor-is-valid': ['off'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['warn'],
    '@typescript-eslint/naming-convention': ['warn'],
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'no-restricted-syntax': ['off'],
    'no-await-in-loop': ['off'],
    'no-async-promise-executor': ['off'],
    'react/no-array-index-key': ['warn'],
    'import/no-cycle': ['warn'],
    'no-empty-pattern': ['off'],
    'react-hooks/exhaustive-deps': 'warn',
    'no-plusplus': ['warn', { allowForLoopAfterthoughts: true }],
    'react/function-component-definition': ['off'],
    'no-param-reassign': ['off'],
    'react/jsx-one-expression-per-line': 'off',
    'object-curly-newline': 'off',
    'react/no-unstable-nested-components': 'off'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
