# Docker Deployment Guide

This guide explains how to run the Technician Portal in both Development and Production environments using Docker.

## Prerequisites
- Docker Installed
- Docker Compose Installed

## 1. Development Environment
In development, we use volume mounts so that changes on your local machine are instantly reflected in the container.

### Setup
1. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Update .env settings:
   # DB_HOST=db
   # DB_PORT=3306
   ```

2. **Start Containers**:
   ```bash
   docker compose up -d --build
   ```

3. **Access Application**:
   - Web: [http://localhost:8000](http://localhost:8000)
   - Database is internal, accessible to app at `db:3306`.

4. **Running Commands**:
   To run artisan commands (e.g., migrations):
   ```bash
   docker compose exec app php artisan migrate
   ```

---

## 2. Production Environment
In production, we do **not** want to mount local files. We want the container to use the code that was baked into it during the build process.

### Setup
1. **Optimization**:
   Ensure `Dockerfile` has:
   - `RUN composer install --no-dev --optimize-autoloader`
   - `RUN npm run build` (Vite build)

2. **Production Docker Compose (`docker compose.prod.yml`)**:
   Create a separate compose file (or override) that removes the `volumes` section for the code.

   Example `docker compose.prod.yml`:
   ```yaml
   version: '3.8'
   services:
     app:
       # ... other settings ...
       volumes:
         # Only mount storage, NOT the whole code base
         - ./storage:/var/www/storage
       environment:
         - APP_ENV=production
         - APP_DEBUG=false
     
     scheduler:
       # ... similar volume adjustments ...

     web:
       # ...
   ```

3. **Deployment Command**:
   ```bash
   # Build and start using the production config
   docker compose -f docker compose.yml -f docker compose.prod.yml up -d --build
   ```

4. **Post-Deployment**:
   ```bash
   docker compose exec app php artisan migrate --force
   docker compose exec app php artisan config:cache
   docker compose exec app php artisan route:cache
   docker compose exec app php artisan view:cache
   ```

### 5. Verifying the Scheduler
To verify that the scheduler is running and processing tasks:

1. **Check Logs**:
   See the scheduler output in real-time:
   ```bash
   docker compose logs -f scheduler
   ```

2. **List Scheduled Tasks**:
   See what tasks are registered and when they run next:
   ```bash
   docker compose exec app php artisan schedule:list
   ```

---

## Troubleshooting
- **Build Failures**: If `npm run build` fails, check `package.json` to ensure the script exists.
- **Database Connection**: Ensure `DB_HOST=db` in `.env`.
