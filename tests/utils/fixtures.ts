import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface TestCase {
  name: string;
  input: unknown;
  expected: unknown;
  specSection: string;
  note?: string;
  options?: Record<string, unknown>;
}

export interface TestFixture {
  version: string;
  category: 'encode' | 'decode';
  description: string;
  tests: TestCase[];
}

/**
 * Load a single test fixture file
 */
export function loadFixture(fixturePath: string): TestFixture {
  const content = readFileSync(fixturePath, 'utf-8');
  return JSON.parse(content) as TestFixture;
}

/**
 * Load all fixtures from a directory
 */
export function loadFixturesFromDir(dirPath: string): TestFixture[] {
  const files = readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  return files.map((file) => loadFixture(join(dirPath, file)));
}

/**
 * Get all official encode fixtures
 */
export function getEncodeFixtures(): TestFixture[] {
  const fixturesDir = join(process.cwd(), 'tests/fixtures/official/encode');
  return loadFixturesFromDir(fixturesDir);
}

/**
 * Get all official decode fixtures
 */
export function getDecodeFixtures(): TestFixture[] {
  const fixturesDir = join(process.cwd(), 'tests/fixtures/official/decode');
  return loadFixturesFromDir(fixturesDir);
}
