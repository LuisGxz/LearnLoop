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

## Fase 1 — Backend: dominio y datos
- [ ] Entidades JPA: User(role), Course, Module, Lesson, Enrollment, LessonProgress, Quiz, Question, Option, QuizAttempt, Badge/UserBadge.
- [ ] Flyway migraciones + seed realista (2-3 cursos con módulos/lecciones/quizzes, instructor+student demo).
- [ ] Repositorios Spring Data. Config MySQL.

## Fase 2 — Auth (JWT + RBAC)
- [ ] Spring Security: register/login, bcrypt, JWT (jjwt) filtro, `UserDetailsService`.
- [ ] Roles INSTRUCTOR/STUDENT, `@PreAuthorize`. `@RestControllerAdvice` → ProblemDetail con errores por campo.
- [ ] Tests (JUnit): emisión/validación JWT, hashing, reglas RBAC.

## Fase 3 — API de cursos, inscripción y progreso
- [ ] CRUD cursos/módulos/lecciones (instructor dueño → 403 ajenas). Catálogo público + detalle.
- [ ] Enrollment, marcar lección completa → progreso + XP + racha. Certificado al 100%.
- [ ] Quiz: obtener preguntas, enviar respuestas → calificación automática + XP. Tests del dominio crítico.

## Fase 4 — Frontend foundation
- [ ] LanguageService (EN/ES), api-client + interceptor JWT + manejo de ProblemDetail, AuthService.
- [ ] Layout/header (Nunito, paleta, racha/XP chips), estados loading/empty/error, primitivas (progress bar, badge).

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

### Estado actual: **Fase 0 en curso**
