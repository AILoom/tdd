import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
  projectConfigSchema,
  schemaDefinitionSchema,
  type ProjectConfig,
  type SchemaDefinition,
} from "./config-schema.js";
import { readText, fileExists, writeText } from "../utils/fs.js";
import { getConfigPath, getSchemasDir } from "../utils/paths.js";

export function loadProjectConfig(projectRoot: string): ProjectConfig {
  const configPath = getConfigPath(projectRoot);
  if (!fileExists(configPath)) {
    return { schema: "test-driven" };
  }
  const raw = parseYaml(readText(configPath));
  return projectConfigSchema.parse(raw);
}

export function saveProjectConfig(
  projectRoot: string,
  config: ProjectConfig,
): void {
  const configPath = getConfigPath(projectRoot);
  writeText(configPath, stringifyYaml(config));
}

export function resolveSchemaPath(
  projectRoot: string,
  schemaName: string,
): string | null {
  const projectSchema = path.join(
    getSchemasDir(projectRoot),
    schemaName,
    "schema.yaml",
  );
  if (fileExists(projectSchema)) return projectSchema;

  const builtinSchema = path.join(
    findPackageRoot(),
    "schemas",
    schemaName,
    "schema.yaml",
  );
  if (fileExists(builtinSchema)) return builtinSchema;

  return null;
}

export function loadSchema(
  projectRoot: string,
  schemaName: string,
): SchemaDefinition {
  const schemaPath = resolveSchemaPath(projectRoot, schemaName);
  if (!schemaPath) {
    throw new Error(`Schema "${schemaName}" not found`);
  }
  const raw = parseYaml(readText(schemaPath));
  return schemaDefinitionSchema.parse(raw);
}

export function loadSchemaTemplate(
  projectRoot: string,
  schemaName: string,
  templateName: string,
): string | null {
  const projectTemplate = path.join(
    getSchemasDir(projectRoot),
    schemaName,
    "templates",
    templateName,
  );
  if (fileExists(projectTemplate)) return readText(projectTemplate);

  const builtinTemplate = path.join(
    findPackageRoot(),
    "schemas",
    schemaName,
    "templates",
    templateName,
  );
  if (fileExists(builtinTemplate)) return readText(builtinTemplate);

  return null;
}

function findPackageRoot(): string {
  let dir = new URL(".", import.meta.url).pathname;
  while (dir !== "/") {
    if (fileExists(path.join(dir, "package.json"))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}
