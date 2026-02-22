# Workflows

Common workflow patterns for TDD and when to use each one.

## Quick TDD Cycle

When you know what to build and just need to execute:

```
/tdd:new ──► /tdd:ff ──► /tdd:red ──► /tdd:green ──► /tdd:refactor ──► /tdd:archive
```

**Best for:** Small to medium features, bug fixes, straightforward changes.

## Exploratory

When requirements are unclear:

```
/tdd:explore ──► /tdd:new ──► /tdd:continue (repeat) ──► /tdd:red ──► ...
```

**Best for:** Performance issues, unclear requirements, architectural decisions.

## Parallel Changes

Work on multiple changes at once:

```
Change A: /tdd:new ──► /tdd:ff ──► /tdd:red (in progress)
                                       │
                                  context switch
                                       │
Change B: /tdd:new ──► /tdd:ff ──► /tdd:red ──► /tdd:green
```

Changes are isolated in separate folders. Switch freely between them.

## Test-First Bug Fix

When fixing a bug with TDD:

```
/tdd:new fix-auth-bug ──► /tdd:ff
```

1. **Intent**: Describe the bug and expected behavior
2. **Test plan**: Write a test that reproduces the bug
3. **RED**: Write the reproducing test (it fails, confirming the bug)
4. **GREEN**: Fix the bug (test passes)
5. **REFACTOR**: Clean up if needed

This pattern ensures the bug stays fixed — the test prevents regression.

## When to Use What

| Situation | Workflow |
|-----------|----------|
| Clear requirements, ready to build | Quick TDD Cycle |
| Exploring, need to investigate | Exploratory |
| Multiple things in flight | Parallel Changes |
| Bug that needs a regression test | Test-First Bug Fix |
| Complex feature, want control | Step-by-step with `/tdd:continue` |

### `/tdd:ff` vs `/tdd:continue`

| Situation | Use |
|-----------|-----|
| Clear scope, ready to go | `/tdd:ff` |
| Want to review each artifact | `/tdd:continue` |
| Complex change, want control | `/tdd:continue` |
| Time pressure | `/tdd:ff` |

## Best Practices

### Keep Changes Focused

One logical unit of work per change. If "add feature X and refactor Y" are independent, make two changes.

### Write Specific Test Scenarios

Good test plan scenarios are:
- Concrete (specific inputs and outputs)
- Complete (cover happy path, edge cases, errors)
- Independent (don't depend on each other's order)

### Run Tests After Every Phase

- After RED: all new tests should fail
- After GREEN: all tests should pass
- After REFACTOR: all tests should still pass

### Verify Before Archiving

Use `/tdd:verify` to catch mismatches between plan and implementation.

## Next Steps

- [Commands](commands.md) — Full command reference
- [Concepts](concepts.md) — Core concepts
- [Customization](customization.md) — Custom schemas
