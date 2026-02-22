# Customization

TDD provides three levels of customization:

| Level | What it does | Best for |
|-------|--------------|----------|
| **Project Config** | Set defaults, inject context/rules | Most teams |
| **Custom Schemas** | Define your own workflow artifacts | Unique processes |
| **Schema Forking** | Modify built-in schemas | Quick customization |

## Project Configuration

The `tdd/config.yaml` file customizes TDD for your project:

```yaml
schema: test-driven

context: |
  Tech stack: TypeScript, React, Node.js, PostgreSQL
  Test framework: Vitest + React Testing Library
  Coverage target: 80%

rules:
  test-plan:
    - Include performance benchmarks for API endpoints
    - Use Given/When/Then format strictly
  tasks:
    - Include test runner commands for each phase
  design:
    - Document mocking strategy for external services
```

### How It Works

- **`schema`**: Default schema for new changes
- **`context`**: Injected into ALL artifact prompts — tell the AI about your stack
- **`rules`**: Per-artifact rules — only appear for the matching artifact type

## Custom Schemas

Create custom schemas for your team's workflow.

### Fork an Existing Schema

```bash
tdd schema fork test-driven my-workflow
```

This copies the entire `test-driven` schema to `tdd/schemas/my-workflow/` where you can edit it.

### Create from Scratch

```bash
tdd schema init rapid --description "Minimal TDD" --artifacts intent,tasks
```

### Schema Structure

```yaml
name: my-workflow
version: 1
description: My team's custom workflow

artifacts:
  - id: intent
    generates: intent.md
    description: Why this change is needed
    template: intent.md
    instruction: |
      Create an intent document...
    requires: []

  - id: tasks
    generates: tasks.md
    description: Implementation checklist
    template: tasks.md
    requires: [intent]

apply:
  requires: [tasks]
  tracks: tasks.md
```

### Example: Minimal Schema

Skip design and test-plan for quick iterations:

```yaml
name: rapid-tdd
version: 1
description: Fast TDD cycle — intent straight to tasks

artifacts:
  - id: intent
    generates: intent.md
    template: intent.md
    requires: []

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [intent]

apply:
  requires: [tasks]
  tracks: tasks.md
```

### Example: Adding a Review Step

```yaml
artifacts:
  # ... existing artifacts ...

  - id: review
    generates: review.md
    description: Pre-implementation review
    template: review.md
    instruction: |
      Create a review checklist covering test quality,
      edge cases, and coverage gaps.
    requires: [test-plan]

  - id: tasks
    generates: tasks.md
    requires: [test-plan, design, review]  # Now requires review too
```

### Validate Your Schema

```bash
tdd schema validate my-workflow
```

Checks syntax, template existence, and circular dependencies.

### Use Your Schema

```bash
tdd change new feature --schema my-workflow
```

Or set as default in `tdd/config.yaml`:

```yaml
schema: my-workflow
```

## Next Steps

- [CLI](cli.md) — Full terminal reference
- [Concepts](concepts.md) — Core concepts
