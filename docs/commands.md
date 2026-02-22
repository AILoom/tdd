# Commands

Reference for TDD slash commands. These are invoked in your AI coding assistant's chat interface.

## Quick Reference

| Command | Purpose | TDD Phase |
|---------|---------|-----------|
| `/tdd:explore` | Investigate before committing | Pre-planning |
| `/tdd:new` | Start a new TDD change | Setup |
| `/tdd:continue` | Create next artifact incrementally | Planning |
| `/tdd:ff` | Fast-forward through all planning artifacts | Planning |
| `/tdd:red` | Write failing tests from test plan | RED |
| `/tdd:green` | Write minimal code to make tests pass | GREEN |
| `/tdd:refactor` | Clean up code while keeping tests green | REFACTOR |
| `/tdd:verify` | Run tests, check coverage matches plan | Verification |
| `/tdd:sync` | Merge delta coverage into main | Pre-archive |
| `/tdd:archive` | Archive completed change | Completion |

---

## `/tdd:explore`

Think through ideas before committing to a change.

**What it does:**
- Opens an exploratory conversation
- Investigates the codebase
- Compares test strategies and approaches
- Can transition to `/tdd:new` when ready

**Example:**
```
You: /tdd:explore How should we test the payment processing module?

AI:  Let me investigate your current test setup...
     I see you're using Vitest with 43% coverage on payments.
     Three areas need attention:
     1. Refund edge cases (no tests)
     2. Concurrent payment handling (one flaky test)
     3. Webhook validation (mocked but not integration tested)

     Which would you like to tackle first?
```

---

## `/tdd:new`

Start a new TDD change.

**Syntax:** `/tdd:new [change-name]`

**What it creates:**
```
tdd/changes/<change-name>/
└── .tdd.yaml    # Change metadata
```

---

## `/tdd:continue`

Create the next artifact in the dependency chain.

**What it does:**
- Queries the artifact dependency graph
- Shows which artifacts are ready vs blocked
- Creates the first ready artifact
- Shows what becomes available after creation

---

## `/tdd:ff`

Fast-forward through all planning artifacts at once.

**What it does:**
- Creates intent, test-plan, design, and tasks in dependency order
- Reads each dependency before creating the next
- When done, suggests `/tdd:red` to begin writing tests

---

## `/tdd:red`

**RED phase: Write failing tests.**

**Critical rules:**
- ONLY write test files. No implementation code.
- Every test MUST fail (no implementation exists yet).
- Follow the test plan exactly.
- Use the project's existing test framework.

**What it does:**
- Reads test-plan.md and tasks.md
- Works through RED phase tasks (section 1)
- Writes test files based on test plan scenarios
- Marks tasks complete as it goes
- Confirms all tests fail (expected behavior)

---

## `/tdd:green`

**GREEN phase: Write minimal code to make tests pass.**

**Critical rules:**
- Write the MINIMUM code needed to pass each test.
- Do NOT refactor or optimize. That's the REFACTOR phase.
- Do NOT add features beyond what tests require.
- Run tests after each implementation.

**What it does:**
- Reads failing tests to understand expectations
- Works through GREEN phase tasks (section 2)
- Writes minimal implementation for each test
- Confirms tests pass after each change

---

## `/tdd:refactor`

**REFACTOR phase: Improve code quality safely.**

**Critical rules:**
- Do NOT change behavior. All tests must stay green.
- Run tests after EACH refactor.
- Focus on: duplication, naming, structure, readability.

**What it does:**
- Works through REFACTOR phase tasks (section 3)
- Makes improvements one at a time
- Runs tests after each change to confirm nothing broke

---

## `/tdd:verify`

Validate implementation matches test plan and all tests pass.

**Checks three dimensions:**

| Dimension | What it validates |
|-----------|-------------------|
| **Completeness** | All tasks done, all scenarios have tests, all tests pass |
| **Correctness** | Tests match plan scenarios, edge cases covered |
| **Coherence** | Design decisions reflected in code, patterns consistent |

---

## `/tdd:sync`

Optional. Merge delta coverage from a change into main `tdd/coverage/`.

**When to use manually:**
- Long-running change, want coverage in main before archiving
- Multiple parallel changes need updated base coverage

---

## `/tdd:archive`

Archive a completed TDD change.

**What it does:**
- Checks artifact and task completion
- Offers to sync delta coverage if not already synced
- Moves change to `tdd/changes/archive/YYYY-MM-DD-<name>/`
- Preserves all artifacts for audit trail

---

## Command Syntax by Tool

| Tool | Syntax |
|------|--------|
| Claude Code | `/tdd:new`, `/tdd:red`, `/tdd:green` |
| Cursor | `/tdd-new`, `/tdd-red`, `/tdd-green` |
| Windsurf | `/tdd-new`, `/tdd-red`, `/tdd-green` |
| Copilot (IDE) | `/tdd-new`, `/tdd-red`, `/tdd-green` |

The functionality is identical regardless of syntax.

## Next Steps

- [Workflows](workflows.md) — Common patterns
- [CLI](cli.md) — Terminal commands
- [Customization](customization.md) — Custom schemas
