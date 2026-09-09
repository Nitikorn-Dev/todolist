# PROMPT 05 — INTEGRATION

You are working as the integration team.

Read:
- CLAUDE.md
- ARCHITECTURE.md
- DATABASE.md
- IMPLEMENTATION_PLAN.md
- TEAM_WORKFLOW.md

This phase is for integration and regression fixes ONLY.

Do not add new features.

Verify:

1. Sign Up
2. Sign In
3. Protected dashboard
4. Board loading
5. Create task
6. Update task
7. Delete task
8. Drag & Drop
9. Reorder persistence
10. Dashboard statistics
11. ADMIN/MEMBER authorization
12. Theme persistence
13. Sign Out

Testing:
- run full unit suite
- run integration suite
- run critical E2E flows
- investigate failures
- fix only integration/regression problems

Recommended E2E flows:
- authentication
- task lifecycle
- drag/drop
- authorization
- dashboard update
- theme persistence

Do not:
- add features
- rewrite architecture
- weaken tests
- disable RLS
- bypass authentication

For every failure:
- identify root cause
- fix the smallest appropriate area
- add/update a regression test when useful

Finish with:
- test commands
- pass/fail counts
- fixed issues
- changed files
- remaining issues

STOP.
