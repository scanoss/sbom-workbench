/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../scripts/CheckNodeEnv';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';

CheckNodeEnv('production');
DeleteSourceMaps();

const devtoolsConfig = process.env.DEBUG_PROD === 'true' ? {
  devtool: 'source-map'
} : {};

export default merge(baseConfig, {
  ...devtoolsConfig,

  mode: 'production',

  target: 'electron-renderer',

  entry: [
    'core-js',
    'regenerator-runtime/runtime',
    path.join(__dirname, '../../src/renderer/index.tsx'),
  ],

  output: {
    path: path.join(__dirname, '../../src/dist'),
    filename: 'renderer.prod.js',
  },

  module: {
    rules: [
      {
        test: /\.s?(a|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
        include: /\.module\.s?(c|a)ss$/,
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /\.module\.s?(c|a)ss$/,
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      // Images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer:
      [
        new TerserPlugin({
          parallel: true,
        }),
        new CssMinimizerPlugin(),
      ],
  },

  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
    }),

    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
