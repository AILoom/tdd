import path from "node:path";
import { readdirSync, statSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { readText, fileExists } from "../utils/fs.js";
import {
  getChangesDir,
  getArchiveDir,
  CHANGE_META_FILE,
  ARCHIVE_DIR,
} from "../utils/paths.js";
import { changeMetaSchema, type ChangeMeta } from "./config-schema.js";

export interface ChangeInfo {
  name: string;
  schema: string;
  created: string;
  path: string;
  artifacts: string[];
  taskProgress: TaskProgress | null;
}

export interface TaskProgress {
  total: number;
  completed: number;
}

export function listChanges(projectRoot: string): ChangeInfo[] {
  const changesDir = getChangesDir(projectRoot);
  if (!fileExists(changesDir)) return [];

  const entries = readdirSync(changesDir);
  const changes: ChangeInfo[] = [];

  for (const entry of entries) {
    if (entry === ARCHIVE_DIR) continue;
    const entryPath = path.join(changesDir, entry);
    if (!statSync(entryPath).isDirectory()) continue;

    const metaPath = path.join(entryPath, CHANGE_META_FILE);
    if (!fileExists(metaPath)) continue;

    const meta = loadChangeMeta(metaPath);
    if (!meta) continue;

    const artifacts = detectArtifacts(entryPath);
    const taskProgress = parseTaskProgress(entryPath);

    changes.push({
      name: meta.name,
      schema: meta.schema,
      created: meta.created,
      path: entryPath,
      artifacts,
      taskProgress,
    });
  }

  return changes.sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
  );
}

export function listArchived(projectRoot: string): ChangeInfo[] {
  const archiveDir = getArchiveDir(projectRoot);
  if (!fileExists(archiveDir)) return [];

  const entries = readdirSync(archiveDir);
  const changes: ChangeInfo[] = [];

  for (const entry of entries) {
    const entryPath = path.join(archiveDir, entry);
    if (!statSync(entryPath).isDirectory()) continue;

    const metaPath = path.join(entryPath, CHANGE_META_FILE);
    if (!fileExists(metaPath)) continue;

    const meta = loadChangeMeta(metaPath);
    if (!meta) continue;

    const artifacts = detectArtifacts(entryPath);
    const taskProgress = parseTaskProgress(entryPath);

    changes.push({
      name: meta.name,
      schema: meta.schema,
      created: meta.created,
      path: entryPath,
      artifacts,
      taskProgress,
    });
  }

  return changes;
}

function loadChangeMeta(metaPath: string): ChangeMeta | null {
  try {
    const raw = parseYaml(readText(metaPath));
    return changeMetaSchema.parse(raw);
  } catch {
    return null;
  }
}

function detectArtifacts(changeDir: string): string[] {
  const artifacts: string[] = [];
  const knownFiles = ["intent.md", "test-plan.md", "design.md", "tasks.md"];

  for (const file of knownFiles) {
    if (fileExists(path.join(changeDir, file))) {
      artifacts.push(file);
    }
  }

  const coverageDir = path.join(changeDir, "coverage");
  if (fileExists(coverageDir)) {
    artifacts.push("coverage/");
  }

  return artifacts;
}

function parseTaskProgress(changeDir: string): TaskProgress | null {
  const tasksPath = path.join(changeDir, "tasks.md");
  if (!fileExists(tasksPath)) return null;

  const content = readText(tasksPath);
  const allTasks = content.match(/- \[[ x]\]/g);
  if (!allTasks) return null;

  const completed = content.match(/- \[x\]/g);
  return {
    total: allTasks.length,
    completed: completed?.length ?? 0,
  };
}
