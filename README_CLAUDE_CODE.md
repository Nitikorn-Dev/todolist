# README — CLAUDE CODE TEAM WORKFLOW

## 1. Recommended Order

### Step 1
Create a NEW GitHub repository.

### Step 2
Put these specification files at the project root.

### Step 3
All 4 people run:

PROMPT_00_START.md

Purpose:
- understand reference project
- agree architecture
- agree test strategy
- agree ownership

No implementation yet.

### Step 4
Person 1:
PROMPT_01_PERSON1_FOUNDATION_AUTH.md

Merge into develop.

### Step 5
Person 1:
Continue authentication work from the same branch/session or a clean branch as the team decides.

Person 1 must complete the tests before the PR is merged.

### Step 6
Person 2:
PROMPT_02_PERSON2_DATABASE_ROLE_ADMIN.md

Person 2 owns migrations/RLS/types.

### Step 7 — Parallel Gate

After Auth + DB + Authorization are stable:

Person 3:
PROMPT_03_PERSON3_TASK_BOARD.md

Person 4:
PROMPT_04_PERSON4_DASHBOARD_THEME_UI.md

Person 2:
continue admin work if needed

Each person writes tests with their feature.

---

## 2. How to Start a Claude Code Session

Use this pattern:

Read:
- CLAUDE.md
- ARCHITECTURE.md
- DATABASE.md
- IMPLEMENTATION_PLAN.md
- TEAM_WORKFLOW.md

I am Person X.

My responsibility is:
[responsibility]

Current task:
[phase/task]

Implement ONLY this task.

Testing is part of the task.
Write meaningful tests for the business logic you implement.

Do not modify another person's module.

If a database change is required and I am not Person 2:
STOP and report it.

After implementation:
- run relevant tests
- run lint/typecheck/build if available
- review git diff
- report changed files
- report tests added
- report tests executed/results
- report DB changes
- report known issues
- STOP

---

## 3. Do Not Give Claude a Huge Ambiguous Prompt

Bad:

"Build the whole Trello clone and make it production ready."

Better:

"Implement Phase 5 Task Board only. Read the project specification first. Add unit tests for task validation and business logic, plus integration tests for important persistence behavior. Do not modify migrations. Stop after the phase report."

---

## 4. Recommended Git Flow

Before work:

git checkout develop
git pull
git checkout -b feature/<name>

During work:

git status
git diff

Before commit:

run relevant tests
run lint/typecheck if available
review diff

Commit:

git add .
git commit -m "feat: ..."

Push:

git push -u origin feature/<name>

Then create PR into develop.

---

## 5. Important Rule: Test With Feature

Do not wait until the end to write every test.

Preferred:

Feature
+
Unit Test
+
Relevant Integration Test
=
PR

Then final E2E tests are added/verified during integration.

---

## 6. What Each Person Should Test

Person 1:
- auth validation
- auth helpers
- protected behavior
- auth integration

Person 2:
- role permissions
- authorization
- RLS
- DB persistence

Person 3:
- task validation
- task rules
- reorder
- move between columns
- task persistence

Person 4:
- dashboard aggregation
- data transformation
- theme selection/persistence
- meaningful UI behavior

Integration:
- cross-module flows

E2E:
- critical user journeys

---

## 7. Test Pyramid

Use more Unit tests than Integration tests.
Use fewer E2E tests.

Example target for a student project:

Unit
████████████████████

Integration
████████

E2E
████

These are proportions, not mandatory test counts.

---

## 8. Test Naming

Prefer behavior-focused names:

"moves a task from Todo to In Progress"

"rejects an invalid task title"

"ADMIN can access user management"

"MEMBER cannot access user management"

"dashboard counts completed tasks correctly"

"theme preference survives reload"

Avoid:

"calls function X"

"renders div"

unless that behavior itself matters.

---

## 9. Phase 11 — Integration

Use:

PROMPT_05_INTEGRATION.md

Do not add new features.

The goal is to make separately developed modules work together.

---

## 10. Phase 12 — Final Audit

Use:

PROMPT_06_FINAL_AUDIT.md

The final audit should prove:

Feature works
+
Tests pass
+
Security is reasonable
+
Build works
+
Team contributions are explainable

---

## 11. University Presentation Evidence

Keep:
- Git commits
- branches
- PRs
- issues/tasks
- unit test reports
- integration test reports
- E2E screenshots/reports
- final screenshots

This makes it easier to explain what each person actually implemented.
