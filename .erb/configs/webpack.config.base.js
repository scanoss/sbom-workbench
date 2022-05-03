/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { dependencies as externals } from '../../src/package.json';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

export default {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, '../../src'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '../../src'), 'node_modules'],
    alias: {
      '@assets': path.resolve(__dirname, '../../assets/'),
      '@shared': path.resolve(__dirname, '../../src/shared/'),
      '@config': path.resolve(__dirname, '../../src/config/'),
      '@api': path.resolve(__dirname, '../../src/api/'),
      '@context': path.resolve(__dirname, '../../src/renderer/context/'),
      '@components': path.resolve(__dirname, '../../src/renderer/components/'),
      '@hooks': path.resolve(__dirname, '../../src/renderer/hooks/'),
      '@store': path.resolve(__dirname, '../../src/renderer/store/'),
    }
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
};
