import path from 'path';

const commonExtends = ['eslint:recommended', 'prettier'];
const commonPlugins = [ 'react', 'prettier' ];
const testExtends = ['plugin:jest/recommended']
const testPlugins = ['jest', 'react' ];
const testEnvs = {
  jest: true,
  'jest/globals': true,
  mocha: true,
}

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', ...commonExtends],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    babelOptions: {
      configFile: 'babel.config.js',
    },
  },
  plugins: ['jsx-a11y', ...commonPlugins],
  rules: {
    'prettier/prettier': ['error'],
  },
  globals: {
    global: 'writable',
  },
  overrides: [
    {
      files: ['scripts/*.js', 'testing/*.js', 'config/*.js', '.eslintrc.js', '*.config.js'],
      env: {
        node: true,
        ...testEnvs,
      },
      extends: ['plugin:node/recommended', ...testExtends,...commonExtends],
      plugins: ['jest', 'mocha', ...commonPlugins],
    },
    {
      files: [
        'src/components/**/*.unit.spec.jsx',
        'src/helpers/*.unit.spec.js',
      ],
      env: {
        node: true,
        ...testEnvs,
      },
      extends: [...testExtends, ...commonExtends],
      plugins: [...testPlugins, ...commonPlugins],
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        babelOptions: {
          configFile: './config/babel.config.js',
        },
      },
    },
  ],
};
