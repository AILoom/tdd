import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateChange } from "../../src/core/validation.js";
import {
  createTestProject,
  cleanupTestProject,
  initTestProject,
  createTestChange,
} from "../helpers/setup.js";

describe("validation", () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = createTestProject();
    initTestProject(projectRoot);
  });

  afterEach(() => {
    cleanupTestProject(projectRoot);
  });

  it("reports error for nonexistent change", () => {
    const result = validateChange(projectRoot, "ghost");
    expect(result.valid).toBe(false);
    expect(result.issues[0].severity).toBe("error");
  });

  it("reports warnings for missing artifacts", () => {
    createTestChange(projectRoot, "empty-change");
    const result = validateChange(projectRoot, "empty-change");
    expect(result.valid).toBe(true);

    const warnings = result.issues.filter((i) => i.severity === "warning");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.message.includes("intent.md"))).toBe(true);
    expect(warnings.some((w) => w.message.includes("test-plan.md"))).toBe(true);
  });

  it("validates intent.md structure", () => {
    createTestChange(projectRoot, "bad-intent", {
      artifacts: {
        "intent.md": "# Intent\nSome content without proper sections",
      },
    });
    const result = validateChange(projectRoot, "bad-intent");
    const warnings = result.issues.filter((i) => i.severity === "warning");
    expect(warnings.some((w) => w.message.includes("Why"))).toBe(true);
    expect(warnings.some((w) => w.message.includes("What Changes"))).toBe(true);
  });

  it("passes for well-structured intent", () => {
    createTestChange(projectRoot, "good-intent", {
      artifacts: {
        "intent.md": "# Intent\n\n## Why\nReason.\n\n## What Changes\n- Something\n",
      },
    });
    const result = validateChange(projectRoot, "good-intent");
    const intentWarnings = result.issues.filter(
      (i) => i.file?.includes("intent.md") && i.severity === "warning",
    );
    expect(intentWarnings).toHaveLength(0);
  });

  it("validates test-plan.md has test scenarios", () => {
    createTestChange(projectRoot, "no-tests", {
      artifacts: {
        "test-plan.md": "# Test Plan\nNothing here.",
      },
    });
    const result = validateChange(projectRoot, "no-tests");
    const warnings = result.issues.filter(
      (i) => i.file?.includes("test-plan.md"),
    );
    expect(warnings.some((w) => w.message.includes("no test scenarios"))).toBe(
      true,
    );
  });

  it("validates test-plan.md scenarios have THEN clauses", () => {
    createTestChange(projectRoot, "no-then", {
      artifacts: {
        "test-plan.md":
          "# Test Plan\n\n### Test: Something\n- GIVEN x\n- WHEN y\n",
      },
    });
    const result = validateChange(projectRoot, "no-then");
    const warnings = result.issues.filter(
      (i) => i.file?.includes("test-plan.md") && i.severity === "warning",
    );
    expect(
      warnings.some((w) => w.message.includes("THEN")),
    ).toBe(true);
  });

  it("validates tasks.md has TDD phase sections", () => {
    createTestChange(projectRoot, "bad-tasks", {
      artifacts: {
        "tasks.md": "# Tasks\n- [ ] 1.1 Do something\n",
      },
    });
    const result = validateChange(projectRoot, "bad-tasks");
    const warnings = result.issues.filter(
      (i) => i.file?.includes("tasks.md"),
    );
    expect(warnings.some((w) => w.message.includes("RED"))).toBe(true);
    expect(warnings.some((w) => w.message.includes("GREEN"))).toBe(true);
  });
});
