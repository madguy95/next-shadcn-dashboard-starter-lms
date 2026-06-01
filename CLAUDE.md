# CLAUDE.md

## Key References

- **[AGENTS.md](./AGENTS.md)** — Full project overview, tech stack, structure, conventions, data fetching patterns, deployment
- **[docs/forms.md](./docs/forms.md)** — Form system: TanStack Form + Zod, composable fields, validation, multi-step, sheet/dialog forms
- **[docs/themes.md](./docs/themes.md)** — Theme system: OKLCH colors, adding themes, font config
- **

---

# 📌 Project Overview

## Purpose
Education platform for managing courses, classes, teachers, students, and parent interactions.

## Main Goals
- Allow admin to manage courses/classes/users
- Allow teachers to manage teaching activities and class sessions
- Allow parents to register students and track progress

## Repositories
- **Frontend**: `next-shadcn-dashboard-starter-lms`
- **Backend**: `spring-boot-jwt-redis-mysql`

---

# 🏗️ Architecture

## Frontend
- Framework: Next.js 16 (App Router)
- UI: shadcn/ui + Tailwind CSS 4
- State: TanStack Query 5 (server state), Zustand (client state)
- Forms: TanStack Form + Zod
- Table: TanStack Table
- Editor: Tiptap (rich text)
- i18n: next-intl (default locale `vi`, cookie `NEXT_LOCALE`)
- Role-based UI: Admin / Teacher / Parent

**API layer convention** (`src/api/<feature>/`):
- `types.ts` — domain types
- `service.ts` — DTO wire types + `mapX()` mappers, calls `apiClient<T>()` from `@/lib/api-client`
- `queries.ts` — key factory + `queryOptions` with `placeholderData: keepPreviousData`
- `index.ts` — barrel export

**Loading UX**:
- First paint: `useSuspenseQuery` + `HydrationBoundary`/`dehydrate` (server prefetch)
- Subsequent: `useQuery` + `<LoadingOverlay visible={isFetching}>`

## Backend
- Framework: Spring Boot 3.4.1 (Java 21)
- Auth: JWT + Redis caching
- Real-time: WebSocket
- Async: Kafka
- Scheduling: Quartz
- DB migration: Flyway
- File storage: Cloudinary
- Docs: OpenAPI/Swagger (springdoc 2.7.0)
- Structure per module: `controller → service → repository`

**Package**: `com.springjwt.module.<domain>/`

## Database
- PostgreSQL (Flyway migrations)
- Key entities: User (Admin/Teacher/Parent), Course, Class, Session, Enrollment, Student, BlogPost, AuditLog

---

# 🧠 Key Business Logic

## Course Lifecycle
- Draft → Published → Unpublished
- Only published courses visible to parents

## Class Management
- Created under a course
- Assigned to a teacher + student list
- Has sessions (upcoming / in_progress / taught / reviewed)

## Session & Attendance
- Each class has sessions with attendance marks per student
- Attendance status: `present | excused | absent | makeup | unmarked`
- Teacher can add session notes and optionally notify parents

## Enrollment Flow
- Parent registers → enrolls student → student joins class

---

# 👥 Roles & Permissions

## Admin
- Full access
- Manage courses, classes, teachers, users, enrollments
- View audit logs and dashboard analytics

## Teacher
- View/manage assigned classes and sessions
- Record attendance, add session notes
- View personal schedule

## Parent
- View published courses
- Register students, enroll in classes
- View children's schedule and progress

---

# ⚙️ Conventions

## Backend
- Business logic in service layer — avoid fat controllers
- Use DTOs for all API responses (`ApiResult<T>` wrapper)
- All modules follow: controller → service → repository

## Frontend
- API logic lives in `src/api/<feature>/` — never inline in pages/components
- User-facing text via i18n keys (namespaces in `src/i18n/messages/{vi,en}.json`)
- CSS-only token maps (colors, status dots) in `@/features/<role>/data`
- Co-locate skeletons with their feature components

---

# 🚀 Current State

## Done
- JWT auth with Redis + role-based access (Admin / Teacher / Parent)
- Admin: dashboard analytics, course CRUD, class CRUD, enrollment management, teacher management, schedule, audit log
- Teacher: class list, class detail (sessions/attendance/notes), schedule
- Parent: children management, enrollment, schedule
- Blog: list, detail, create, edit
- File upload via Cloudinary
- WebSocket support
- Kafka async messaging
- Quartz background job scheduling
- i18n (vi/en) wired across all features

## In Progress
- (update this)

## TODO
- (update this)

---

# 🐞 Known Issues

- (list bugs or limitations here)

---

# 📊 Performance / Constraints

- System target: <1000 users
- Optimize for low cost + production stability

---

# 📌 Working Rules for Claude

When assisting in this project:

1. Always follow existing architecture and conventions
2. Do not introduce unnecessary complexity
3. Prefer simple, production-ready solutions
4. Keep code concise and readable
5. Focus on real-world usability (not theoretical)
6. New frontend features: follow `src/api/<feature>/` pattern + i18n keys + loading UX convention
7. New backend features: follow controller → service → repository + DTO response pattern

---

# 📂 Important Notes

- This is a real production-oriented system
- Prioritize maintainability and performance
- Backend repo name contains "mysql" but actual DB is PostgreSQL
