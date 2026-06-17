# LearnLoop — Technical deep-dive

A gamified LMS built to showcase a production-grade **Java / Spring Boot + Angular** full-stack. This document covers the architecture, the domain model, and the decisions behind them.

## Architecture

```
Angular 20 (standalone, signals, Tailwind v4)
   │  JWT bearer · HttpClient + functional interceptor · ProblemDetail
   ▼
Spring Boot 3.5 / Java 21
   ├─ web         controllers → ProblemDetail (per-field errors)
   ├─ security    JWT filter · @PreAuthorize · bcrypt
   ├─ service     courses · enrollment · quiz · gamification
   └─ repository  Spring Data JPA
   ▼
MySQL 8  (JPA/Hibernate · seeded demo data)
```

The backend is a classic layered design. Controllers speak DTOs only (Java `record`s); JPA entities never cross the service boundary, so the API contract is decoupled from the persistence model.

## Backend

### Security (JWT + RBAC)
- `JwtService` signs/verifies HS384 tokens (jjwt 0.12). `JwtAuthenticationFilter` extracts the bearer and populates the `SecurityContext` with an `AppUserPrincipal` (exposes `id` + `role`).
- `SecurityConfig` is stateless (no session), enables method security, and declares public vs. authenticated routes. Passwords use bcrypt with a constant-time compare.
- Authorization is enforced two ways: route-level (`@PreAuthorize("hasRole('INSTRUCTOR')")`) and **ownership** in the service layer (an instructor editing another's course gets a 403; a student only ever reads their own progress).

### Error handling
`GlobalExceptionHandler` (`@RestControllerAdvice`) maps every failure to an RFC-7807 `ProblemDetail`:
- `MethodArgumentNotValidException` → 422 with a `fields` map (`{ field: message }`).
- `ApiException` → its status + optional `fields`.
- `BadCredentials` → 401; `AccessDenied` → 403; everything else → 500 with a safe message.

The Angular `ApiError.from()` reads that envelope so forms can render the reason next to each input.

### Domain model
14 JPA entities: `User`, `Course`, `CourseModule`, `Lesson`, `Quiz`, `Question`, `QuestionOption`, `Enrollment`, `LessonProgress`, `QuizAttempt`, `Badge`, `UserBadge`, plus enums `Role` / `LessonType`. Relationships, indexes and unique constraints are declared via annotations; Hibernate manages the schema (`ddl-auto=update`) and a `DataSeeder` loads realistic demo content on boot.

### Gamification
`GamificationService` centralizes XP, streaks and badges:
- **XP** is awarded per completed lesson (`xpReward`) and per quiz (scaled by score). The cached header XP/streak stays live because each gamifying call returns the fresh totals, which the frontend folds into the user signal.
- **Streak** advances once per active day.
- **Badges**: `FIRST_LESSON`, `STREAK_7`, `COURSE_DONE`, `QUIZ_ACE`. Awarding is **idempotent** (a `UserBadge` unique constraint + a check before insert), so repeated actions never double-count.
- **Certificate** becomes available when course progress hits 100%.

### Quiz integrity
The quiz-taking endpoint (`GET /api/quizzes/{id}`) returns questions and options **without** the `correct` flag — the answer key never reaches the client. Submitting (`POST /api/quizzes/{id}/submit`) grades on the server and returns per-question results (correct option, chosen option, explanation) for the review screen.

## Frontend

- **Standalone + signals throughout**, `ChangeDetectionStrategy.OnPush`, lazy routes with `authGuard` / `roleGuard` on gated areas.
- **State**: small injectable services hold signals (`AuthService` for the session, `LanguageService` for EN/ES). No NgRx — the app's state is local and the signal graph keeps it simple.
- **i18n**: a hand-rolled EN/ES dictionary keyed by string, surfaced through an impure `t` pipe and a `LanguageService` that persists the choice and seeds from `navigator.language`.
- **API layer**: a promise-based `ApiClient` over `HttpClient`; a functional `jwtInterceptor` attaches the bearer and clears the token on a 401.
- **Guided-demo layer**: a role-aware `TourService` + spotlight `TourOverlay` (box-shadow cutout, clamped tooltip, auto-start once, replay) and a `HelpLauncher` panel (cross-role aha, role badge with can/can't, scenarios, demo accounts).
- **Polish**: every screen has loading (skeletons), empty (teaching) and error (retry) states; animations respect `prefers-reduced-motion`.

## Testing

- **Backend** — `JwtServiceTest` (round-trip, tamper, garbage, wrong key) and `LearningFlowTest`, an end-to-end author → enroll → complete → quiz-ace flow asserting XP and badges, run on **H2** so CI needs no database.
- **Frontend** — a Playwright E2E suite (guest browse, tour, learning dashboard, quiz, course create+delete) where **every test fails on any `console.error`**. Responsive verified at 390 / 768 / 1280.

## Trade-offs

- **Video lessons are placeholders** (a player shell with a scrubber). The focus is the LMS domain and gamification, not media streaming.
- **`ddl-auto=update`** keeps the demo frictionless; Flyway is the path for production hardening (`validate` + versioned migrations).
- **Editing a course re-authors its quiz** — course detail intentionally omits correct answers, so the builder starts the quiz fresh rather than leaking the key into an edit form.
- **Hand-rolled i18n** over a library — fewer dependencies and full control of the dictionary, at the cost of writing the lookups.
