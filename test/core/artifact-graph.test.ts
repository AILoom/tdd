import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getArtifactStates,
  getNextReady,
  getAllReady,
  allDone,
} from "../../src/core/artifact-graph.js";
import { loadSchema } from "../../src/core/config.js";
import {
  createTestProject,
  cleanupTestProject,
  initTestProject,
  createTestChange,
} from "../helpers/setup.js";

describe("artifact-graph", () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = createTestProject();
    initTestProject(projectRoot);
  });

  afterEach(() => {
    cleanupTestProject(projectRoot);
  });

  it("shows intent as the only ready artifact initially", () => {
    createTestChange(projectRoot, "test-change");
    const schema = loadSchema(projectRoot, "test-driven");
    const states = getArtifactStates(projectRoot, "test-change", schema);

    const ready = states.filter((s) => s.status === "ready");
    const blocked = states.filter((s) => s.status === "blocked");

    expect(ready).toHaveLength(1);
    expect(ready[0].artifact.id).toBe("intent");
    expect(blocked).toHaveLength(3);
  });

  it("unlocks test-plan and design after intent is created", () => {
    createTestChange(projectRoot, "test-change", {
      artifacts: { "intent.md": "# Intent\n## Why\nTest" },
    });
    const schema = loadSchema(projectRoot, "test-driven");
    const states = getArtifactStates(projectRoot, "test-change", schema);

    const done = states.filter((s) => s.status === "done");
    const ready = states.filter((s) => s.status === "ready");

    expect(done).toHaveLength(1);
    expect(done[0].artifact.id).toBe("intent");
    expect(ready).toHaveLength(2);
    expect(ready.map((r) => r.artifact.id).sort()).toEqual(["design", "test-plan"]);
  });

  it("unlocks tasks after test-plan and design are created", () => {
    createTestChange(projectRoot, "test-change", {
      artifacts: {
        "intent.md": "# Intent",
        "test-plan.md": "# Test Plan",
        "design.md": "# Design",
      },
    });
    const schema = loadSchema(projectRoot, "test-driven");
    const ready = getAllReady(projectRoot, "test-change", schema);

    expect(ready).toHaveLength(1);
    expect(ready[0].id).toBe("tasks");
  });

  it("reports all done when every artifact exists", () => {
    createTestChange(projectRoot, "test-change", {
      artifacts: {
        "intent.md": "# Intent",
        "test-plan.md": "# Test Plan",
        "design.md": "# Design",
        "tasks.md": "# Tasks",
      },
    });
    const schema = loadSchema(projectRoot, "test-driven");
    expect(allDone(projectRoot, "test-change", schema)).toBe(true);
  });

  it("getNextReady returns the first ready artifact", () => {
    createTestChange(projectRoot, "test-change");
    const schema = loadSchema(projectRoot, "test-driven");
    const next = getNextReady(projectRoot, "test-change", schema);
    expect(next?.id).toBe("intent");
  });

  it("getNextReady returns null when all are done", () => {
    createTestChange(projectRoot, "test-change", {
      artifacts: {
        "intent.md": "#",
        "test-plan.md": "#",
        "design.md": "#",
        "tasks.md": "#",
      },
    });
    const schema = loadSchema(projectRoot, "test-driven");
    const next = getNextReady(projectRoot, "test-change", schema);
    expect(next).toBeNull();
  });
});
