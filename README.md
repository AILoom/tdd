# TDD

Test-driven development framework for AI coding assistants.

Our philosophy:

```
→ test-first not code-first
→ red/green/refactor explicitly
→ fluid not rigid
→ built for brownfield not just greenfield
→ progressive rigor from quick to thorough
```

## See it in action

```
You: /tdd:new add-user-auth
AI:  Created tdd/changes/add-user-auth/
     Ready to create: intent

You: /tdd:ff
AI:  ✓ intent.md     — why we're doing this
     ✓ test-plan.md  — what tests to write (Given/When/Then)
     ✓ design.md     — technical approach
     ✓ tasks.md      — Red/Green/Refactor checklist
     Ready for RED phase!

You: /tdd:red
AI:  Writing failing tests...
     ✓ 1.1 Write test for login with valid credentials
     ✓ 1.2 Write test for login with invalid password
     ✓ 1.3 Write test for session timeout
     All tests written and failing!

You: /tdd:green
AI:  Implementing to pass tests...
     ✓ 2.1 Implement login endpoint
     ✓ 2.2 Implement session management
     All tests passing!

You: /tdd:refactor
AI:  Cleaning up code...
     ✓ 3.1 Extract auth middleware
     ✓ 3.2 Add JSDoc documentation
     All tests still green!

You: /tdd:archive
AI:  Archived to tdd/changes/archive/2025-01-24-add-user-auth/
     Coverage updated. Ready for the next feature.
```

## Quick Start

**Requires Node.js 20 or higher.**

Install globally:

```bash
npm install -g @ailoom/tdd
```

Initialize in your project:

```bash
cd your-project
tdd init
```

Now tell your AI: `/tdd:new <change-name>`

## How It Works

TDD adds a lightweight test-planning layer so you and your AI assistant agree on
**what tests to write** before any code is written. The workflow follows the classic
Red/Green/Refactor cycle:

1. **Plan** — Define intent, test scenarios, design, and tasks
2. **RED** — Write failing tests based on the test plan
3. **GREEN** — Write minimal code to make tests pass
4. **REFACTOR** — Clean up without breaking tests
5. **Archive** — Complete the change, update coverage docs

## Commands

| Command | Purpose |
|---------|---------|
| `/tdd:explore` | Investigate before committing to a change |
| `/tdd:new` | Start a new TDD change |
| `/tdd:continue` | Create the next artifact based on dependencies |
| `/tdd:ff` | Fast-forward: create all planning artifacts at once |
| `/tdd:red` | Write failing tests from the test plan |
| `/tdd:green` | Write minimal code to make tests pass |
| `/tdd:refactor` | Clean up code while keeping tests green |
| `/tdd:verify` | Verify implementation matches test plan |
| `/tdd:sync` | Merge delta coverage into main coverage |
| `/tdd:archive` | Archive a completed change |

## CLI Reference

```bash
tdd init [--tools cursor,claude] [--schema test-driven]
tdd change new <name> [--schema <name>]
tdd list
tdd show <name>
tdd status
tdd validate <name>
tdd archive <name> [--no-sync]
tdd view
tdd schema list
tdd schema init <name>
tdd schema fork <source> <name>
tdd schema validate <name>
tdd update [--tools cursor,claude]
```

## Supported Tools

| Tool | Skills Location | Commands Location |
|------|-----------------|-------------------|
| Cursor | `.cursor/skills/` | `.cursor/commands/` |
| Claude Code | `.claude/skills/` | `.claude/commands/tdd/` |
| GitHub Copilot | `.github/skills/` | `.github/prompts/` |
| Windsurf | `.windsurf/skills/` | `.windsurf/workflows/` |
| Cline | `.cline/skills/` | `.clinerules/workflows/` |
| Codex | `.codex/skills/` | `.codex/skills/` |

## Docs

- **[Getting Started](docs/getting-started.md)**: First steps
- **[Concepts](docs/concepts.md)**: How it all fits together
- **[Commands](docs/commands.md)**: Slash commands and skills
- **[Workflows](docs/workflows.md)**: Common patterns
- **[CLI](docs/cli.md)**: Terminal reference
- **[Customization](docs/customization.md)**: Custom schemas and configuration

## Why TDD with AI?

AI coding assistants are powerful but often skip the test-writing step. TDD ensures:

- **Tests come first** — AI writes tests before implementation, catching design issues early
- **Minimal implementation** — GREEN phase prevents over-engineering
- **Safe refactoring** — Tests provide a safety net for cleanup
- **Traceable behavior** — Test plans document what the system should do
- **Predictable results** — Structured workflow replaces ad-hoc prompting

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
