module.exports = function (api) {
  const plugins = [
    // Stage 2
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
    // Stage 3
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    '@babel/plugin-proposal-json-strings',
    [
      'transform-react-remove-prop-types',
      {
        removeImport: true,
      },
    ],
    'lodash',
  ];

  if (api.env('test')) {
    api.cache.using(() => process.env.NODE_ENV === 'test');
    return {
      presets: [
        [
          '@babel/preset-env',
          { targets: { node: 'current' }, modules: 'commonjs' },
        ],
        '@babel/react',
      ],
      plugins: [...plugins, 'dynamic-import-node'],
    };
  }

  api.cache.using(() => process.env.NODE_ENV !== 'test');

  return {
    env: {
      browser: {
        presets: [
          [
            '@babel/env',
            {
              forceAllTransforms: true,
              targets: {
                browsers: [
                  'Chrome 60',
                  'Firefox 57',
                  'iOS 9',
                  'Edge 14',
                  'ChromeAndroid 64',
                  'Safari 10',
                  'ie 11',
                ],
              },
              useBuiltIns: 'entry',
              corejs: '3.9',
              debug: false,
            },
          ],
          '@babel/react',
        ],
        plugins,
      },
      node: {
        presets: [
          [
            '@babel/preset-env',
            {
              forceAllTransforms: true,
              targets: {
                node: 'current',
              },
              modules: 'commonjs',
              useBuiltIns: 'entry',
              corejs: '3.9',
            },
          ],
          '@babel/react',
        ],
        plugins: [...plugins, 'dynamic-import-node'],
      },
    },
  };
};
