# Concepts

This guide explains the core ideas behind the TDD framework and how they fit together.

## Philosophy

```
test-first not code-first    — write failing tests before any implementation
red/green/refactor            — follow the TDD cycle explicitly
fluid not rigid               — update any artifact at any time
brownfield-first              — works with existing test suites and codebases
progressive rigor             — lightweight for simple changes, thorough for complex
```

### Why These Principles Matter

**Test-first not code-first.** AI assistants tend to jump straight to implementation. TDD ensures tests are written first, catching design issues early and producing better-tested code.

**Red/Green/Refactor.** The three phases are explicit, not implied. RED writes tests that fail. GREEN writes minimal code to pass. REFACTOR cleans up safely. Each phase has guardrails.

**Fluid not rigid.** You can update any artifact at any time. Discover an edge case during GREEN? Go back and add it to the test plan. No phase gates.

**Brownfield-first.** Most work isn't greenfield. Delta coverage tracking makes it easy to specify what test coverage is being added or modified.

**Progressive rigor.** Small changes need minimal ceremony. Complex changes benefit from thorough test plans and design docs.

## The Big Picture

TDD organizes your work into two main areas:

```
┌──────────────────────────────────────────────────────────────────┐
│                            tdd/                                    │
│                                                                    │
│   ┌──────────────────────┐      ┌───────────────────────────────┐│
│   │      coverage/       │      │          changes/              ││
│   │                      │      │                                ││
│   │  Source of truth     │◄─────│  Proposed modifications        ││
│   │  What behavior is    │ merge│  Each change = one folder      ││
│   │  tested and how      │      │  Contains artifacts + deltas   ││
│   │                      │      │                                ││
│   └──────────────────────┘      └───────────────────────────────┘│
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Coverage** is the source of truth — it describes what tests exist for what behavior.

**Changes** are proposed modifications — they live in separate folders until complete.

## The TDD Cycle

```
         ┌─────────────────────────────┐
         │       PLAN                   │
         │  intent → test-plan →        │
         │  design → tasks              │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────────────┐
         │       RED                    │
         │  Write failing tests         │
         │  based on test plan          │
         │  (NO implementation code)    │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────────────┐
         │       GREEN                  │
         │  Write MINIMAL code          │
         │  to make tests pass          │
         │  (NO refactoring yet)        │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────────────┐
         │       REFACTOR               │
         │  Improve code quality        │
         │  Tests must stay green       │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────────────┐
         │       ARCHIVE                │
         │  Merge coverage, archive     │
         └─────────────────────────────┘
```

## Artifacts

### Intent (`intent.md`)

Captures **why** this change is needed, **what** behavior is changing, and **which** test domains are affected.

### Test Plan (`test-plan.md`)

The heart of TDD. Defines test scenarios in Given/When/Then format. Each scenario becomes a real test in the RED phase. Uses delta sections (ADDED/MODIFIED/REMOVED) for tracking.

### Design (`design.md`)

Optional. Captures technical approach, including test strategy (unit vs integration, mocking approach, fixtures needed).

### Tasks (`tasks.md`)

Implementation checklist organized by TDD phase:

```markdown
## 1. RED — Write Failing Tests
- [ ] 1.1 Write test for user login
- [ ] 1.2 Write test for session timeout

## 2. GREEN — Make Tests Pass
- [ ] 2.1 Implement login endpoint
- [ ] 2.2 Implement session management

## 3. REFACTOR — Clean Up
- [ ] 3.1 Extract auth middleware
```

## Delta Coverage

Delta coverage tracks what test coverage is being added, modified, or removed:

```markdown
## ADDED Tests

### Test: User login with valid credentials
- GIVEN a registered user with valid credentials
- WHEN the login endpoint is called
- THEN a 200 status with JWT token is returned

## REMOVED Tests

### Test: Remember me cookie
Reason: Deprecated in favor of 2FA
Migration: Remove remember-me test fixtures
```

When a change is archived, its delta coverage merges into the main `tdd/coverage/` directory.

## Schemas

Schemas define the artifact types and their dependencies:

```yaml
name: test-driven
artifacts:
  - id: intent
    requires: []
  - id: test-plan
    requires: [intent]
  - id: design
    requires: [intent]
  - id: tasks
    requires: [test-plan, design]
```

The dependency graph:

```
              intent
             (root)
                │
      ┌─────────┴─────────┐
      │                   │
      ▼                   ▼
  test-plan            design
      │                   │
      └─────────┬─────────┘
                │
                ▼
             tasks
```

Dependencies are enablers, not gates. You can skip design for simple changes.

## Glossary

| Term | Definition |
|------|------------|
| **Artifact** | A document within a change (intent, test-plan, design, tasks) |
| **Archive** | The process of completing a change and merging its coverage |
| **Change** | A proposed modification, packaged as a folder with artifacts |
| **Coverage** | Documentation of what behavior is tested and how |
| **Delta coverage** | Coverage changes (ADDED/MODIFIED/REMOVED) relative to current |
| **Domain** | A logical grouping for test coverage (e.g., `auth/`, `payments/`) |
| **RED** | TDD phase: write failing tests |
| **GREEN** | TDD phase: write minimal code to pass tests |
| **REFACTOR** | TDD phase: improve code quality, tests stay green |
| **Schema** | A definition of artifact types and their dependencies |
| **Test plan** | Scenarios in Given/When/Then format that become real tests |

## Next Steps

- [Getting Started](getting-started.md) — First steps
- [Workflows](workflows.md) — Common patterns
- [Commands](commands.md) — Full command reference
