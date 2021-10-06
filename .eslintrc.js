module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    'class-methods-use-this': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-explicit-any': ['off'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['off'],
    'prettier/prettier': ['warn', { printWidth: 120 }],
    'no-nested-ternary': ['off'],
    'jsx-a11y/anchor-is-valid': ['off'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['warn'],
    '@typescript-eslint/naming-convention': ['warn'],
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
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
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
