import { Command } from "commander";
import { stringify as stringifyYaml } from "yaml";
import { ensureDir, writeText, fileExists } from "../utils/fs.js";
import { getChangeDir, getChangeMetaPath, findProjectRoot } from "../utils/paths.js";
import { loadProjectConfig, loadSchema } from "../core/config.js";
import { getArtifactStates } from "../core/artifact-graph.js";
import { listChanges } from "../core/list.js";
import { archiveChange } from "../core/archive.js";
import { validateChange } from "../core/validation.js";
import {
  success,
  warn,
  error,
  info,
  heading,
  formatChangeList,
  formatArtifactStates,
  formatValidationIssues,
} from "../ui/format.js";

export const changeCommand = new Command("change")
  .description("Manage TDD changes");

changeCommand
  .command("new <name>")
  .description("Create a new TDD change")
  .option("--schema <schema>", "Schema to use for this change")
  .action(async (name: string, options) => {
    const projectRoot = findProjectRoot();
    const config = loadProjectConfig(projectRoot);
    const schemaName = options.schema || config.schema;

    loadSchema(projectRoot, schemaName);

    const changeDir = getChangeDir(projectRoot, name);
    if (fileExists(changeDir)) {
      console.log(error(`Change "${name}" already exists.`));
      process.exit(1);
    }

    ensureDir(changeDir);

    const meta = {
      schema: schemaName,
      created: new Date().toISOString(),
      name,
    };
    writeText(getChangeMetaPath(projectRoot, name), stringifyYaml(meta));

    console.log(success(`Created change: ${name}`));
    console.log(`  Schema: ${schemaName}`);
    console.log();

    const schema = loadSchema(projectRoot, schemaName);
    const states = getArtifactStates(projectRoot, name, schema);
    console.log(heading("Artifact status:"));
    console.log(formatArtifactStates(states));
    console.log();
    console.log("Next: use /tdd:ff to create all artifacts, or /tdd:continue for step-by-step.");
  });

export const listCommand = new Command("list")
  .description("List active TDD changes")
  .action(() => {
    const projectRoot = findProjectRoot();
    const changes = listChanges(projectRoot);
    console.log(heading("Active changes:"));
    console.log(formatChangeList(changes));
  });

export const showCommand = new Command("show")
  .description("Show details of a TDD change")
  .argument("<name>", "Change name")
  .action((name: string) => {
    const projectRoot = findProjectRoot();
    const config = loadProjectConfig(projectRoot);
    const schema = loadSchema(projectRoot, config.schema);
    const states = getArtifactStates(projectRoot, name, schema);

    const changes = listChanges(projectRoot);
    const change = changes.find((c) => c.name === name);
    if (!change) {
      console.log(error(`Change "${name}" not found.`));
      process.exit(1);
    }

    console.log(heading(`Change: ${name}`));
    console.log(`  Schema: ${change.schema}`);
    console.log(`  Created: ${change.created}`);
    if (change.taskProgress) {
      console.log(
        `  Tasks: ${change.taskProgress.completed}/${change.taskProgress.total}`,
      );
    }
    console.log();
    console.log(heading("Artifacts:"));
    console.log(formatArtifactStates(states));
  });

export const statusCommand = new Command("status")
  .description("Show overall TDD status")
  .action(() => {
    const projectRoot = findProjectRoot();
    const changes = listChanges(projectRoot);

    console.log(heading("TDD Status"));
    console.log();
    console.log(`Active changes: ${changes.length}`);
    console.log();

    if (changes.length > 0) {
      console.log(formatChangeList(changes));
    } else {
      console.log(info("No active changes. Run /tdd:new to start one."));
    }
  });

export const validateCommand = new Command("validate")
  .description("Validate a TDD change")
  .argument("<name>", "Change name")
  .action((name: string) => {
    const projectRoot = findProjectRoot();
    const result = validateChange(projectRoot, name);

    console.log(heading(`Validation: ${name}`));
    console.log();
    console.log(formatValidationIssues(result.issues));
    console.log();

    if (result.valid) {
      console.log(success("Change is valid."));
    } else {
      console.log(error("Change has errors."));
      process.exit(1);
    }
  });

export const archiveCommand = new Command("archive")
  .description("Archive a completed TDD change")
  .argument("<name>", "Change name")
  .option("--no-sync", "Skip syncing delta coverage")
  .action((name: string, options) => {
    const projectRoot = findProjectRoot();

    try {
      const result = archiveChange(projectRoot, name, options.sync !== false);

      if (result.warnings.length > 0) {
        for (const w of result.warnings) {
          console.log(warn(w));
        }
        console.log();
      }

      if (result.syncedCoverage.length > 0) {
        console.log(success("Synced coverage:"));
        for (const s of result.syncedCoverage) {
          console.log(`  ${info(s)}`);
        }
        console.log();
      }

      console.log(success(`Archived to ${result.archivePath}`));
    } catch (err) {
      console.log(error((err as Error).message));
      process.exit(1);
    }
  });
