import path from "node:path";
import { existsSync, statSync } from "node:fs";

export const TDD_DIR = "tdd";
export const CHANGES_DIR = "changes";
export const COVERAGE_DIR = "coverage";
export const ARCHIVE_DIR = "archive";
export const SCHEMAS_DIR = "schemas";
export const CONFIG_FILE = "config.yaml";
export const CHANGE_META_FILE = ".tdd.yaml";

export function getTddRoot(projectRoot: string): string {
  return path.join(projectRoot, TDD_DIR);
}

export function getChangesDir(projectRoot: string): string {
  return path.join(getTddRoot(projectRoot), CHANGES_DIR);
}

export function getCoverageDir(projectRoot: string): string {
  return path.join(getTddRoot(projectRoot), COVERAGE_DIR);
}

export function getArchiveDir(projectRoot: string): string {
  return path.join(getChangesDir(projectRoot), ARCHIVE_DIR);
}

export function getSchemasDir(projectRoot: string): string {
  return path.join(getTddRoot(projectRoot), SCHEMAS_DIR);
}

export function getConfigPath(projectRoot: string): string {
  return path.join(getTddRoot(projectRoot), CONFIG_FILE);
}

export function getChangeDir(projectRoot: string, changeName: string): string {
  return path.join(getChangesDir(projectRoot), changeName);
}

export function getChangeMetaPath(
  projectRoot: string,
  changeName: string,
): string {
  return path.join(getChangeDir(projectRoot, changeName), CHANGE_META_FILE);
}

export function findProjectRoot(startDir: string = process.cwd()): string {
  let dir = startDir;
  while (true) {
    const tddPath = path.join(dir, TDD_DIR);
    if (existsSync(tddPath) && statSync(tddPath).isDirectory()) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}
