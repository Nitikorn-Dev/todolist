# TEAM_WORKFLOW.md

## 1. Team Ownership

Person 1
- Foundation
- Authentication
- Auth tests

Person 2
- Database
- RLS
- Roles
- Authorization
- Admin
- DB/authorization tests

Person 3
- Board
- Columns
- Tasks
- Drag & Drop
- Task tests

Person 4
- Dashboard
- Theme
- UI/UX
- Dashboard/theme tests

All:
- integration
- E2E
- final audit

---

## 2. Git Strategy

main
  <- develop
      <- feature/authentication
      <- feature/database-role
      <- feature/task-board
      <- feature/dashboard-theme

Do not push directly to main.

Use feature branches and PRs into develop.

---

## 3. Daily Workflow

Before starting:

git checkout develop
git pull

git checkout -b feature/<name>

Then inspect:

git status
git diff

Before commit:
- run relevant tests
- run lint/typecheck if available
- review diff

Commit example:

git commit -m "feat: add task reorder logic"

Push:

git push -u origin feature/<name>

Open PR into develop.

---

## 4. PR Requirements

Every PR should include:

- summary
- scope
- changed files
- tests added
- tests executed
- test result
- database changes
- screenshots if UI changed
- known issues
- out-of-scope items

---

## 5. Test Ownership

The person who writes a feature owns its tests.

Do not create a situation where:
"Person 3 wrote the task feature but Person 4 must later figure out all task tests."

Tests should be committed with the feature whenever possible.

---

## 6. Shared Files

Coordinate changes to:

- package.json
- lockfile
- root layout
- global CSS
- shared UI
- generated DB types
- shared types
- env configuration
- test configuration

If two branches need the same shared file:
- coordinate first
- keep changes minimal
- resolve conflicts with the owner

---

## 7. Database Ownership

Person 2 owns:
- schema
- migrations
- RLS
- DB policies
- generated DB types

Other people must not independently change migrations.

If required:

Person 3:
"Task feature requires task.updated_by field because ..."

Person 2:
- reviews requirement
- creates migration
- updates policies/types

Then Person 3 continues.

---

## 8. Test Environment

Tests must be safe.

Never:
- test against production data
- commit real credentials
- expose service-role keys
- disable authorization for tests

Use:
- test fixtures
- test users
- isolated database
- documented environment variables

---

## 9. Integration Timing

Do not wait until the final day to discover integration conflicts.

Recommended:
- each PR includes unit tests
- important integration tests are added with the relevant feature
- after parallel branches merge, run the complete integration/E2E pass

---

## 10. Conflict Ownership

Database/RLS -> Person 2
Auth -> Person 1
Task -> Person 3
Dashboard/theme -> Person 4
Shared files -> discuss as a team

---

## 11. Academic Evidence

Keep:
- Git branches
- commits
- PRs
- issue/task assignments
- test results
- screenshots
- phase reports

Do not rewrite Git history to fake contributions.

Each person's contribution should be visible and explainable.
