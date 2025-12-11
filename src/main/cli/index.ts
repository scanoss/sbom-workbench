/**
 * CLI entry point for SBOM Workbench
 *
 * Provides command-line interface for configuration tasks without launching the GUI.
 */

import { Command } from 'commander';
import { app } from 'electron';
import { configureApi } from './commands/configure-api';

// Global flags that always trigger CLI mode
const GLOBAL_CLI_FLAGS = ['--help', '-h', '--version', '-V'];

let program: Command | null = null;

/**
 * Creates and configures the CLI program
 */
function createProgram(): Command {
  const cmd = new Command();

  cmd
    .name('sbom-workbench')
    .description('SCANOSS SBOM Workbench - Software Composition Analysis Tool')
    .version(app.getVersion());

  cmd
    .command('configure-api')
    .description('Configure custom API settings without launching the GUI')
    .requiredOption('--url <url>', 'API URL (e.g., https://api.example.com)')
    .option('--api-key <key>', 'API key for authentication', '')
    .option('--add-alongside', 'Add API alongside existing ones instead of replacing')
    .action(async (options) => {
      await configureApi({
        url: options.url,
        apiKey: options.apiKey,
        addAlongside: options.addAlongside || false,
      });
    });

  return cmd;
}

/**
 * Gets or creates the CLI program instance
 */
function getProgram(): Command {
  if (!program) {
    program = createProgram();
  }
  return program;
}

/**
 * Checks if the application was invoked in CLI mode
 * Uses commander's registered commands for detection
 */
export function isCli(): boolean {
  const args = process.argv.slice(2);
  const prog = getProgram();

  // Get command names from commander
  const commandNames = prog.commands.map((cmd) => cmd.name());

  // Check if any arg matches a command or global flag
  return args.some((arg) => commandNames.includes(arg) || GLOBAL_CLI_FLAGS.includes(arg));
}

/**
 * Runs the CLI and handles commands
 */
export async function runCli(): Promise<void> {
  const prog = getProgram();

  try {
    await prog.parseAsync(process.argv);
  } catch (error: any) {
    console.error(`[SCANOSS ERROR] ${error.message}`);
    app.exit(1);
  }
}
