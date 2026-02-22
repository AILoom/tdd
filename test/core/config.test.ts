import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadProjectConfig, saveProjectConfig, loadSchema } from "../../src/core/config.js";
import { createTestProject, cleanupTestProject, initTestProject } from "../helpers/setup.js";

describe("config", () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = createTestProject();
    initTestProject(projectRoot);
  });

  afterEach(() => {
    cleanupTestProject(projectRoot);
  });

  describe("loadProjectConfig", () => {
    it("loads config from tdd/config.yaml", () => {
      const config = loadProjectConfig(projectRoot);
      expect(config.schema).toBe("test-driven");
    });

    it("returns defaults when no config exists", () => {
      const emptyRoot = createTestProject();
      const config = loadProjectConfig(emptyRoot);
      expect(config.schema).toBe("test-driven");
      cleanupTestProject(emptyRoot);
    });
  });

  describe("saveProjectConfig", () => {
    it("saves and reloads config", () => {
      saveProjectConfig(projectRoot, {
        schema: "custom",
        context: "TypeScript project",
      });
      const loaded = loadProjectConfig(projectRoot);
      expect(loaded.schema).toBe("custom");
      expect(loaded.context).toBe("TypeScript project");
    });
  });

  describe("loadSchema", () => {
    it("loads the built-in test-driven schema", () => {
      const schema = loadSchema(projectRoot, "test-driven");
      expect(schema.name).toBe("test-driven");
      expect(schema.artifacts).toHaveLength(4);
      expect(schema.artifacts.map((a) => a.id)).toEqual([
        "intent",
        "test-plan",
        "design",
        "tasks",
      ]);
    });

    it("throws for unknown schema", () => {
      expect(() => loadSchema(projectRoot, "nonexistent")).toThrow(
        'Schema "nonexistent" not found',
      );
    });

    it("schema artifacts have correct dependencies", () => {
      const schema = loadSchema(projectRoot, "test-driven");
      const intent = schema.artifacts.find((a) => a.id === "intent")!;
      const testPlan = schema.artifacts.find((a) => a.id === "test-plan")!;
      const design = schema.artifacts.find((a) => a.id === "design")!;
      const tasks = schema.artifacts.find((a) => a.id === "tasks")!;

      expect(intent.requires).toEqual([]);
      expect(testPlan.requires).toEqual(["intent"]);
      expect(design.requires).toEqual(["intent"]);
      expect(tasks.requires).toEqual(["test-plan", "design"]);
    });
  });
});
