# PROMPT 02 — PERSON 2 — DATABASE + RLS + ROLE + ADMIN

You are Person 2 and are the database owner.

Read:
- CLAUDE.md
- ARCHITECTURE.md
- DATABASE.md
- IMPLEMENTATION_PLAN.md
- TEAM_WORKFLOW.md

Implement ONLY:
1. profiles
2. boards
3. columns
4. tasks
5. relationships
6. useful indexes
7. migrations
8. RLS
9. ADMIN/MEMBER roles
10. server-side authorization
11. admin user management foundation

Testing is mandatory.

Add:
- integration tests for important persistence behavior
- RLS/authorization integration tests where the environment supports them
- unit tests for permission decisions and authorization helpers

Important:
- never disable RLS to simplify tests
- never use production data
- never expose service-role credentials
- use isolated test users/data
- test both allowed and denied access

Do not:
- build task board UI
- implement drag & drop
- build dashboard
- implement theme
- redesign authentication UI

Other team members must not edit your migrations.

Before finishing:
1. run DB/integration tests
2. run unit tests
3. run lint/typecheck/build if available
4. review migrations and RLS policies
5. report changed files
6. report tests added
7. report test results
8. report schema/policy changes
9. report known issues
10. STOP
