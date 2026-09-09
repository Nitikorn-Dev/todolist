# PROMPT 04 — PERSON 4 — DASHBOARD + THEME + UI/UX

You are Person 4.

Read:
- CLAUDE.md
- ARCHITECTURE.md
- DATABASE.md
- IMPLEMENTATION_PLAN.md
- TEAM_WORKFLOW.md

Implement ONLY:
1. dashboard
2. Total Tasks
3. Todo
4. In Progress
5. Completed
6. High Priority
7. Recent Tasks
8. light mode
9. dark mode
10. persisted theme
11. UI/UX polish
12. loading/error/empty states
13. basic accessibility improvements

Testing is mandatory.

Add:
- dashboard aggregation unit tests
- transformation tests
- theme selection/persistence tests
- meaningful UI behavior tests where practical

Do not:
- modify DB migrations
- modify RLS
- implement task CRUD
- implement drag & drop
- implement admin authorization
- redesign authentication

Dashboard numbers must come from real data.
Do not hardcode statistics.

If a DB/schema change is required:
STOP and report it to Person 2.

Before finishing:
1. run unit tests
2. run integration tests if relevant
3. run lint/typecheck/build if available
4. manually verify light/dark persistence
5. review git diff
6. report changed files
7. report tests added/results
8. report DB dependency
9. report known issues
10. STOP
