# Getting Started

This guide explains how TDD works after you've installed and initialized it.

## How It Works

TDD helps you and your AI coding assistant follow the test-driven development cycle. The workflow:

```
┌────────────────────┐
│ Start a Change     │  /tdd:new
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Create Artifacts   │  /tdd:ff or /tdd:continue
│ (intent, test-plan │
│  design, tasks)    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ RED: Write Tests   │  /tdd:red
│ (all tests fail)   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ GREEN: Implement   │  /tdd:green
│ (make tests pass)  │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ REFACTOR: Clean Up │  /tdd:refactor
│ (tests stay green) │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Archive & Merge    │  /tdd:archive
│ Coverage           │
└────────────────────┘
```

## What TDD Creates

After running `tdd init`, your project has this structure:

```
tdd/
├── coverage/           # Source of truth: what behavior is tested
│   └── <domain>/
│       └── tests.md
├── changes/            # Active changes (one folder per change)
│   └── <change-name>/
│       ├── intent.md       # WHY: Problem statement, motivation
│       ├── test-plan.md    # WHAT: Test scenarios (Given/When/Then)
│       ├── design.md       # HOW: Technical approach
│       ├── tasks.md        # STEPS: Red/Green/Refactor checklist
│       ├── .tdd.yaml       # Change metadata
│       └── coverage/       # Delta coverage changes
│           └── <domain>/
│               └── tests.md
└── config.yaml         # Project configuration
```

## Understanding Artifacts

Each change folder contains artifacts that guide the work:

| Artifact | Purpose |
|----------|---------|
| `intent.md` | The "why" — captures problem, motivation, scope |
| `test-plan.md` | The "what" — test scenarios in Given/When/Then format |
| `design.md` | The "how" — technical approach and test strategy |
| `tasks.md` | The "steps" — Red/Green/Refactor checklist |

Artifacts build on each other:

```
intent ──► test-plan ──► design ──► tasks ──► RED ──► GREEN ──► REFACTOR
  ▲            ▲            ▲
  └────────────┴────────────┘
        update as you learn
```

## Example: Your First Change

### 1. Start the Change

```
You: /tdd:new add-login-validation

AI:  Created tdd/changes/add-login-validation/
     Ready to create: intent
```

### 2. Create Artifacts

```
You: /tdd:ff

AI:  Creating artifacts for add-login-validation...
     ✓ intent.md     — why we need this
     ✓ test-plan.md  — test scenarios
     ✓ design.md     — technical approach
     ✓ tasks.md      — Red/Green/Refactor checklist
     Ready for RED phase!
```

### 3. RED Phase — Write Failing Tests

```
You: /tdd:red

AI:  Writing failing tests...
     ✓ 1.1 Write test: valid email and password accepted
     ✓ 1.2 Write test: empty email rejected
     ✓ 1.3 Write test: password too short rejected
     All tests written. Running tests...
     3 tests failing (expected — no implementation yet).
```

### 4. GREEN Phase — Make Tests Pass

```
You: /tdd:green

AI:  Implementing to pass tests...
     ✓ 2.1 Implement email validation
     ✓ 2.2 Implement password length check
     Running tests... 3 tests passing!
```

### 5. REFACTOR Phase — Clean Up

```
You: /tdd:refactor

AI:  Cleaning up...
     ✓ 3.1 Extract validation utilities
     Running tests... 3 tests still passing!
```

### 6. Archive

```
You: /tdd:archive

AI:  ✓ Merged coverage into tdd/coverage/auth/tests.md
     ✓ Archived to tdd/changes/archive/2025-01-24-add-login-validation/
     Done!
```

## Next Steps

- [Concepts](concepts.md) — How it all fits together
- [Workflows](workflows.md) — Common patterns
- [Commands](commands.md) — Full command reference
- [Customization](customization.md) — Custom schemas and configuration
