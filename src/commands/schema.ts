import path from "node:path";
import { Command } from "commander";
import { cpSync } from "node:fs";
import { loadSchema, resolveSchemaPath } from "../core/config.js";
import { ensureDir, fileExists, writeText } from "../utils/fs.js";
import { getSchemasDir, findProjectRoot } from "../utils/paths.js";
import { success, error, info, heading } from "../ui/format.js";
import { stringify as stringifyYaml } from "yaml";

export const schemaCommand = new Command("schema")
  .description("Manage TDD schemas");

schemaCommand
  .command("list")
  .description("List available schemas")
  .action(() => {
    const projectRoot = findProjectRoot();
    console.log(heading("Available schemas:"));
    console.log();

    const builtins = ["test-driven"];
    for (const name of builtins) {
      try {
        const schema = loadSchema(projectRoot, name);
        const source = resolveSchemaPath(projectRoot, name)?.includes("schemas/")
          ? "built-in"
          : "project";
        console.log(`  ${name} (${source})`);
        if (schema.description) {
          console.log(`    ${schema.description}`);
        }
        console.log(
          `    Artifacts: ${schema.artifacts.map((a) => a.id).join(" → ")}`,
        );
        console.log();
      } catch {
        console.log(`  ${name} (not found)`);
      }
    }
  });

schemaCommand
  .command("init <name>")
  .description("Create a new custom schema")
  .option("--description <desc>", "Schema description")
  .option("--artifacts <artifacts>", "Comma-separated artifact IDs")
  .action((name: string, options) => {
    const projectRoot = findProjectRoot();
    const schemaDir = path.join(getSchemasDir(projectRoot), name);

    if (fileExists(schemaDir)) {
      console.log(error(`Schema "${name}" already exists.`));
      process.exit(1);
    }

    ensureDir(schemaDir);
    ensureDir(path.join(schemaDir, "templates"));

    const artifactIds = options.artifacts
      ? options.artifacts.split(",").map((a: string) => a.trim())
      : ["intent", "test-plan", "tasks"];

    const artifacts = artifactIds.map((id: string, i: number) => ({
      id,
      generates: `${id}.md`,
      description: `${id} artifact`,
      template: `${id}.md`,
      requires: i === 0 ? [] : [artifactIds[i - 1]],
    }));

    const schema = {
      name,
      version: 1,
      description: options.description || `Custom schema: ${name}`,
      artifacts,
      apply: {
        requires: [artifactIds[artifactIds.length - 1]],
        tracks: "tasks.md",
      },
    };

    writeText(path.join(schemaDir, "schema.yaml"), stringifyYaml(schema));

    for (const id of artifactIds) {
      writeText(
        path.join(schemaDir, "templates", `${id}.md`),
        `# ${id}\n\n<!-- Template for ${id} artifact -->\n`,
      );
    }

    console.log(success(`Created schema: ${name}`));
    console.log(`  Path: ${schemaDir}`);
  });

schemaCommand
  .command("fork <source> <name>")
  .description("Fork an existing schema")
  .action((source: string, name: string) => {
    const projectRoot = findProjectRoot();
    const sourcePath = resolveSchemaPath(projectRoot, source);
    if (!sourcePath) {
      console.log(error(`Source schema "${source}" not found.`));
      process.exit(1);
    }

    const targetDir = path.join(getSchemasDir(projectRoot), name);
    if (fileExists(targetDir)) {
      console.log(error(`Schema "${name}" already exists.`));
      process.exit(1);
    }

    const sourceDir = path.dirname(sourcePath);
    cpSync(sourceDir, targetDir, { recursive: true });

    console.log(success(`Forked ${source} → ${name}`));
    console.log(`  Path: ${targetDir}`);
    console.log();
    console.log(info("Edit schema.yaml and templates/ to customize."));
  });

schemaCommand
  .command("validate <name>")
  .description("Validate a schema definition")
  .action((name: string) => {
    const projectRoot = findProjectRoot();
    try {
      const schema = loadSchema(projectRoot, name);

      const ids = new Set(schema.artifacts.map((a) => a.id));
      for (const artifact of schema.artifacts) {
        for (const dep of artifact.requires) {
          if (!ids.has(dep)) {
            console.log(error(`Artifact "${artifact.id}" requires unknown "${dep}"`));
            process.exit(1);
          }
        }
      }

      if (hasCycle(schema.artifacts)) {
        console.log(error("Schema has circular dependencies"));
        process.exit(1);
      }

      console.log(success(`Schema "${name}" is valid.`));
      console.log(
        `  Artifacts: ${schema.artifacts.map((a) => a.id).join(" → ")}`,
      );
    } catch (err) {
      console.log(error((err as Error).message));
      process.exit(1);
    }
  });

function hasCycle(
  artifacts: { id: string; requires: string[] }[],
): boolean {
  const graph = new Map<string, string[]>();
  for (const a of artifacts) {
    graph.set(a.id, a.requires);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string): boolean {
    if (inStack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    inStack.add(node);
    for (const dep of graph.get(node) || []) {
      if (dfs(dep)) return true;
    }
    inStack.delete(node);
    return false;
  }

  for (const a of artifacts) {
    if (dfs(a.id)) return true;
  }
  return false;
}
