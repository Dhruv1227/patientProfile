# CareBridge Architecture Notes

## Current Shape

CareBridge is intentionally small enough for Expo Go presentation, but the app now has clearer expansion points:

- `App.js` owns the app shell, authentication flow, shared state, and navigation.
- `src/screens/PortalScreens.js` owns the Patient, Provider, Admin, Search, Records, Messages, Security, and Appointment screens.
- `src/components/common.js` owns reusable cards, panels, fields, toggles, and tab helpers.
- `src/data/portalSeed.js` owns seed users, departments, records, tasks, schedules, and fallback data.
- `src/services/api.js` owns API URL resolution and the fetch helper.
- `src/utils/roleScope.js` owns role-based filtering helpers for patients, providers, and admins.
- `src/styles.js` owns the shared palette and React Native style sheet.
- `backend/server.js` owns authentication, role checks, routing, local persistence, and seeded clinic data.
- `backend/data/portal-state.json` stores runtime-created local state and is ignored by git.
- `.env.example` documents configuration that should be customized outside source control.

## Backend Reliability

- Runtime changes are persisted atomically through a temporary file and rename.
- Audit logs are saved with the rest of the portal state.
- Provider actions are scoped to assigned departments and doctor schedules.
- Provider patient transfers require access to the source department, create a pending request, notify receiving doctors, and only move the patient after an accepted decision.
- Approved appointment requests add the accepted patient into the provider's target department portfolio with profile and record context.
- Messages, search results, records, notifications, appointments, and transfers share role-scoping rules.
- Secure messages now carry route, category, subject, patient, department, sender, receiver, and doctor context.
- Patient records and patient profile summaries are now stored per patient instead of as one shared chart.
- Password reset uses an expiring hashed verification code for the local demo flow.
- Admin-created doctors are attached to departments and receive schedule records.
- Secrets and runtime state stay out of git through `.gitignore`.

## Future Database Upgrade

The local JSON file is the current persistence boundary. To move toward a production-style backend, replace the `serializableState`, `hydrateFromDisk`, and `saveStateNow` logic with a real data layer.

Good next steps:

- SQLite for a single-machine classroom demo with durable tables.
- PostgreSQL for a deployed multi-user portal.
- Firebase/Supabase for managed auth, realtime data, and hosted storage.

## Current Frontend Split

```text
src/
  components/common.js
  data/portalSeed.js
  screens/PortalScreens.js
  services/api.js
  styles.js
  utils/roleScope.js
```

## Suggested Backend Split

When the app grows, split `backend/server.js` into:

```text
backend/
  config.js
  server.js
  data/
    seed.js
    store.js
  middleware/
    auth.js
  routes/
    auth.js
    portal.js
    appointments.js
    admin.js
```

If frontend screens grow further, split `src/screens/PortalScreens.js` into:

```text
src/
  screens/
    AdminView.js
    AppointmentsView.js
    Dashboard.js
    MessagesView.js
    RecordsView.js
    SearchView.js
    SecurityView.js
```

## Security Notes

- Replace `JWT_SECRET` in `.env` before presenting anything beyond local testing.
- Do not commit `.env`, `backend/data`, `.expo`, `dist`, or real user information.
- Demo passwords are only for local testing and should not be reused anywhere.
- The local reset code is displayed on screen for classroom demonstration only; a production build should send the code through email/SMS and never echo it in the client response.
