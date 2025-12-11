import { Command } from 'commander';
import { initCommand } from './init';
import { apiCommand } from './api';

export function configCommand(): Command {
  const config = new Command('config').description('Manage SBOM Workbench configuration');

  config.addCommand(initCommand());
  config.addCommand(apiCommand());
  return config;
}
