# CLAUDE.md

## 1. Project Identity

This is a university/student Task Management application inspired by the public reference repository:

https://github.com/Mshandev/Trello-Clone

The reference repository is for technical study only. Build this project as a new project/repository. Do not blindly copy the entire reference repository.

The application should be simple, explainable, maintainable, and suitable for a 4-person university team.

---

## 2. Required Features

### Authentication
- Sign Up
- Sign In
- Sign Out
- Session handling
- Protected routes

### Task Management
- Board
- Columns
- Tasks
- Task CRUD
- Drag & Drop
- Reorder tasks
- Move tasks between columns
- Assign task to user
- Priority: LOW / MEDIUM / HIGH
- Due date

### Roles
- ADMIN
- MEMBER
- Authorization
- Admin user management

### Dashboard
- Total Tasks
- Todo
- In Progress
- Completed
- High Priority
- Recent Tasks

### Theme
- Light mode
- Dark mode
- Persist theme preference

---

## 3. Explicit Non-Goals

Do NOT add these unless the user explicitly changes the specification:

- Email verification
- Forgot password
- Social login
- 2FA / MFA
- Chat
- Comments
- Attachments
- Notifications
- Activity logs
- Real-time collaboration
- AI features
- Advanced search/filtering
- Automation
- Calendar integrations
- External integrations
- Payment/subscription
- Enterprise permission systems

Do not invent features merely because the reference project contains them.

---

## 4. Source of Truth

Read these files before implementation:

1. CLAUDE.md
2. ARCHITECTURE.md
3. DATABASE.md
4. IMPLEMENTATION_PLAN.md
5. TEAM_WORKFLOW.md

Priority:

Latest explicit user instruction
> CLAUDE.md
> ARCHITECTURE.md
> DATABASE.md
> IMPLEMENTATION_PLAN.md
> TEAM_WORKFLOW.md

---

## 5. Strict Scope Control

Implement ONLY the requested phase/task.

Do not:
- refactor unrelated modules
- introduce future features
- redesign unrelated modules
- change database schema without authorization
- replace the selected stack without a clear requirement
- add unnecessary dependencies
- add speculative abstractions

If a requirement conflicts with these documents, stop and report the conflict instead of silently inventing a solution.

---

## 6. Testing Is Part of the Definition of Done

Every person is responsible for tests for the business logic they implement.

### Required test levels

#### Unit Test
Use unit tests for deterministic business logic such as:
- validation
- permission decisions
- calculations
- task ordering/reorder logic
- data transformation
- pure utility functions

Do NOT waste effort testing trivial markup or framework internals.

For new business logic, normally cover:
- normal/success case
- important invalid/error case
- important boundary/edge case when applicable

#### Integration Test
Integration tests verify meaningful boundaries such as:
- application logic + database
- authentication/session + protected behavior
- authorization + data access
- task operations + persistence

Do not require a real production database for ordinary unit tests.

Integration test strategy must follow the project's actual stack and tooling.

#### E2E Test
E2E tests verify critical user journeys through the application UI.

Minimum critical journeys:
1. Sign up/sign in
2. Protected dashboard access
3. Create task
4. Move/reorder task
5. Update task
6. Dashboard reflects task state
7. ADMIN/MEMBER authorization behavior
8. Theme persistence

Keep E2E tests focused. Do not attempt to test every UI element.

---

## 7. Test Ownership

Person 1:
- Foundation/auth tests
- auth validation
- session/protected behavior
- auth-related integration tests where practical

Person 2:
- database/authorization tests
- role permission logic
- RLS/data-access integration tests where practical
- admin authorization

Person 3:
- task/board business logic tests
- task validation
- reorder/move logic
- task persistence integration tests where practical

Person 4:
- dashboard calculation/transformation tests
- theme logic tests
- relevant UI behavior tests where practical

All team members:
- fix regressions caused by their own module
- do not delete or weaken tests just to make CI pass

Phase 11:
- Integration test pass
- cross-module regression tests
- resolve integration failures

Phase 12:
- final Unit + Integration + E2E audit

---

## 8. Test Quality Rules

A test must fail for the right reason.

Do not:
- write tests that only assert a mock was called when real behavior can be tested
- duplicate dozens of nearly identical tests
- test implementation details unnecessarily
- weaken assertions to make failures disappear
- skip tests because implementation is inconvenient
- mock everything in integration tests
- use production credentials or secrets
- commit `.env` secrets

Prefer readable test names:

describe("reorderTasks", () => {
  it("moves a task to the requested position", ...)
  it("preserves the order of unaffected tasks", ...)
  it("rejects an invalid position", ...)
})

Use the testing framework already present in the project when possible. If no framework exists, select a small, appropriate framework only when needed and document the choice.

Never invent package scripts. Inspect package.json first.

---

## 9. Test Commands

Before running commands, inspect package.json.

Use only scripts that actually exist, for example:

npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build

If a command does not exist:
- do not pretend it ran
- either use the actual available command
- or report that the script/tooling has not yet been configured

---

## 10. Phase Gate

After completing a phase:

1. Run relevant tests.
2. Run lint/typecheck/build when available.
3. Review git diff.
4. Report:
   - implemented features
   - changed files
   - tests added
   - tests executed and result
   - database changes
   - known issues
   - intentionally out-of-scope items
5. STOP.

Never continue into the next phase automatically.

---

## 11. Team Ownership

Person 1:
Foundation + Authentication

Person 2:
Database + RLS + Roles + Authorization + Admin

Person 3:
Task Management + Board + Drag & Drop

Person 4:
Dashboard + Theme + UI/UX

Person 2 owns database schema/migrations.

If Person 1/3/4 discovers a required schema change:
STOP and report the requested schema change to Person 2.
Do not edit migrations independently.

---

## 12. Shared File Rules

Treat these as high-conflict files:

- package.json
- lockfile
- root layout
- global CSS
- shared UI components
- generated DB types
- shared application types
- environment configuration

Avoid casual edits.

If a shared change is necessary:
- make the smallest change
- explain why
- inform the team
- include it in the completion report

---

## 13. Security

Never:
- commit secrets
- expose Supabase service-role credentials
- store passwords manually
- disable RLS to simplify development
- rely only on client-side authorization
- bypass authorization for tests
- use production credentials in automated tests

Use safe test fixtures and isolated test data.

---

## 14. Student Project Principle

Prefer:
- simple architecture
- clear naming
- understandable code
- small functions
- explainable database design
- meaningful tests
- evidence of individual contributions

Avoid:
- unnecessary enterprise patterns
- premature optimization
- over-engineering
- huge abstractions

The goal is not maximum feature count. The goal is a working, testable, explainable application.
