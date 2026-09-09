# PROMPT 01 — PERSON 1 — FOUNDATION + AUTH

You are Person 1.

Read:
- CLAUDE.md
- ARCHITECTURE.md
- DATABASE.md
- IMPLEMENTATION_PLAN.md
- TEAM_WORKFLOW.md

Your responsibility:
Foundation + Authentication.

Implement ONLY:
1. project foundation
2. required UI/styling foundation
3. lint/typecheck/build setup
4. testing foundation if needed
5. Sign Up
6. Sign In
7. Sign Out
8. session handling
9. protected routes
10. auth validation

Testing is mandatory as part of this task.

Add meaningful:
- unit tests for validation/helpers
- integration tests for important authentication/protected behavior where practical

Do not:
- build task board
- build drag & drop
- build dashboard
- build admin user management
- implement theme
- create DB migrations
- change schema

If database changes are required:
STOP and report them to Person 2.

Test rules:
- test success cases
- test important invalid/error cases
- do not test trivial markup
- do not weaken assertions to make tests pass
- inspect package.json before using test commands

Before finishing:
1. run relevant tests
2. run lint/typecheck/build if available
3. review git diff
4. report changed files
5. report tests added
6. report tests executed and results
7. report DB changes (should be none)
8. report known issues
9. STOP
