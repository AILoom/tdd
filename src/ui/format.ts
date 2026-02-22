import chalk from "chalk";
import type { ArtifactState } from "../core/artifact-graph.js";
import type { ChangeInfo } from "../core/list.js";
import type { ValidationIssue } from "../core/validation.js";

export function formatChangeList(changes: ChangeInfo[]): string {
  if (changes.length === 0) {
    return chalk.dim("  No active changes.");
  }

  return changes
    .map((c) => {
      const progress = c.taskProgress
        ? chalk.dim(` (${c.taskProgress.completed}/${c.taskProgress.total} tasks)`)
        : "";
      const artifacts = c.artifacts.length > 0
        ? chalk.dim(` [${c.artifacts.join(", ")}]`)
        : "";
      return `  ${chalk.bold(c.name)}${progress}${artifacts}`;
    })
    .join("\n");
}

export function formatArtifactStates(states: ArtifactState[]): string {
  return states
    .map((s) => {
      const icon = s.status === "done"
        ? chalk.green("✓")
        : s.status === "ready"
          ? chalk.yellow("◆")
          : chalk.dim("○");
      const label = s.artifact.id;
      const suffix = s.status === "blocked"
        ? chalk.dim(` (needs: ${s.blockedBy.join(", ")})`)
        : s.status === "ready"
          ? chalk.yellow(" (ready)")
          : "";
      return `  ${icon} ${label}${suffix}`;
    })
    .join("\n");
}

export function formatValidationIssues(issues: ValidationIssue[]): string {
  if (issues.length === 0) {
    return chalk.green("  No issues found.");
  }

  return issues
    .map((i) => {
      const icon = i.severity === "error"
        ? chalk.red("✗")
        : i.severity === "warning"
          ? chalk.yellow("⚠")
          : chalk.blue("ℹ");
      const file = i.file ? chalk.dim(` (${i.file})`) : "";
      return `  ${icon} ${i.message}${file}`;
    })
    .join("\n");
}

export const heading = (text: string) => chalk.bold.underline(text);
export const success = (text: string) => chalk.green(`✓ ${text}`);
export const warn = (text: string) => chalk.yellow(`⚠ ${text}`);
export const error = (text: string) => chalk.red(`✗ ${text}`);
export const info = (text: string) => chalk.blue(`ℹ ${text}`);
export const dim = (text: string) => chalk.dim(text);
