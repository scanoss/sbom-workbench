import {
  Compiler,
  Configuration,
  WebpackPluginInstance,
  webpack,
} from 'webpack';

const DEFAULT_CONF: Readonly<Configuration> = {
  entry: {
    scanner: './src/main/threads/scanner.ts',
  },
  target: 'node',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  // TODO: find a way to infer this based on whether we run electron-forge start or package.
  mode: 'development',
};

export default class UtilityProcessPlugin implements WebpackPluginInstance {
  options: any;

  constructor(options: Configuration | null = null) {
    this.options = {
      ...DEFAULT_CONF,
      ...options,
    };
  }

  apply(compiler: Compiler): void {
    // TODO: should be works only in main process

    compiler.hooks.compilation.tap('UtilityProcessPlugin', (compilation) => {
      const options = {
        ...this.options,
        output: {
          path: compilation.outputOptions.path,
          filename: '[name].js',
        },
      };

      webpack(options, (err, stats) => {
        if (err) {
          throw new Error(err.toString());
        }
        if (stats?.hasErrors()) {
          const json = stats.toJson();
          for (const error of json.errors ?? []) {
            throw new Error(`${error.message}\n${error.stack}`);
          }
        }
      });
    });
  }
}
