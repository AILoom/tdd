import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { createTestProject, cleanupTestProject } from "../helpers/setup.js";

const CLI = path.resolve(
  new URL(".", import.meta.url).pathname,
  "../../bin/tdd.js",
);

function run(args: string, cwd: string): string {
  return execSync(`node ${CLI} ${args}`, {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

describe("CLI e2e", () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = createTestProject();
  });

  afterEach(() => {
    cleanupTestProject(projectRoot);
  });

  it("displays help", () => {
    const output = run("--help", projectRoot);
    expect(output).toContain("Test-driven development framework");
    expect(output).toContain("init");
    expect(output).toContain("change");
    expect(output).toContain("schema");
  });

  it("displays version", () => {
    const output = run("--version", projectRoot);
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("init creates project structure", () => {
    const output = run("init --tools none", projectRoot);
    expect(output).toContain("Initialized TDD");

    expect(existsSync(path.join(projectRoot, "tdd"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "tdd", "changes"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "tdd", "config.yaml"))).toBe(
      true,
    );
  });

  it("full workflow: init -> new -> list -> validate -> archive", () => {
    run("init --tools none", projectRoot);

    const newOutput = run("change new add-feature", projectRoot);
    expect(newOutput).toContain("Created change: add-feature");

    const listOutput = run("list", projectRoot);
    expect(listOutput).toContain("add-feature");

    const validateOutput = run("validate add-feature", projectRoot);
    expect(validateOutput).toContain("Validation: add-feature");

    const archiveOutput = run("archive add-feature", projectRoot);
    expect(archiveOutput).toContain("Archived to");

    const listAfter = run("list", projectRoot);
    expect(listAfter).toContain("No active changes");
  });

  it("schema list shows built-in schema", () => {
    run("init --tools none", projectRoot);
    const output = run("schema list", projectRoot);
    expect(output).toContain("test-driven");
    expect(output).toContain("intent");
  });

  it("schema validate works for test-driven", () => {
    run("init --tools none", projectRoot);
    const output = run("schema validate test-driven", projectRoot);
    expect(output).toContain("valid");
  });

  it("status shows project overview", () => {
    run("init --tools none", projectRoot);
    run("change new my-change", projectRoot);
    const output = run("status", projectRoot);
    expect(output).toContain("Active changes: 1");
  });
});
