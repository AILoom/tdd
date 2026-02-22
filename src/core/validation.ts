import path from "node:path";
import { readText, fileExists } from "../utils/fs.js";
import { getChangeDir } from "../utils/paths.js";

export type Severity = "error" | "warning" | "suggestion";

export interface ValidationIssue {
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateChange(
  projectRoot: string,
  changeName: string,
): ValidationResult {
  const changeDir = getChangeDir(projectRoot, changeName);
  const issues: ValidationIssue[] = [];

  if (!fileExists(changeDir)) {
    issues.push({ severity: "error", message: `Change "${changeName}" not found` });
    return { valid: false, issues };
  }

  const metaPath = path.join(changeDir, ".tdd.yaml");
  if (!fileExists(metaPath)) {
    issues.push({
      severity: "error",
      message: "Missing .tdd.yaml metadata file",
      file: metaPath,
    });
  }

  validateIntent(changeDir, issues);
  validateTestPlan(changeDir, issues);
  validateTasks(changeDir, issues);

  const valid = !issues.some((i) => i.severity === "error");
  return { valid, issues };
}

function validateIntent(changeDir: string, issues: ValidationIssue[]): void {
  const intentPath = path.join(changeDir, "intent.md");
  if (!fileExists(intentPath)) {
    issues.push({
      severity: "warning",
      message: "Missing intent.md",
      file: intentPath,
    });
    return;
  }

  const content = readText(intentPath);
  if (!content.includes("## Why")) {
    issues.push({
      severity: "warning",
      message: 'intent.md missing "## Why" section',
      file: intentPath,
    });
  }
  if (!content.includes("## What Changes")) {
    issues.push({
      severity: "warning",
      message: 'intent.md missing "## What Changes" section',
      file: intentPath,
    });
  }
}

function validateTestPlan(
  changeDir: string,
  issues: ValidationIssue[],
): void {
  const planPath = path.join(changeDir, "test-plan.md");
  if (!fileExists(planPath)) {
    issues.push({
      severity: "warning",
      message: "Missing test-plan.md",
      file: planPath,
    });
    return;
  }

  const content = readText(planPath);

  const testBlocks = content.match(/^### Test:/gm);
  if (!testBlocks || testBlocks.length === 0) {
    issues.push({
      severity: "warning",
      message: "test-plan.md has no test scenarios (### Test: blocks)",
      file: planPath,
    });
    return;
  }

  const givenCount = (content.match(/- GIVEN/g) || []).length;
  const whenCount = (content.match(/- WHEN/g) || []).length;
  const thenCount = (content.match(/- THEN/g) || []).length;

  if (givenCount < testBlocks.length) {
    issues.push({
      severity: "suggestion",
      message: "Some test scenarios may be missing GIVEN clauses",
      file: planPath,
    });
  }
  if (whenCount < testBlocks.length) {
    issues.push({
      severity: "suggestion",
      message: "Some test scenarios may be missing WHEN clauses",
      file: planPath,
    });
  }
  if (thenCount < testBlocks.length) {
    issues.push({
      severity: "warning",
      message: "Some test scenarios are missing THEN clauses",
      file: planPath,
    });
  }
}

function validateTasks(changeDir: string, issues: ValidationIssue[]): void {
  const tasksPath = path.join(changeDir, "tasks.md");
  if (!fileExists(tasksPath)) return;

  const content = readText(tasksPath);

  const hasRed = /## \d+\.\s*RED/i.test(content);
  const hasGreen = /## \d+\.\s*GREEN/i.test(content);
  const hasRefactor = /## \d+\.\s*REFACTOR/i.test(content);

  if (!hasRed) {
    issues.push({
      severity: "warning",
      message: "tasks.md missing RED phase section",
      file: tasksPath,
    });
  }
  if (!hasGreen) {
    issues.push({
      severity: "warning",
      message: "tasks.md missing GREEN phase section",
      file: tasksPath,
    });
  }
  if (!hasRefactor) {
    issues.push({
      severity: "suggestion",
      message: "tasks.md missing REFACTOR phase section",
      file: tasksPath,
    });
  }

  const checkboxes = content.match(/- \[[ x]\]/g);
  if (!checkboxes || checkboxes.length === 0) {
    issues.push({
      severity: "warning",
      message: "tasks.md has no checkbox tasks (- [ ] or - [x])",
      file: tasksPath,
    });
  }
}
