/**
 * TOONER CLI Tool
 * Convert between JSON/YAML/TOML and TOON formats
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const program = new Command();

program
  .name('tooner')
  .description('Convert between JSON/YAML/TOML and TOON format')
  .version('0.1.0');

program
  .command('encode')
  .description('Encode input file to TOON format')
  .argument('<input>', 'Input file path')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option(
    '-f, --format <type>',
    'Input format (json/yaml/toml)',
    'json'
  )
  .action(async (input: string, options: {
    output?: string;
    format: string
  }) => {
    try {
      const inputPath = resolve(input);
      const content = readFileSync(inputPath, 'utf-8');

      let result: string;

      // Dynamically import based on format
      switch (options.format.toLowerCase()) {
        case 'json': {
          const { encode } = await import('../dist/json.js');
          result = encode(content);
          break;
        }
        case 'yaml':
        case 'yml': {
          const { encode } = await import('../dist/yaml.js');
          result = encode(content);
          break;
        }
        case 'toml': {
          const { encode } = await import('../dist/toml.js');
          result = encode(content);
          break;
        }
        default:
          console.error(`Unsupported format: ${options.format}`);
          process.exit(1);
      }

      if (options.output) {
        writeFileSync(options.output, result);
        console.log(`✓ Encoded to ${options.output}`);
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('decode')
  .description('Decode TOON file to specified format')
  .argument('<input>', 'TOON input file path')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option(
    '-f, --format <type>',
    'Output format (json/yaml/toml)',
    'json'
  )
  .action(async (input: string, options: {
    output?: string;
    format: string
  }) => {
    try {
      const inputPath = resolve(input);
      const content = readFileSync(inputPath, 'utf-8');

      let result: string;

      // Dynamically import based on format
      switch (options.format.toLowerCase()) {
        case 'json': {
          const { decode } = await import('../dist/json.js');
          result = decode(content);
          break;
        }
        case 'yaml':
        case 'yml': {
          const { decode } = await import('../dist/yaml.js');
          result = decode(content);
          break;
        }
        case 'toml': {
          const { decode } = await import('../dist/toml.js');
          result = decode(content);
          break;
        }
        default:
          console.error(`Unsupported format: ${options.format}`);
          process.exit(1);
      }

      if (options.output) {
        writeFileSync(options.output, result);
        console.log(`✓ Decoded to ${options.output}`);
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();

