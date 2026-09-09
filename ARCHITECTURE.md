# ARCHITECTURE.md

## 1. Architecture

Use a simple monolithic Next.js application with Supabase/PostgreSQL.

Conceptual layers:

Presentation
-> UI components / pages / forms

Application
-> validation / business rules / authorization / services

Data
-> Supabase client / PostgreSQL / RLS

Testing sits across the layers:

Unit
-> pure business logic and utilities

Integration
-> boundaries between application/data/auth

E2E
-> critical user journeys through the real application

---

## 2. Expected Routes

Suggested routes:

/login
/signup
/dashboard
/dashboard/tasks
/dashboard/admin/users

Exact route conventions may follow the chosen Next.js structure.

---

## 3. Authentication Flow

User:
Sign Up
-> account/session created
-> profile created or synchronized
-> authenticated area

Sign In
-> authenticated session
-> protected dashboard

Sign Out
-> session cleared
-> redirect to login

Protected routes must not depend solely on hiding UI.

---

## 4. Authorization

Roles:

ADMIN
MEMBER

Authorization must be enforced server-side and, where applicable, through database RLS.

Example:

ADMIN:
- manage users
- access admin user management
- normal task functionality

MEMBER:
- normal task functionality
- no admin user management

Do not rely on client-side role checks alone.

---

## 5. Task Model

Board
-> Columns
-> Tasks

Example:

Board
  ├── Todo
  │    ├── Task A
  │    └── Task B
  ├── In Progress
  │    └── Task C
  └── Done
       └── Task D

Drag & Drop must persist:
- column_id
- position

Position/reorder logic should be isolated into testable functions where practical.

---

## 6. Dashboard

Dashboard reads real task data and derives:

- Total Tasks
- Todo
- In Progress
- Completed
- High Priority
- Recent Tasks

Do not hardcode statistics.

Prefer reusable calculation/transformation functions so important dashboard logic can be unit tested.

---

## 7. Theme

Support:
- light
- dark

Persist the preference using the simplest reliable approach supported by the selected stack.

Theme logic should be isolated enough to test persistence/selection behavior without testing framework internals.

---

## 8. Component Structure

Suggested:

components/
  auth/
  dashboard/
  board/
  admin/
  layout/
  ui/

lib/
  auth/
  db/
  validation/
  authorization/
  tasks/
  dashboard/
  theme/

tests/
  unit/
  integration/
  e2e/

Exact structure may vary if the project already has a clear equivalent.

---

## 9. Testing Architecture

### Unit

Test deterministic logic without external systems.

Examples:
- validators
- permission functions
- reorder calculations
- dashboard aggregation
- transformations

### Integration

Test boundaries.

Examples:
- service/data access + test database
- RLS behavior
- auth-protected server behavior
- task persistence

Integration tests should use isolated test data and never production data.

### E2E

Test critical workflows using the application as a user would.

Keep E2E flows small and stable.

Recommended:

auth.spec
tasks.spec
authorization.spec
dashboard.spec
theme.spec

---

## 10. Error / Loading / Empty States

Important screens should have:
- loading state
- error state
- empty state

Do not create a complex global state framework unless required.

---

## 11. Avoid

No:
- microservices
- CQRS
- event buses
- message queues
- unnecessary caching
- unnecessary state-management frameworks
- excessive abstraction
- real-time collaboration unless explicitly requested
