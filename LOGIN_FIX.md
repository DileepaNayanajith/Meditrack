# Login repair

Based on the local MediTrack copy saved on September 21, with later changes through October 13. The Ubuntu deployment was not accessible, so its exact failure remains unconfirmed.

Changes:
- Normalize email and username input on the server. Preserve passwords exactly, including spaces.
- Email sign-in searches only the email column, avoiding collisions with another account's username. Username sign-in remains available for identifiers without @.
- Reject malformed login input with HTTP 400.
- Correct Docker demo seed hashes for MediTrack2026! (new databases only).

Verification: two automated tests pass using the real controllers, bcrypt and JWT with an in-memory SQL substitute. Frontend production build passes. Docker is installed locally but its daemon is stopped; no live MySQL, container, restart-persistence or Ubuntu verification was performed.

## Ubuntu deployment

Copy the changed backend/controllers/authController.js and backend/database/seed.sql into your existing checkout. Keep your existing environment file and database volume.

Run using the same Compose project and environment file as your existing deployment:

    docker compose --env-file .env.docker up -d --build
    docker compose --env-file .env.docker logs --tail=100 backend mysql

Use the existing environment filename if different. The supplied Compose file already routes the frontend to /api via nginx, sets DB_HOST=mysql and mounts mysql_data at /var/lib/mysql. Startup runs the POS migration, which does not reset users.

Register a disposable account, sign out, then sign in with its email and password. Restart the backend and repeat; restart MySQL and repeat. Test incorrect passwords too. If login still fails, capture the failing /api/auth/login HTTP status and response plus backend logs, with passwords and tokens removed. Check that registration and login reach the same server and database.

Do not run docker compose down -v or npm run db:init on an existing database: the former deletes the volume and the latter executes seed.sql, which truncates users and inventory. Seed changes do not repair demo passwords in existing volumes. No existing passwords or database records were changed by this repair.

Run regression tests after installing backend dependencies:

    cd backend
    npm ci
    npm test
