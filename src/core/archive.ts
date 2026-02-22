import path from "node:path";
import { renameSync, readdirSync, statSync } from "node:fs";
import { ensureDir, fileExists, readText, writeText } from "../utils/fs.js";
import {
  getChangeDir,
  getArchiveDir,
  getCoverageDir,
} from "../utils/paths.js";

export interface ArchiveResult {
  archivePath: string;
  syncedCoverage: string[];
  warnings: string[];
}

export function archiveChange(
  projectRoot: string,
  changeName: string,
  syncCoverage: boolean = true,
): ArchiveResult {
  const changeDir = getChangeDir(projectRoot, changeName);
  if (!fileExists(changeDir)) {
    throw new Error(`Change "${changeName}" not found`);
  }

  const warnings: string[] = [];
  const syncedCoverage: string[] = [];

  const tasksPath = path.join(changeDir, "tasks.md");
  if (fileExists(tasksPath)) {
    const content = readText(tasksPath);
    const incomplete = content.match(/- \[ \]/g);
    if (incomplete && incomplete.length > 0) {
      warnings.push(
        `${incomplete.length} task(s) incomplete in tasks.md`,
      );
    }
  }

  if (syncCoverage) {
    const synced = syncDeltaCoverage(projectRoot, changeName);
    syncedCoverage.push(...synced);
  }

  const date = new Date().toISOString().split("T")[0];
  const archiveDir = getArchiveDir(projectRoot);
  ensureDir(archiveDir);

  const archivePath = path.join(archiveDir, `${date}-${changeName}`);
  renameSync(changeDir, archivePath);

  return { archivePath, syncedCoverage, warnings };
}

export function syncDeltaCoverage(
  projectRoot: string,
  changeName: string,
): string[] {
  const changeDir = getChangeDir(projectRoot, changeName);
  const deltaCoverageDir = path.join(changeDir, "coverage");
  if (!fileExists(deltaCoverageDir)) return [];

  const coverageDir = getCoverageDir(projectRoot);
  ensureDir(coverageDir);

  const synced: string[] = [];
  syncDirRecursive(deltaCoverageDir, coverageDir, synced);
  return synced;
}

function syncDirRecursive(
  srcDir: string,
  destDir: string,
  synced: string[],
): void {
  const entries = readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      ensureDir(destPath);
      syncDirRecursive(srcPath, destPath, synced);
    } else if (entry.endsWith(".md")) {
      const deltaContent = readText(srcPath);
      if (fileExists(destPath)) {
        const existingContent = readText(destPath);
        const merged = mergeDeltaCoverage(existingContent, deltaContent);
        writeText(destPath, merged);
      } else {
        const cleaned = cleanDeltaToFull(deltaContent);
        writeText(destPath, cleaned);
      }
      synced.push(destPath);
    }
  }
}

function mergeDeltaCoverage(
  existing: string,
  delta: string,
): string {
  let result = existing;

  const addedSection = extractSection(delta, "ADDED Tests");
  if (addedSection) {
    result = result.trimEnd() + "\n\n" + addedSection.trim() + "\n";
  }

  const removedSection = extractSection(delta, "REMOVED Tests");
  if (removedSection) {
    const testNames = extractTestNames(removedSection);
    for (const name of testNames) {
      result = removeTestFromContent(result, name);
    }
  }

  const modifiedSection = extractSection(delta, "MODIFIED Tests");
  if (modifiedSection) {
    const tests = extractTests(modifiedSection);
    for (const test of tests) {
      result = replaceTestInContent(result, test.name, test.content);
    }
  }

  return result;
}

function cleanDeltaToFull(delta: string): string {
  return delta
    .replace(/^## ADDED Tests\s*/m, "")
    .replace(/^## MODIFIED Tests[\s\S]*$/m, "")
    .replace(/^## REMOVED Tests[\s\S]*$/m, "")
    .trim() + "\n";
}

function extractSection(
  content: string,
  heading: string,
): string | null {
  const regex = new RegExp(
    `^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |$)`,
    "m",
  );
  const match = content.match(regex);
  return match?.[1] ?? null;
}

function extractTestNames(section: string): string[] {
  const names: string[] = [];
  const regex = /^### Test:\s*(.+)$/gm;
  let match;
  while ((match = regex.exec(section)) !== null) {
    names.push(match[1].trim());
  }
  return names;
}

interface TestBlock {
  name: string;
  content: string;
}

function extractTests(section: string): TestBlock[] {
  const tests: TestBlock[] = [];
  const regex = /^### Test:\s*(.+)$/gm;
  const matches: { name: string; index: number }[] = [];
  let match;
  while ((match = regex.exec(section)) !== null) {
    matches.push({ name: match[1].trim(), index: match.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : section.length;
    tests.push({
      name: matches[i].name,
      content: section.slice(start, end).trim(),
    });
  }

  return tests;
}

function removeTestFromContent(content: string, testName: string): string {
  const escaped = testName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `### Test:\\s*${escaped}\\s*\\n[\\s\\S]*?(?=### Test:|## |$)`,
    "g",
  );
  return content.replace(regex, "").replace(/\n{3,}/g, "\n\n");
}

function replaceTestInContent(
  content: string,
  testName: string,
  newContent: string,
): string {
  const escaped = testName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `### Test:\\s*${escaped}\\s*\\n[\\s\\S]*?(?=### Test:|## |$)`,
  );
  if (regex.test(content)) {
    return content.replace(regex, newContent + "\n\n");
  }
  return content.trimEnd() + "\n\n" + newContent + "\n";
}
