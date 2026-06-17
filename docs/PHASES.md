# LearnLoop — Plan de fases

LMS con gamificación. **Angular 20 + Tailwind v4** (front) + **Spring Boot 3.5 / Java 21 + Spring Security + JPA + MySQL** (back). Deploy: Pages + Azure F1 (Java) + MySQL free. Ver `CLAUDE.md` y la sección 2 de `../docs/PORTFOLIO_PROJECTS.md`. Vara de calidad: **FinPulse**.

---

## Fase 0 — Setup ✅
- [x] Scaffold backend Spring Boot 3.5.6 (web, security, data-jpa, validation, mysql, lombok) — compila.
- [x] Scaffold frontend Angular 20 (standalone, routing, scss) — instalado.
- [x] CLAUDE.md + PHASES.md.
- [ ] Tailwind v4 + sistema de diseño LearnLoop (paleta grow/sun/berry/ink + Nunito) en Angular.
- [ ] git init (monorepo backend+frontend), .gitignore, README inicial.
- [ ] MySQL local por Docker + `application.properties` (datasource + JWT secret vía env).

## Fase 1 — Backend: dominio y datos ✅
- [x] 14 entidades JPA (User, Course, CourseModule, Lesson, Quiz, Question, QuestionOption, Enrollment, LessonProgress, QuizAttempt, Badge, UserBadge + enums Role/LessonType) con relaciones, índices y unique constraints vía anotaciones.
- [x] Esquema gestionado por Hibernate (`ddl-auto=update`) + `DataSeeder` (CommandLineRunner, bcrypt) con 3 cursos realistas (Product Design/SQL/React), módulos/lecciones/quizzes/preguntas, 4 badges, instructor+student demo, enrollment con progreso. (Flyway → endurecimiento de prod, diferido.)
- [x] Repositorios Spring Data. Config MySQL (`application.properties`, env-overridable). Verificado: arranca, siembra (6 módulos/13 lecciones/5 preguntas/15 opciones), 0 errores.

## Fase 2 — Auth (JWT + RBAC) ✅
- [x] Spring Security stateless: `JwtService` (jjwt 0.12, HS384), `JwtAuthenticationFilter`, `CustomUserDetailsService` + `AppUserPrincipal` (expone id/role), `SecurityConfig` (CORS, method security, rutas públicas vs auth), `PasswordEncoder` bcrypt.
- [x] `AuthService` (register dup→409+field, login vía AuthenticationManager) + `AuthController` (`/api/auth/register|login|me`). `@RestControllerAdvice` → **ProblemDetail con `fields`** por campo (422 validación, 409, 401, 500).
- [x] Tests (5): JwtService (round-trip/tamper/garbage/otra-clave) + contextLoads con **H2** (CI-safe). Verificado por curl: login→JWT, me, 401, 409+field, 422 por campo.

## Fase 3 — API de cursos, inscripción y progreso ✅
- [x] `CourseService`: catálogo público + detalle (con progreso del viewer), `mine`, create/update/delete con **ownership** (403 ajenas). Grafo curso→módulos→lecciones→quiz→preguntas→opciones vía DTOs.
- [x] `EnrollmentService`: enroll, mis cursos, **completar lección** → XP + racha + badges (FIRST_LESSON/STREAK_7/COURSE_DONE) + % progreso + completedAt; **certificado** al 100%. `GamificationService` (XP/streak/badges).
- [x] `QuizService`: vista de quiz **sin filtrar respuestas correctas**, submit → **calificación automática** + passed + XP escalado + QUIZ_ACE + per-question correct/explicación. `QuizAttempt` registrado.
- [x] Controllers (`/api/courses`, `/api/quizzes`, learning) + 403 de method-security en ProblemDetail. **6 tests** (flujo e2e author→enroll→complete→quiz-ace con badges en H2 + JWT + contexto). Verificado por curl: catálogo/detalle/enroll/complete(+XP+badges)/quiz view+submit/RBAC 403.

## Fase 4 — Frontend foundation ✅
- [x] **i18n** EN/ES con signals (`LanguageService` + diccionario `copy.ts` + pipe `t` impuro + `LangToggle`); seed por `localStorage`/`navigator.language`, sin hydration mismatch.
- [x] **api-client** promesa sobre HttpClient (`ApiClient`) + `ApiError.from` (ProblemDetail RFC-7807 → `{status, message, fields, isInfra}`) + **interceptor JWT** funcional (adjunta bearer a `/api`, limpia token en 401) + `TokenStore`. `AuthService` (signals user/ready, hydrate en `provideAppInitializer`, login/register/logout, `patch` XP/streak, helpers de rol). `models.ts` espeja todos los DTOs del backend.
- [x] **Header** sticky (Nunito, paleta grow, logo infinity, nav role-aware Courses/My learning|Teach/About, chips racha 🔥 + XP 💎, menú de avatar con iniciales, `LangToggle`) + **shell** `App` (header + router-outlet). Rutas lazy + home hero real (lo reemplaza F5) + placeholder honesto para secciones futuras.
- [x] **Primitivas**: `ll-progress-bar` (animada, a11y), `ll-spinner`, `ll-skeleton`, `ll-empty-state`, `ll-error-state` (retry + i18n), `ll-badge-chip` (tonos grow/sun/berry). Iconos **lucide-angular** (pick global).
- [x] Build verde. Screenshots 390/768/1280 (`scripts/shots.mjs`, recipe `MSYS_NO_PATHCONV=1`) + **0 console.error** en `/`,`/about`,`/login` y toggle idioma.

## Fase 5 — Catálogo de cursos
- [ ] Grid de cursos con thumbnails (gradiente), progreso, badges New/Done; saludo + meta semanal.

## Fase 6 — Vista de lección
- [ ] Player (placeholder video) + lista de módulos/lecciones lateral + barra de progreso del curso; completar lección (+XP, animación).

## Fase 7 — Quiz interactivo + logros
- [ ] Quiz con feedback inmediato, dots de progreso, pantalla de logro (confetti, XP, racha, badge). Certificado.

## Fase 8 — Paneles por rol
- [ ] Panel instructor (crear/editar curso → módulos → lecciones → quiz). Panel estudiante (mis cursos, progreso, certificados).

## Fase 9 — Demo guiada + /about
- [ ] Login orientador, badge de rol (can/can't), tour coach-marks por rol, panel "Cómo explorar", empty states que enseñan, hint cross-rol ("crea un curso como instructor y tómalo como estudiante").
- [ ] `/about` pública a paridad FinPulse (bilingüe, todas las secciones + diagrama + tabla de patrones).

## Fase 10 — Pulido + tests + deploy
- [ ] Responsive 3 breakpoints (screenshots), animaciones, 0 console.error. E2E (flujo + tour). README + TECHNICAL.md. CI.
- [ ] Deploy: MySQL free + Azure F1 (Java jar) + Pages. E2E en prod. Card en `website/src/data/site.ts`.

---

### Estado actual: **Fases 0–4 ✅** (backend completo + frontend foundation) · **siguiente: Fase 5 — Catálogo de cursos**
