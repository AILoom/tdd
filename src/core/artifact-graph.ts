import path from "node:path";
import type { Artifact, SchemaDefinition } from "./config-schema.js";
import { fileExists } from "../utils/fs.js";
import { getChangeDir } from "../utils/paths.js";

export type ArtifactStatus = "done" | "ready" | "blocked";

export interface ArtifactState {
  artifact: Artifact;
  status: ArtifactStatus;
  blockedBy: string[];
}

export function getArtifactStates(
  projectRoot: string,
  changeName: string,
  schema: SchemaDefinition,
): ArtifactState[] {
  const changeDir = getChangeDir(projectRoot, changeName);
  const done = new Set<string>();

  for (const artifact of schema.artifacts) {
    if (artifactExists(changeDir, artifact)) {
      done.add(artifact.id);
    }
  }

  return schema.artifacts.map((artifact) => {
    if (done.has(artifact.id)) {
      return { artifact, status: "done" as const, blockedBy: [] };
    }

    const blockedBy = artifact.requires.filter((dep) => !done.has(dep));
    if (blockedBy.length === 0) {
      return { artifact, status: "ready" as const, blockedBy: [] };
    }

    return { artifact, status: "blocked" as const, blockedBy };
  });
}

export function getNextReady(
  projectRoot: string,
  changeName: string,
  schema: SchemaDefinition,
): Artifact | null {
  const states = getArtifactStates(projectRoot, changeName, schema);
  const ready = states.find((s) => s.status === "ready");
  return ready?.artifact ?? null;
}

export function getAllReady(
  projectRoot: string,
  changeName: string,
  schema: SchemaDefinition,
): Artifact[] {
  const states = getArtifactStates(projectRoot, changeName, schema);
  return states.filter((s) => s.status === "ready").map((s) => s.artifact);
}

export function allDone(
  projectRoot: string,
  changeName: string,
  schema: SchemaDefinition,
): boolean {
  const states = getArtifactStates(projectRoot, changeName, schema);
  return states.every((s) => s.status === "done");
}

function artifactExists(changeDir: string, artifact: Artifact): boolean {
  const generates = artifact.generates;
  if (generates.includes("*")) {
    const dir = path.join(changeDir, path.dirname(generates).split("*")[0]);
    return fileExists(dir);
  }
  return fileExists(path.join(changeDir, generates));
}
