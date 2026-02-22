# Test-Driven Development : TDD

**Get your AI to write tests first.** A small CLI and set of slash commands that wire Red/Green/Refactor into your existing AI assistant (Cursor, Claude Code, Copilot, and others).

---

## The problem

Assistants are great at writing code and weak at writing tests. They tend to implement first and test later or skip tests. This framework keeps the cycle explicit: **plan tests → write failing tests → implement → refactor**, with one change per folder and coverage tracked in the repo.

---

## Install and run

Node.js 20+ required.

```bash
npm install -g @ailoom/tdd
cd your-project
tdd init
```

Pick your tools when prompted (or use `tdd init --tools cursor,claude`). Then in chat: `**/tdd:new add-thing**` to start a change.

---

## What you get

Each change lives in `tdd/changes/<name>/` with:


| File           | Role                                              |
| -------------- | ------------------------------------------------- |
| `intent.md`    | Why we’re doing this, scope, impact               |
| `test-plan.md` | Scenarios to implement as tests (Given/When/Then) |
| `design.md`    | How we’ll build it (optional)                     |
| `tasks.md`     | Checklist: RED → GREEN → REFACTOR                 |


The flow:

1. **Plan** — `/tdd:ff` (or `/tdd:continue`) fills intent → test-plan → design → tasks.
2. **RED** — `/tdd:red`: AI writes **only** tests from the plan; they must fail.
3. **GREEN** — `/tdd:green`: AI writes the smallest code that makes those tests pass.
4. **REFACTOR** — `/tdd:refactor`: AI cleans up; you re-run tests after each step.
5. **Done** — `/tdd:archive` moves the change to the archive and updates `tdd/coverage/`.

So the contract is the **test plan**; the loop is always Red → Green → Refactor.

---

## Slash commands (in your AI chat)


| Command         | Use it to                                  |
| --------------- | ------------------------------------------ |
| `/tdd:new`      | Start a new change                         |
| `/tdd:ff`       | Generate all planning docs in one go       |
| `/tdd:continue` | Generate the next doc step-by-step         |
| `/tdd:red`      | Write failing tests (no implementation)    |
| `/tdd:green`    | Implement until tests pass                 |
| `/tdd:refactor` | Refactor while keeping tests green         |
| `/tdd:verify`   | Check implementation vs plan and run tests |
| `/tdd:archive`  | Archive the change and update coverage     |


There are also `/tdd:explore` (before committing to a change) and `/tdd:sync` (merge coverage without archiving). Full list and behavior are in [Commands](docs/commands.md).

---

## Terminal commands

```bash
tdd init [--tools ...] [--schema test-driven]
tdd change new <name>
tdd list | tdd show <name> | tdd status | tdd view
tdd validate <name>
tdd archive <name> [--no-sync]
tdd schema list | init | fork | validate
tdd update [--tools ...]
```

Details: [CLI reference](docs/cli.md). Tool list and install paths: [Supported tools](docs/supported-tools.md).

---

## Why this exists

- **Tests first** — The plan is “what tests to write”; the AI is constrained to that before writing production code.
- **Red then green** — RED phase is tests-only; GREEN is minimal implementation. No “implement and test later.”
- **Refactor with guardrails** — REFACTOR runs with “tests must stay green” built into the instructions.
- **One change, one folder** — Same idea as “one change, one folder” in spec-driven tools, but the content is test-plan + tasks, and the apply step is split into red/green/refactor.
- **Coverage as docs** — `tdd/coverage/` (and per-change deltas) record what’s tested; archiving merges that into the main coverage docs.

---

## Docs

- [Getting started](docs/getting-started.md)
- [Concepts](docs/concepts.md)
- [Commands](docs/commands.md)
- [Workflows](docs/workflows.md)
- [CLI](docs/cli.md)
- [Customization](docs/customization.md)

---

## Development

```bash
npm install
npm run build
npm test
```

MIT