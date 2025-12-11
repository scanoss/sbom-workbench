import { Command } from 'commander';
import { listCommand } from './list';
import { addCommand } from './add';
import { rmCommand } from './rm';
import { defaultCommand } from './default';

export function apiCommand(): Command {
  const api = new Command('api').description('Manage API configurations');

  api.addCommand(listCommand());
  api.addCommand(addCommand());
  api.addCommand(rmCommand());
  api.addCommand(defaultCommand());
  return api;
}
