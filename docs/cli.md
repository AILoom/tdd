# CLI Reference

Terminal commands for managing TDD projects. For AI slash commands, see [Commands](commands.md).

## Project Commands

### `tdd init`

Initialize TDD in your project.

```bash
tdd init [--tools <tools>] [--schema <schema>]
```

| Option | Description |
|--------|-------------|
| `--tools` | Comma-separated tool IDs, or `all`, `none` |
| `--schema` | Default schema (default: `test-driven`) |

Without `--tools`, prompts interactively for tool selection.

**Available tool IDs:** `cursor`, `claude`, `github-copilot`, `windsurf`, `cline`, `codex`

### `tdd update`

Regenerate AI tool integrations.

```bash
tdd update [--tools <tools>]
```

### `tdd status`

Show overall project status — active changes, task progress.

```bash
tdd status
```

### `tdd view`

Interactive dashboard showing project overview with progress bars.

```bash
tdd view
```

---

## Change Commands

### `tdd change new`

Create a new TDD change.

```bash
tdd change new <name> [--schema <schema>]
```

### `tdd list`

List active changes.

```bash
tdd list
```

### `tdd show`

Show details of a specific change.

```bash
tdd show <name>
```

### `tdd validate`

Validate a change's artifact structure.

```bash
tdd validate <name>
```

Checks:
- `.tdd.yaml` metadata exists
- `intent.md` has required sections (Why, What Changes)
- `test-plan.md` has test scenarios with Given/When/Then
- `tasks.md` has Red/Green/Refactor phase sections with checkboxes

### `tdd archive`

Archive a completed change.

```bash
tdd archive <name> [--no-sync]
```

| Option | Description |
|--------|-------------|
| `--no-sync` | Skip syncing delta coverage to main |

---

## Schema Commands

### `tdd schema list`

List available schemas.

```bash
tdd schema list
```

### `tdd schema init`

Create a new custom schema.

```bash
tdd schema init <name> [--description <desc>] [--artifacts <ids>]
```

### `tdd schema fork`

Fork an existing schema for customization.

```bash
tdd schema fork <source> <name>
```

### `tdd schema validate`

Validate a schema definition.

```bash
tdd schema validate <name>
```

Checks syntax, template existence, and circular dependencies.

## Next Steps

- [Commands](commands.md) — AI slash commands
- [Customization](customization.md) — Custom schemas
