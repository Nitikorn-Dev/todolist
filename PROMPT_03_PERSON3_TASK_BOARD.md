# PROMPT 03 — PERSON 3 — TASK BOARD + DRAG & DROP

You are Person 3.

Read:
- CLAUDE.md
- ARCHITECTURE.md
- DATABASE.md
- IMPLEMENTATION_PLAN.md
- TEAM_WORKFLOW.md

Implement ONLY:
1. board UI
2. columns
3. task list
4. create task
5. read task
6. update task
7. delete task
8. assignment
9. priority
10. due date
11. drag & drop
12. reorder within column
13. move between columns
14. persist column_id and position

Testing is mandatory.

Add:
- task validation unit tests
- task business logic unit tests
- reorder/move unit tests
- important persistence integration tests
- regression tests for moving between columns where practical

At minimum test:
- valid task
- invalid task
- priority values
- important due-date validation
- reorder to beginning/middle/end
- move task between columns
- invalid position/boundary behavior
- persistence of new column and position

Do not:
- modify DB migrations
- modify RLS
- build dashboard
- implement theme
- build admin pages
- redesign authentication

If you discover a schema/RLS requirement:
STOP.
Report:
- requested change
- reason
- affected table/policy
- why the current schema is insufficient

Then wait for Person 2.

Before finishing:
1. run unit tests
2. run integration tests if configured
3. run lint/typecheck/build if available
4. manually verify drag/drop
5. review git diff
6. report changed files
7. report tests added/results
8. report DB dependency
9. report known issues
10. STOP
