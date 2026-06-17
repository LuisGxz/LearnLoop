# LearnLoop — Deployment

Two deployables: the **Angular** app (GitHub Pages) and the **Spring Boot** API (Azure App Service F1, Java 21), backed by a **managed MySQL**.

Repo: <https://github.com/LuisGxz/LearnLoop>

---

## 1. Database (MySQL, managed free)

**Chosen: TiDB Serverless** (always-free, MySQL-compatible).

1. Create a free cluster at <https://tidbcloud.com> → **Serverless**.
2. Create database `learnloop` (or let `createDatabaseIfNotExist` handle it).
3. From **Connect**, copy host, port (4000), user (`xxxxx.root`), password, and the CA path (TiDB requires TLS).
4. JDBC URL shape:
   `jdbc:mysql://<host>:4000/learnloop?sslMode=VERIFY_IDENTITY&createDatabaseIfNotExist=true&serverTimezone=UTC`

> Alternatives if ever needed: Azure MySQL Flexible (B1ms, 12-month free then ~$12/mo) or Aiven free MySQL.

## 2. API — Azure App Service F1 (Java 21)

```bash
RG=learnloop-rg
APP=learnloop-api-luisgxz
az group create -n $RG -l eastus
az appservice plan create -g $RG -n learnloop-plan --sku F1 --is-linux
az webapp create -g $RG -p learnloop-plan -n $APP --runtime "JAVA:21-java21"

# Build the fat jar
cd backend && ./mvnw -q clean package -DskipTests

# App settings (JWT_SECRET is in .azure-secrets.local, gitignored)
az webapp config appsettings set -g $RG -n $APP --settings \
  DB_URL="jdbc:mysql://<host>:3306/learnloop?serverTimezone=UTC&useSSL=true&requireSSL=true" \
  DB_USER="<user>" DB_PASSWORD="<password>" \
  JWT_SECRET="<from .azure-secrets.local>" \
  SEED_ENABLED="true" \
  CORS_ORIGINS="https://luisgxz.github.io" \
  WEBSITES_PORT="8080"

# Deploy
az webapp deploy -g $RG -n $APP --type jar --src-path target/learnloop-api-*.jar
```

Spring Boot reads `PORT` (App Service injects 8080) — already wired in `application.properties`.

## 3. Web — GitHub Pages

The frontend resolves the API base from `window.__LEARNLOOP_API__` (see `src/core/config.ts`), injected at build time. Build with the production API URL and publish `dist/frontend/browser` to Pages (base href = `/LearnLoop/`).

```bash
cd frontend
npm ci
npx ng build --base-href /LearnLoop/
# inject API base into index.html, then publish dist/frontend/browser to gh-pages
```

## 4. Verify in production

- Open `https://luisgxz.github.io/LearnLoop/` → catalog loads from the live API.
- Sign in with a demo account, complete a lesson, take a quiz, earn a certificate.
- Check the browser console: **0 errors**.
- Flip the portfolio card (`website/src/data/site.ts`) to `status: "live"` with the live URL.

**Demo accounts** — `instructor@learnloop.dev` · `student@learnloop.dev` · `Demo1234!`
