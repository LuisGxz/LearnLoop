# LearnLoop — Plataforma educativa (LMS)

Proyecto #9 del portfolio (tier 🟢 **Amplitud**: el diferenciador **Java / Spring Boot** — aprovecha la certificación **Oracle ONE**). Monorepo propio (`backend/` + `frontend/`) en el workspace `C:\Emprendimiento\Portfolio`.

## Al iniciar sesión
1. Leer `docs/PHASES.md`. No releer fases ✅.
2. Mockup: `../docs/portfolio-designs/09-learnloop.html` · Estándares: sección 2 de `../docs/PORTFOLIO_PROJECTS.md`.
3. Reutilizar **patrones** (no código) de los proyectos Angular previos (MediTrack/FleetGo): i18n EN/ES a mano, /about a paridad FinPulse, Capa de Demo Guiada (tour role-aware), api-error legible. Backend en Java/Spring (nuevo).

## Stack real
- **Backend:** **Spring Boot 3.5.6 (Java 21)** — Clean layers (controller → service → repository), **Spring Security + JWT** (jjwt), **JPA/Hibernate**, **MySQL**, Bean Validation, Flyway (migraciones), Maven (wrapper `./mvnw`). Puerto dev **8080**.
- **Frontend:** **Angular 20** standalone + **Tailwind v4** + SCSS. PWA opcional. Puerto dev **4200**.
- **Auth:** **JWT + roles** `INSTRUCTOR` / `STUDENT` vía Spring Security (filtro JWT, `@PreAuthorize`).
- **DB:** **MySQL 8** (Docker local `learnloop-mysql`); en prod MySQL free (TiDB Serverless / Aiven — decidir en deploy).
- **Deploy:** Angular → **GitHub Pages**; Spring Boot (fat jar) → **Azure App Service F1 (Java 21)**; MySQL gestionado free. Secretos en `application.properties` vía env vars + `.azure-secrets.local` (gitignored).

## Dominio (LMS con gamificación)
- **Roles:** `INSTRUCTOR` crea/edita cursos (módulos → lecciones video/texto, quizzes); `STUDENT` se inscribe, ve lecciones, hace quizzes.
- **Curso** → módulos → lecciones; **inscripción** (enrollment) por estudiante con **progreso** por lección.
- **Quiz** con preguntas de opción múltiple, **calificación automática**, feedback inmediato.
- **Gamificación:** XP por lección/quiz, **racha** (streak) de días, **insignias** (badges), meta semanal.
- **Certificado** al completar un curso (100%).
- Reglas: solo el instructor dueño edita su curso (403 ajenas); un estudiante solo ve su propio progreso; quiz inmutable tras enviar.

## Sistema de diseño (amigable/motivador, estilo Duolingo/Coursera)
- Fuente: **Nunito** (redondeada). Paleta (Tailwind `@theme`):
  - `grow` 600 `#3BA55C` / 500 `#46B96A` / 100 `#E1F5E7` / 50 `#F2FBF4` (verde aprendizaje, primario/CTAs)
  - `sun` 500 `#F5A623` / 100 `#FDEFD7` (racha/logros)
  - `berry` 500 `#9C5FD4` / 100 `#F0E6FA` (XP/acentos)
  - `ink` 900 `#26342B` / 600 `#52645A` / 400 `#8C9B92` / 200 `#DCE5DF` / 100 `#EEF3EF` / 50 `#FAFCFA`
- Bordes redondeados generosos, barras de progreso animadas, micrologros (confetti al completar, respetar `prefers-reduced-motion`), `tabular-nums` para XP/cifras.

## Comandos
```bash
# backend
cd backend && ./mvnw spring-boot:run        # http://localhost:8080 (migra Flyway + seed)
cd backend && ./mvnw test
# frontend
npm start --prefix frontend                  # http://localhost:4200
# db local
docker run -d --name learnloop-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=learnloop mysql:8
```
Demo: `instructor@learnloop.dev` (crea cursos) · `student@learnloop.dev` (aprende) / `Demo1234!`

## Convenciones
- Backend: capas limpias, DTOs (records) + MapStruct o mapeo manual, `@Valid`, manejo de errores centralizado (`@RestControllerAdvice` → ProblemDetail con errores por campo legibles), nunca exponer entidades JPA directo.
- Frontend: TS estricto, i18n EN/ES a mano (`LanguageService` signals), estados loading/empty/error, errores de formulario por campo desde el ProblemDetail, lazy routes.
- Evitar `cd X && <escritura>` en un mismo comando. Al cerrar fase: actualizar `docs/PHASES.md` + screenshots 3 breakpoints (390/768/1280).
