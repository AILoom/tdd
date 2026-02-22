import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { listChanges } from "../../src/core/list.js";
import {
  createTestProject,
  cleanupTestProject,
  initTestProject,
  createTestChange,
} from "../helpers/setup.js";

describe("list", () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = createTestProject();
    initTestProject(projectRoot);
  });

  afterEach(() => {
    cleanupTestProject(projectRoot);
  });

  it("returns empty array when no changes exist", () => {
    const changes = listChanges(projectRoot);
    expect(changes).toEqual([]);
  });

  it("lists a single change", () => {
    createTestChange(projectRoot, "my-feature");
    const changes = listChanges(projectRoot);
    expect(changes).toHaveLength(1);
    expect(changes[0].name).toBe("my-feature");
    expect(changes[0].schema).toBe("test-driven");
  });

  it("lists multiple changes sorted by creation date", () => {
    createTestChange(projectRoot, "first");
    createTestChange(projectRoot, "second");
    const changes = listChanges(projectRoot);
    expect(changes).toHaveLength(2);
    expect(changes[0].name).toBe("first");
    expect(changes[1].name).toBe("second");
  });

  it("detects artifacts in a change", () => {
    createTestChange(projectRoot, "with-artifacts", {
      artifacts: {
        "intent.md": "# Intent",
        "test-plan.md": "# Test Plan",
      },
    });
    const changes = listChanges(projectRoot);
    expect(changes[0].artifacts).toContain("intent.md");
    expect(changes[0].artifacts).toContain("test-plan.md");
  });

  it("parses task progress from tasks.md", () => {
    createTestChange(projectRoot, "with-tasks", {
      artifacts: {
        "tasks.md":
          "# Tasks\n- [x] 1.1 Done\n- [x] 1.2 Done\n- [ ] 2.1 Todo\n",
      },
    });
    const changes = listChanges(projectRoot);
    expect(changes[0].taskProgress).toEqual({ total: 3, completed: 2 });
  });

  it("returns null task progress when tasks.md has no checkboxes", () => {
    createTestChange(projectRoot, "no-tasks", {
      artifacts: { "tasks.md": "# Tasks\nNothing here yet.\n" },
    });
    const changes = listChanges(projectRoot);
    expect(changes[0].taskProgress).toBeNull();
  });
});
