# Supported Tools

When you run `tdd init`, you can choose which AI tools to configure. The CLI installs skills and command bindings into the right directories for each tool.

| Tool | Skills | Commands |
|------|--------|----------|
| Cursor | `.cursor/skills/` | `.cursor/commands/` |
| Claude Code | `.claude/skills/` | `.claude/commands/tdd/` |
| GitHub Copilot | `.github/skills/` | `.github/prompts/` |
| Windsurf | `.windsurf/skills/` | `.windsurf/workflows/` |
| Cline | `.cline/skills/` | `.clinerules/workflows/` |
| Codex | `.codex/skills/` | `.codex/skills/` |

Non-interactive setup:

```bash
tdd init --tools cursor,claude
tdd init --tools all
tdd init --tools none
```

To refresh after upgrading the package: `tdd update` (optionally with `--tools`).
