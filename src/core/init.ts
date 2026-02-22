import path from "node:path";
import { stringify as stringifyYaml } from "yaml";
import { ensureDir, writeText, fileExists } from "../utils/fs.js";
import {
  getTddRoot,
  getChangesDir,
  getCoverageDir,
  getConfigPath,
} from "../utils/paths.js";

export interface InitOptions {
  tools?: string[];
  schema?: string;
}

export interface InitResult {
  created: string[];
  alreadyExists: boolean;
}

export function initProject(
  projectRoot: string,
  options: InitOptions = {},
): InitResult {
  const tddRoot = getTddRoot(projectRoot);
  const alreadyExists = fileExists(tddRoot);
  const created: string[] = [];

  ensureDir(tddRoot);
  created.push(tddRoot);

  const changesDir = getChangesDir(projectRoot);
  ensureDir(changesDir);
  created.push(changesDir);

  const coverageDir = getCoverageDir(projectRoot);
  ensureDir(coverageDir);
  created.push(coverageDir);

  const configPath = getConfigPath(projectRoot);
  if (!fileExists(configPath)) {
    const config: Record<string, unknown> = {
      schema: options.schema || "test-driven",
    };
    writeText(configPath, stringifyYaml(config));
    created.push(configPath);
  }

  if (options.tools && options.tools.length > 0) {
    installToolIntegrations(projectRoot, options.tools);
  }

  return { created, alreadyExists };
}

function installToolIntegrations(
  projectRoot: string,
  tools: string[],
): void {
  for (const tool of tools) {
    const adapter = getToolAdapter(tool);
    if (!adapter) continue;

    const skillsDir = path.join(projectRoot, adapter.skillsDir);
    const commandsDir = path.join(projectRoot, adapter.commandsDir);
    ensureDir(skillsDir);
    ensureDir(commandsDir);

    for (const skill of getSkillDefinitions()) {
      const skillPath = path.join(skillsDir, `${skill.id}.md`);
      writeText(skillPath, skill.content);

      if (adapter.commandsDir !== adapter.skillsDir) {
        const cmdPath = path.join(
          commandsDir,
          `${adapter.commandPrefix}${skill.commandSuffix}.md`,
        );
        writeText(cmdPath, skill.commandContent(adapter.commandPrefix));
      }
    }
  }
}

interface ToolAdapter {
  id: string;
  name: string;
  skillsDir: string;
  commandsDir: string;
  commandPrefix: string;
}

function getToolAdapter(toolId: string): ToolAdapter | null {
  const adapters: Record<string, ToolAdapter> = {
    cursor: {
      id: "cursor",
      name: "Cursor",
      skillsDir: ".cursor/skills",
      commandsDir: ".cursor/commands",
      commandPrefix: "tdd-",
    },
    claude: {
      id: "claude",
      name: "Claude Code",
      skillsDir: ".claude/skills",
      commandsDir: ".claude/commands/tdd",
      commandPrefix: "tdd-",
    },
    "github-copilot": {
      id: "github-copilot",
      name: "GitHub Copilot",
      skillsDir: ".github/skills",
      commandsDir: ".github/prompts",
      commandPrefix: "tdd-",
    },
    windsurf: {
      id: "windsurf",
      name: "Windsurf",
      skillsDir: ".windsurf/skills",
      commandsDir: ".windsurf/workflows",
      commandPrefix: "tdd-",
    },
    cline: {
      id: "cline",
      name: "Cline",
      skillsDir: ".cline/skills",
      commandsDir: ".clinerules/workflows",
      commandPrefix: "tdd-",
    },
    codex: {
      id: "codex",
      name: "Codex",
      skillsDir: ".codex/skills",
      commandsDir: ".codex/skills",
      commandPrefix: "tdd-",
    },
  };
  return adapters[toolId] ?? null;
}

