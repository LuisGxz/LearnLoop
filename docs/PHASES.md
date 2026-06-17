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

## Fase 5 — Catálogo de cursos ✅
- [x] `CourseService` (catalog/mine/detail) + `Catalog` page (ruta `''`, reemplaza el home). **Stats strip** real para signed-in (saludo + nombre, racha, XP, inscritos, progreso medio computado de los cursos del viewer) y **hero** para signed-out con CTA.
- [x] `CourseCard` reusable: cover **gradiente** (`t-1..t-4` → CSS via `cover-gradient.ts`), badge **Done** (100%) / **New** (no inscrito), chip de nivel, categoría, instructor, **barra de progreso** + % si inscrito (meta módulos/lecciones/min si no), "▶ Continue". Orden: en-progreso → nuevos → completados. Link a `/course/:id` (placeholder hasta F6).
- [x] Estados **loading** (skeletons de card), **empty** (enseña) y **error** (retry). Limpieza: borrado curso de prueba "My Course" (basura de curls F3).
- [x] Screenshots 390/768/1280 guest + estudiante (gradientes, stats, progreso, badges) con datos reales (Docker MySQL + seed). **0 console.error** (guest + authed + toggle ES). Build verde.

## Fase 6 — Vista de lección ✅
- [x] `LearningService` (enroll/completeLesson/myEnrollments/certificate; cada acción gamificante hace `auth.patch` de XP/streak). Ruta `/course/:id` (`Course`): header de progreso del curso, **player** (VIDEO → cover gradiente + play + scrubber; TEXT → tarjeta de lectura con el contenido), label módulo·lección, descripción.
- [x] **Sidebar** de módulos/lecciones con estado (✓ done / activo "watching now" / número) + ítem de **quiz** (link `/quiz/:id`, "Quiz passed · %"). Selección de lección sin recargar.
- [x] **Completar lección**: gating (no auth → /login?redirect; no inscrito → Enroll; inscrito → "Complete +N XP") → patch local del snapshot, **XP flash** flotante (anim, `prefers-reduced-motion`), avance a la siguiente sin completar, callout "Course complete!" + link a certificado al 100%.
- [x] Verificado funcional: completar lección **+50 XP** (620→670) + flash + 0 console.error. Screenshots 390/768/1280 (estudiante). Build verde.

## Fase 7 — Quiz interactivo + logros ✅
- [x] `QuizService` (view sin respuestas correctas + submit server-graded; patch XP). Ruta `/quiz/:id` (`Quiz`): responder **una pregunta a la vez** con **dots de progreso**, opciones seleccionables, "Next/See results". Submit → calificación del servidor.
- [x] **Pantalla de logro**: tarjeta oscura con **confetti** (CSS, `prefers-reduced-motion`), trofeo/flag según passed, score/XP/insignias nuevas, X/N correctas, botones Back to course / Retry. **Review por pregunta** (correcta en verde con ✓, elegida-incorrecta tachada en berry con ✕, explicación en callout) — feedback honesto sin exponer respuestas en el view.
- [x] **Certificado** `/certificate/:id` imprimible (award, nombre, curso, instructor, fecha localizada EN/ES, branding, `@media print`). Callout + link desde la vista de curso al 100%.
- [x] Verificado funcional: quiz submit **+120 XP** (review correcto/incorrecto), curso SQL completado → certificado real. Screenshots answer/result/certificate 390/desktop. **0 console.error**. Build verde.

## Fase 8 — Paneles por rol ✅
- [x] **Login** orientador `/login` (tabs entrar/registro, selector de rol, **quick-fill demo** estudiante/instructor + "qué hace cada rol", errores por campo del ProblemDetail, redirect post-login a home por rol). **Guards** `authGuard`/`roleGuard` (student→/teach redirige a `/`, guest→ruta gated redirige a `/login?redirect`).
- [x] **Panel estudiante** `/learning`: enrollments divididos **In progress / Completed**, barra de progreso, Resume/View, **link a certificado** en completados. Estados loading/empty(enseña)/error.
- [x] **Panel instructor** `/teach`: `mine()` con cover, nivel, conteos, **Edit/View/Delete** (confirm). **Course builder** `/teach/new` + `/teach/:id/edit`: formularios reactivos anidados **módulos → lecciones (tipo/min/contenido) → quiz opcional → preguntas → opciones** (radio de correcta, swatches de cover, validación). `CourseService.create/update/delete`.
- [x] Verificado funcional: **crear curso end-to-end** (builder → `/course/5` → aparece en `/teach`), edit hidrata, delete, guards, **0 console.error**. Screenshots login/teach/learning/builder 390/768/1280. Limpieza del curso de prueba. Build verde.

## Fase 9 — Demo guiada + /about
- [ ] Login orientador, badge de rol (can/can't), tour coach-marks por rol, panel "Cómo explorar", empty states que enseñan, hint cross-rol ("crea un curso como instructor y tómalo como estudiante").
- [ ] `/about` pública a paridad FinPulse (bilingüe, todas las secciones + diagrama + tabla de patrones).

## Fase 10 — Pulido + tests + deploy
- [ ] Responsive 3 breakpoints (screenshots), animaciones, 0 console.error. E2E (flujo + tour). README + TECHNICAL.md. CI.
- [ ] Deploy: MySQL free + Azure F1 (Java jar) + Pages. E2E en prod. Card en `website/src/data/site.ts`.

---

### Estado actual: **Fases 0–5 ✅** (backend completo + foundation + catálogo) · **siguiente: Fase 6 — Vista de lección**
