import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { archiveChange, syncDeltaCoverage } from "../../src/core/archive.js";
import {
  createTestProject,
  cleanupTestProject,
  initTestProject,
  createTestChange,
} from "../helpers/setup.js";

describe("archive", () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = createTestProject();
    initTestProject(projectRoot);
  });

  afterEach(() => {
    cleanupTestProject(projectRoot);
  });

  it("moves change to archive directory", () => {
    createTestChange(projectRoot, "done-feature", {
      artifacts: {
        "intent.md": "# Intent",
        "tasks.md": "# Tasks\n- [x] 1.1 Done\n",
      },
    });

    const result = archiveChange(projectRoot, "done-feature");
    expect(result.archivePath).toContain("archive");
    expect(result.archivePath).toContain("done-feature");
    expect(existsSync(result.archivePath)).toBe(true);

    const originalDir = path.join(
      projectRoot,
      "tdd",
      "changes",
      "done-feature",
    );
    expect(existsSync(originalDir)).toBe(false);
  });

  it("warns about incomplete tasks", () => {
    createTestChange(projectRoot, "partial", {
      artifacts: {
        "tasks.md": "# Tasks\n- [x] 1.1 Done\n- [ ] 2.1 Todo\n",
      },
    });

    const result = archiveChange(projectRoot, "partial");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("1 task(s) incomplete");
  });

  it("throws for nonexistent change", () => {
    expect(() => archiveChange(projectRoot, "ghost")).toThrow(
      'Change "ghost" not found',
    );
  });

  describe("syncDeltaCoverage", () => {
    it("syncs new coverage files to main coverage dir", () => {
      const changeDir = createTestChange(projectRoot, "with-coverage");
      const deltaCoverageDir = path.join(changeDir, "coverage", "auth");
      mkdirSync(deltaCoverageDir, { recursive: true });
      writeFileSync(
        path.join(deltaCoverageDir, "tests.md"),
        "## ADDED Tests\n\n### Test: Login works\n- GIVEN valid creds\n- WHEN login\n- THEN success\n",
      );

      const synced = syncDeltaCoverage(projectRoot, "with-coverage");
      expect(synced).toHaveLength(1);

      const mainCoverage = path.join(
        projectRoot,
        "tdd",
        "coverage",
        "auth",
        "tests.md",
      );
      expect(existsSync(mainCoverage)).toBe(true);

      const content = readFileSync(mainCoverage, "utf-8");
      expect(content).toContain("Login works");
    });

    it("merges added tests into existing coverage", () => {
      const mainCoverageDir = path.join(
        projectRoot,
        "tdd",
        "coverage",
        "auth",
      );
      mkdirSync(mainCoverageDir, { recursive: true });
      writeFileSync(
        path.join(mainCoverageDir, "tests.md"),
        "# Auth Tests\n\n### Test: Existing test\n- GIVEN something\n- THEN works\n",
      );

      const changeDir = createTestChange(projectRoot, "add-coverage");
      const deltaCoverageDir = path.join(changeDir, "coverage", "auth");
      mkdirSync(deltaCoverageDir, { recursive: true });
      writeFileSync(
        path.join(deltaCoverageDir, "tests.md"),
        "## ADDED Tests\n\n### Test: New test\n- GIVEN new\n- THEN also works\n",
      );

      syncDeltaCoverage(projectRoot, "add-coverage");

      const content = readFileSync(
        path.join(mainCoverageDir, "tests.md"),
        "utf-8",
      );
      expect(content).toContain("Existing test");
      expect(content).toContain("New test");
    });
  });
});