export function getAvailableTools(): { id: string; name: string }[] {
  return [
    { id: "cursor", name: "Cursor" },
    { id: "claude", name: "Claude Code" },
    { id: "github-copilot", name: "GitHub Copilot" },
    { id: "windsurf", name: "Windsurf" },
    { id: "cline", name: "Cline" },
    { id: "codex", name: "Codex" },
  ];
}

interface SkillDefinition {
  id: string;
  commandSuffix: string;
  content: string;
  commandContent: (prefix: string) => string;
}

function getSkillDefinitions(): SkillDefinition[] {
  return [
    {
      id: "tdd-explore",
      commandSuffix: "explore",
      content: buildSkill(
        "explore",
        "Think through ideas before committing to a change",
        `You are a TDD exploration assistant. Help the user investigate, compare approaches,
and clarify requirements BEFORE committing to a change.

Steps:
1. Ask what the user wants to explore
2. Investigate the codebase to understand current state
3. Compare options and approaches
4. Help clarify what tests would need to be written
5. When insights crystallize, suggest running /tdd:new to begin

Do NOT create any files or artifacts during exploration.`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}explore skill to explore ideas.`,
    },
    {
      id: "tdd-new-change",
      commandSuffix: "new",
      content: buildSkill(
        "new",
        "Start a new TDD change",
        `Start a new TDD change. Create the change folder and metadata.

Steps:
1. Ask for a change name if not provided (kebab-case, descriptive)
2. Create tdd/changes/<name>/ directory
3. Create .tdd.yaml with schema and created date
4. Show what artifacts are available to create next
5. Suggest /tdd:ff to fast-forward or /tdd:continue for step-by-step`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}new-change skill to start a new TDD change.`,
    },
    {
      id: "tdd-continue-change",
      commandSuffix: "continue",
      content: buildSkill(
        "continue",
        "Create the next artifact based on dependencies",
        `Continue a TDD change by creating the next artifact in the dependency chain.

Steps:
1. Identify the active change (or ask if multiple exist)
2. Read .tdd.yaml to find the schema
3. Check which artifacts exist and which are ready (dependencies met)
4. Create the next ready artifact using the schema template and instruction
5. Read all dependency artifacts for context before creating
6. Show what becomes available after creation`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}continue-change skill to create the next artifact.`,
    },
    {
      id: "tdd-ff-change",
      commandSuffix: "ff",
      content: buildSkill(
        "ff",
        "Fast-forward: create all planning artifacts at once",
        `Fast-forward through all planning artifacts for a TDD change.

Steps:
1. Identify the active change
2. Create all artifacts in dependency order: intent → test-plan → design → tasks
3. Read each dependency before creating the next artifact
4. Track progress and show completion status
5. When done, suggest /tdd:red to begin writing failing tests`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}ff-change skill to fast-forward through planning.`,
    },
    {
      id: "tdd-red",
      commandSuffix: "red",
      content: buildSkill(
        "red",
        "RED phase: Write failing tests from the test plan",
        `Execute the RED phase of TDD — write failing tests.

CRITICAL RULES:
- ONLY write test files. Do NOT write any implementation code.
- Every test you write MUST fail (there is no implementation yet).
- Follow the test plan exactly — each scenario becomes a test case.
- Use the project's existing test framework and conventions.

Steps:
1. Read the test-plan.md and tasks.md for the active change
2. Identify RED phase tasks (section 1 in tasks.md)
3. For each task, write the test file based on the test plan scenario
4. Mark tasks complete in tasks.md as you go
5. After all RED tasks, suggest running tests to confirm they all fail
6. Then suggest /tdd:green to begin implementation`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}red skill to write failing tests (RED phase).`,
    },
    {
      id: "tdd-green",
      commandSuffix: "green",
      content: buildSkill(
        "green",
        "GREEN phase: Write minimal code to make tests pass",
        `Execute the GREEN phase of TDD — make tests pass with minimal code.

CRITICAL RULES:
- Write the MINIMUM code needed to make each test pass.
- Do NOT refactor or optimize yet. That's the REFACTOR phase.
- Do NOT add features beyond what the tests require.
- Run tests after each implementation to confirm they pass.

Steps:
1. Read tasks.md and identify GREEN phase tasks (section 2)
2. Read the failing tests to understand what's expected
3. For each task, write minimal implementation to pass the test
4. Mark tasks complete in tasks.md as you go
5. After all GREEN tasks, confirm all tests pass
6. Then suggest /tdd:refactor for cleanup`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}green skill to make tests pass (GREEN phase).`,
    },
    {
      id: "tdd-refactor",
      commandSuffix: "refactor",
      content: buildSkill(
        "refactor",
        "REFACTOR phase: Clean up while keeping tests green",
        `Execute the REFACTOR phase of TDD — improve code quality.

CRITICAL RULES:
- Do NOT change behavior. All tests must stay green.
- Run tests after EACH refactor to confirm nothing broke.
- Focus on: duplication, naming, structure, readability.

Steps:
1. Read tasks.md and identify REFACTOR phase tasks (section 3)
2. For each task, make the improvement
3. Run tests to confirm they still pass
4. Mark tasks complete in tasks.md
5. After all REFACTOR tasks, suggest /tdd:verify for final check`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}refactor skill to clean up code (REFACTOR phase).`,
    },
    {
      id: "tdd-verify",
      commandSuffix: "verify",
      content: buildSkill(
        "verify",
        "Verify implementation matches test plan and all tests pass",
        `Verify the TDD change is complete and correct.

Check three dimensions:
1. COMPLETENESS — All tasks done, all test plan scenarios have tests, all tests pass
2. CORRECTNESS — Tests match the test plan scenarios, edge cases covered
3. COHERENCE — Design decisions reflected in implementation, patterns consistent

Steps:
1. Read all artifacts (intent, test-plan, design, tasks)
2. Check all tasks are marked complete
3. Search codebase for test files and implementation
4. Run tests and report results
5. Report issues categorized as CRITICAL, WARNING, or SUGGESTION
6. If ready, suggest /tdd:archive`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}verify skill to verify the change.`,
    },
    {
      id: "tdd-sync-coverage",
      commandSuffix: "sync",
      content: buildSkill(
        "sync",
        "Merge delta coverage from a change into main coverage",
        `Sync delta coverage from a change into the main tdd/coverage/ directory.

Steps:
1. Read delta coverage files from the change's coverage/ folder
2. Parse ADDED/MODIFIED/REMOVED sections
3. Apply changes to main tdd/coverage/ files
4. Report what was merged
5. Change remains active (not archived)`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}sync-coverage skill to sync coverage.`,
    },
    {
      id: "tdd-archive-change",
      commandSuffix: "archive",
      content: buildSkill(
        "archive",
        "Archive a completed TDD change",
        `Archive a completed TDD change.

Steps:
1. Check all artifacts exist and tasks are complete
2. Warn if any tasks are incomplete
3. Offer to sync delta coverage if not already synced
4. Move change folder to tdd/changes/archive/YYYY-MM-DD-<name>/
5. Confirm archival`,
      ),
      commandContent: (prefix: string) =>
        `Use the ${prefix}archive-change skill to archive a change.`,
    },
  ];
}

function buildSkill(
  name: string,
  description: string,
  instructions: string,
): string {
  return `# TDD Skill: ${name}

${description}

## Instructions

${instructions}

## Project Structure

The TDD framework organizes work in the \`tdd/\` directory:
- \`tdd/coverage/\` — Source of truth: what behavior is tested
- \`tdd/changes/\` — Active changes, one folder per change
- \`tdd/config.yaml\` — Project configuration

Each change folder contains:
- \`intent.md\` — Why this change is needed
- \`test-plan.md\` — What tests to write (Given/When/Then scenarios)
- \`design.md\` — Technical approach (optional)
- \`tasks.md\` — Red/Green/Refactor implementation checklist
- \`.tdd.yaml\` — Change metadata
- \`coverage/\` — Delta coverage changes
`;
}
