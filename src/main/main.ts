import { app } from 'electron';
import { isCli, runCli } from './cli';
import { runApp } from './app';

// Run CLI
if (isCli()) {
  app
    .whenReady()
    .then(() => runCli())
    .catch((error) => {
      console.error(`[SCANOSS ERROR] ${error.message}`);
      app.exit(1);
      return;
    });
}
// Otherwise, run the app
runApp();

