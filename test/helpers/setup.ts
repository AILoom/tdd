import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { stringify as stringifyYaml } from "yaml";

let testCounter = 0;

function getTestBase(): string {
  return path.join(
    path.resolve(new URL(".", import.meta.url).pathname, "../.."),
    ".test-tmp",
  );
}

export function createTestProject(): string {
  testCounter++;
  const base = getTestBase();
  const dir = path.join(base, `tdd-test-${Date.now()}-${testCounter}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function cleanupTestProject(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function initTestProject(projectRoot: string): void {
  const tddDir = path.join(projectRoot, "tdd");
  mkdirSync(path.join(tddDir, "changes"), { recursive: true });
  mkdirSync(path.join(tddDir, "coverage"), { recursive: true });
  writeFileSync(
    path.join(tddDir, "config.yaml"),
    stringifyYaml({ schema: "test-driven" }),
  );
}

export function createTestChange(
  projectRoot: string,
  name: string,
  options: {
    artifacts?: Record<string, string>;
    schema?: string;
  } = {},
): string {
  const changeDir = path.join(projectRoot, "tdd", "changes", name);
  mkdirSync(changeDir, { recursive: true });

  const meta = {
    schema: options.schema || "test-driven",
    created: new Date().toISOString(),
    name,
  };
  writeFileSync(
    path.join(changeDir, ".tdd.yaml"),
    stringifyYaml(meta),
  );

  if (options.artifacts) {
    for (const [filename, content] of Object.entries(options.artifacts)) {
      const filePath = path.join(changeDir, filename);
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, content);
    }
  }

  return changeDir;
}
