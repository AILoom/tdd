import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { initProject } from "../../src/core/init.js";
import { createTestProject, cleanupTestProject } from "../helpers/setup.js";

describe("init", () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = createTestProject();
  });

  afterEach(() => {
    cleanupTestProject(projectRoot);
  });

  it("creates the tdd directory structure", () => {
    const result = initProject(projectRoot);

    expect(existsSync(path.join(projectRoot, "tdd"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "tdd", "changes"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "tdd", "coverage"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "tdd", "config.yaml"))).toBe(
      true,
    );
    expect(result.alreadyExists).toBe(false);
  });

  it("reports already exists on second init", () => {
    initProject(projectRoot);
    const result = initProject(projectRoot);
    expect(result.alreadyExists).toBe(true);
  });

  it("generates skill files for specified tools", () => {
    initProject(projectRoot, { tools: ["cursor"] });

    const skillsDir = path.join(projectRoot, ".cursor", "skills");
    expect(existsSync(skillsDir)).toBe(true);
    expect(existsSync(path.join(skillsDir, "tdd-red.md"))).toBe(true);
    expect(existsSync(path.join(skillsDir, "tdd-green.md"))).toBe(true);
    expect(existsSync(path.join(skillsDir, "tdd-refactor.md"))).toBe(true);
    expect(existsSync(path.join(skillsDir, "tdd-explore.md"))).toBe(true);
    expect(existsSync(path.join(skillsDir, "tdd-new-change.md"))).toBe(true);
  });

  it("uses specified schema in config", () => {
    initProject(projectRoot, { schema: "custom-schema" });
    const configPath = path.join(projectRoot, "tdd", "config.yaml");
    const content = readFileSync(configPath, "utf-8");
    expect(content).toContain("custom-schema");
  });
});
