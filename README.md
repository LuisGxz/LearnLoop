# LearnLoop ∞

An online **learning platform (LMS)** with gamification: instructors author courses (modules → lessons → quizzes); students enroll, track progress, take auto-graded quizzes, earn XP/streaks/badges, and get a certificate on completion.

Part of [Luis Chiquito Vera's portfolio](https://luisgxz.github.io/portfolio/). Built to showcase **Java / Spring Boot**. Bilingual EN/ES.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Angular 20 (standalone) · Tailwind v4 · TypeScript |
| Backend | Spring Boot 3.5 (Java 21) · Spring Security · JPA/Hibernate · Bean Validation |
| Database | MySQL 8 · Flyway migrations |
| Auth | JWT (jjwt) · bcrypt · roles INSTRUCTOR / STUDENT |
| Deploy | GitHub Pages (web) · Azure App Service F1 Java (API) · managed MySQL (free) |

## Run locally

```bash
# MySQL (Docker)
docker run -d --name learnloop-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=learnloop mysql:8

# Backend  → http://localhost:8080
cd backend && ./mvnw spring-boot:run

# Frontend → http://localhost:4200
npm start --prefix frontend
```

**Demo accounts** — `instructor@learnloop.dev` (authors courses) · `student@learnloop.dev` (learns) · password `Demo1234!`

See [`docs/PHASES.md`](docs/PHASES.md) for build progress.
