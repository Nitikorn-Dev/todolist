# IMPLEMENTATION_PLAN.md

## Goal

Build a simple, testable Task Management application with a 4-person team.

---

# Phase 0 — Reference Analysis
Owner: All

Read the reference repository and identify:
- stack
- architecture
- auth
- database
- board/task model
- drag/drop
- useful concepts
- unnecessary features
- risks
- dependencies worth keeping

Do not copy the project.

Output:
- agreed architecture
- agreed scope
- test strategy
- ownership

STOP.

---

# Phase 1 — Foundation
Owner: Person 1

Implement:
- new project setup
- Next.js/TypeScript foundation
- styling/UI foundation
- lint/typecheck/build setup
- testing foundation if not already configured

Testing:
- establish test runner
- add one or more smoke/unit tests proving the test setup works

Do not implement business features.

STOP.

---

# Phase 2 — Authentication
Owner: Person 1

Implement:
- Sign Up
- Sign In
- Sign Out
- session handling
- protected routes
- auth validation

Tests:
- unit tests for validation
- unit tests for relevant auth helpers
- integration tests for important protected/auth behavior where practical

Do not implement task board, dashboard, admin, or theme.

STOP.

---

# Phase 3 — Database Foundation
Owner: Person 2

Implement:
- profiles
- boards
- columns
- tasks
- relationships
- indexes
- migrations
- RLS foundation
- generated DB types

Tests:
- integration tests for important DB access/persistence
- RLS behavior tests where test infrastructure supports it

Do not build task UI.

STOP.

---

# Phase 4 — Roles & Authorization
Owner: Person 2

Implement:
- ADMIN/MEMBER
- server-side authorization
- admin route protection
- RLS authorization
- admin user management foundation

Tests:
- unit tests for permission decisions
- integration tests for authorized vs unauthorized access
- important RLS cases

Do not implement task board or dashboard.

STOP.

---

# Parallel Gate

Only begin parallel work after:
- Foundation is stable
- Auth is stable
- Database schema/RLS is available
- Authorization contract is agreed

Then:

Person 3 -> Phase 5 + 6
Person 4 -> Phase 7 + 9
Person 2 -> Phase 8

---

# Phase 5 — Task Board
Owner: Person 3

Implement:
- board
- columns
- task list
- create/read/update/delete task
- assignment
- priority
- due date

Tests:
- task validation unit tests
- task business logic unit tests
- task persistence integration tests where practical

If DB change is required:
STOP and request Person 2.

STOP.

---

# Phase 6 — Drag & Drop
Owner: Person 3

Implement:
- reorder within column
- move between columns
- persist column_id
- persist position

Tests:
- reorder unit tests
- boundary/invalid position tests
- persistence integration test
- regression test for moving between columns

STOP.

---

# Phase 7 — Dashboard
Owner: Person 4

Implement:
- Total Tasks
- Todo
- In Progress
- Completed
- High Priority
- Recent Tasks

Tests:
- dashboard aggregation unit tests
- transformation tests
- important integration behavior if practical

Stats must come from real data.

STOP.

---

# Phase 8 — Admin Users
Owner: Person 2

Implement:
- admin user list
- appropriate admin user management actions
- authorization enforcement

Tests:
- permission unit tests
- admin-only integration tests
- unauthorized access tests

Do not weaken RLS.

STOP.

---

# Phase 9 — Theme
Owner: Person 4

Implement:
- light mode
- dark mode
- persisted theme preference

Tests:
- theme selection logic
- persistence logic
- relevant UI behavior

STOP.

---

# Phase 10 — UI/UX
Owner: Person 4

Polish:
- responsive layout
- loading states
- error states
- empty states
- form feedback
- accessibility basics

Tests:
- only meaningful user behavior
- do not create brittle tests for visual markup

STOP.

---

# Phase 11 — Integration
Owner: All

No new features.

Verify full flow:

Sign Up
-> Sign In
-> Dashboard
-> Board
-> Create Task
-> Update Task
-> Drag/Drop
-> Dashboard updates
-> Admin/MEMBER permissions
-> Theme persistence

Testing:
- integration suite
- cross-module regression tests
- E2E critical journeys

Fix only integration/regression issues.

STOP.

---

# Phase 12 — Final Audit
Owner: All

Verify:
- feature scope
- auth
- roles
- RLS
- task CRUD
- drag/drop
- dashboard
- theme
- tests
- security
- lint
- typecheck
- build
- documentation

Test target:
- Unit tests pass
- Integration tests pass
- E2E critical flows pass

Do not add new features.

STOP.

---

## Phase Completion Report

Every phase must report:

1. What was implemented
2. Files changed
3. Tests added
4. Tests executed
5. Test result
6. Database changes
7. Known issues
8. Out-of-scope items
9. Next phase dependency

Then STOP.
