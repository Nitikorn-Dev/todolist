# PROMPT 06 — FINAL AUDIT

You are performing the final project audit.

Read:
- CLAUDE.md
- ARCHITECTURE.md
- DATABASE.md
- IMPLEMENTATION_PLAN.md
- TEAM_WORKFLOW.md

Do NOT add new features.

Audit:

### Functional
- Sign Up
- Sign In
- Sign Out
- protected routes
- task CRUD
- assignment
- priority
- due date
- drag & drop
- reorder
- dashboard
- ADMIN/MEMBER
- admin access
- theme

### Security
- RLS enabled
- server-side authorization
- no service-role key exposure
- no secrets committed
- no manual password storage
- no client-only security
- tests do not use production credentials/data

### Testing
Run:
- unit tests
- integration tests
- critical E2E tests

Confirm:
- meaningful business logic has unit coverage
- important DB/auth boundaries have integration coverage
- critical user journeys have E2E coverage
- no tests were weakened merely to pass

### Quality
Run available:
- lint
- typecheck
- build

Review:
- unnecessary dependencies
- dead code
- scope creep
- broken documentation
- obvious accessibility issues

Fix ONLY defects required for the audit.

Do not introduce new features.

Final report:
1. feature status
2. unit test result
3. integration test result
4. E2E result
5. lint/typecheck/build result
6. security status
7. changed files
8. known remaining issues
9. explicit out-of-scope items
10. readiness recommendation

STOP.
