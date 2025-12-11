import { app } from 'electron';
import { isCli, runCli } from './cli';
import { runApp } from './app';

async function main() {
  if (isCli()) {
    await runCli();
  }else{
    // Otherwise, run the app
    runApp();
  }
}
main()
