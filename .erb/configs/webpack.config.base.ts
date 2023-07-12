/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import path from 'path';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { dependencies as externals } from '../../release/app/package.json';
import UtilityProcessPlugin from '../plugins/UtilityProcessPlugin';

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    alias: {
      '@assets': path.resolve(__dirname, '../../assets/'),
      '@shared': path.resolve(__dirname, '../../src/shared/'),
      '@config': path.resolve(__dirname, '../../src/config/'),
      '@api': path.resolve(__dirname, '../../src/api/'),
      '@context': path.resolve(__dirname, '../../src/renderer/context/'),
      '@components': path.resolve(__dirname, '../../src/renderer/components/'),
      '@hooks': path.resolve(__dirname, '../../src/renderer/hooks/'),
      '@store': path.resolve(__dirname, '../../src/renderer/store/'),
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new MonacoWebpackPlugin(),

    new UtilityProcessPlugin(),
  ],
};

export default configuration;
