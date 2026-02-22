import { Command } from "commander";
import { findProjectRoot } from "../utils/paths.js";
import { loadProjectConfig, loadSchema } from "../core/config.js";
import { listChanges, listArchived } from "../core/list.js";
import { getArtifactStates } from "../core/artifact-graph.js";
import { heading, success, dim, info } from "../ui/format.js";
import chalk from "chalk";

export const viewCommand = new Command("view")
  .description("Interactive dashboard showing TDD project status")
  .action(() => {
    const projectRoot = findProjectRoot();
    const config = loadProjectConfig(projectRoot);

    console.log();
    console.log(chalk.bold("  ╔══════════════════════════════════════╗"));
    console.log(chalk.bold("  ║       TDD Project Dashboard          ║"));
    console.log(chalk.bold("  ╚══════════════════════════════════════╝"));
    console.log();

    console.log(heading("Configuration"));
    console.log(`  Schema: ${config.schema}`);
    if (config.context) {
      console.log(`  Context: ${dim(config.context.split("\n")[0] + "...")}`);
    }
    console.log();

    const changes = listChanges(projectRoot);
    console.log(heading(`Active Changes (${changes.length})`));
    console.log();

    if (changes.length === 0) {
      console.log(info("  No active changes. Run /tdd:new to start one."));
    } else {
      for (const change of changes) {
        const schema = loadSchema(projectRoot, change.schema);
        const states = getArtifactStates(projectRoot, change.name, schema);

        const doneCount = states.filter((s) => s.status === "done").length;
        const totalCount = states.length;
        const progressBar = renderProgressBar(doneCount, totalCount);

        console.log(`  ${chalk.bold(change.name)}`);
        console.log(`    Artifacts: ${progressBar} ${doneCount}/${totalCount}`);

        if (change.taskProgress) {
          const taskBar = renderProgressBar(
            change.taskProgress.completed,
            change.taskProgress.total,
          );
          console.log(
            `    Tasks:     ${taskBar} ${change.taskProgress.completed}/${change.taskProgress.total}`,
          );

          const phase = determinePhase(change.taskProgress.completed, change.taskProgress.total);
          console.log(`    Phase:     ${phase}`);
        }
        console.log();
      }
    }

    const archived = listArchived(projectRoot);
    if (archived.length > 0) {
      console.log(heading(`Archived (${archived.length})`));
      for (const a of archived.slice(-5)) {
        console.log(`  ${dim(a.name)} ${dim(`(${a.created.split("T")[0]})`)}`);
      }
      if (archived.length > 5) {
        console.log(dim(`  ... and ${archived.length - 5} more`));
      }
      console.log();
    }

    console.log(heading("Quick Commands"));
    console.log(`  ${chalk.cyan("/tdd:new")}       Start a new change`);
    console.log(`  ${chalk.cyan("/tdd:ff")}        Fast-forward planning`);
    console.log(`  ${chalk.red("/tdd:red")}       Write failing tests`);
    console.log(`  ${chalk.green("/tdd:green")}     Make tests pass`);
    console.log(`  ${chalk.blue("/tdd:refactor")}  Clean up code`);
    console.log(`  ${chalk.yellow("/tdd:verify")}    Verify completion`);
    console.log(`  ${chalk.dim("/tdd:archive")}   Archive change`);
    console.log();
  });

function renderProgressBar(done: number, total: number): string {
  const width = 20;
  const filled = total > 0 ? Math.round((done / total) * width) : 0;
  const empty = width - filled;
  return (
    chalk.green("█".repeat(filled)) +
    chalk.dim("░".repeat(empty))
  );
}

function determinePhase(completed: number, total: number): string {
  if (completed === 0) return chalk.dim("Not started");
  if (completed === total) return chalk.green("Complete");
  const ratio = completed / total;
  if (ratio < 0.33) return chalk.red("RED — Writing tests");
  if (ratio < 0.66) return chalk.green("GREEN — Implementing");
  return chalk.blue("REFACTOR — Cleaning up");
}
