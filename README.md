# CareBridge Patient Portal

CareBridge is a mobile-first patient portal built with React Native, Expo, and a local Express backend. I built it to feel closer to a working clinic application than a static class demo: patients can request appointments, doctors can manage their own department workflow, and admins can oversee the portal without deleting clinical history.

The app works in Expo Go, Android/iOS simulators, and Chrome through React Native Web.

## Screenshots

| Login | Patient Dashboard |
| --- | --- |
| <img src="docs/screenshots/login-mobile.png" width="260" alt="CareBridge login screen" /> | <img src="docs/screenshots/patient-dashboard-mobile.png" width="260" alt="Patient dashboard screen" /> |

| Appointment Booking | Admin Panel |
| --- | --- |
| <img src="docs/screenshots/patient-appointments-mobile.png" width="260" alt="Appointment booking screen" /> | <img src="docs/screenshots/admin-panel-mobile.png" width="260" alt="Admin panel screen" /> |

## What The App Does

CareBridge has three connected portals.

Patients can sign in, view their dashboard, search portal content, read medical records, send secure messages, and request appointments. When booking a visit, the patient can choose a department and doctor, or leave the doctor blank so the system can assign one based on schedule availability.

Doctors get a provider dashboard for their assigned department. They can review patient appointment requests, approve or reject them, update patient care summaries, create new patient profiles, and request a department transfer when a patient needs another care team.

Admins can see the operational side of the portal. They can create doctor accounts, review audit activity, hide or show portal content, and change records without deleting them. The audit log is intentionally read-only for everyone except admin users.

## Main Features

- Patient, doctor/provider, and admin login
- User registration for local testing
- JWT authentication on the backend
- Password hashing with bcrypt
- Session restore after browser refresh
- Inactivity auto-lock
- Role-based dashboards and navigation
- Patient appointment requests
- Doctor approve/reject workflow
- Doctor schedule conflict checks
- Auto-assignment when a patient does not choose a doctor
- Secure messages scoped by role
- Medical records scoped by patient, doctor, and admin permissions
- Patient profile updates with patient notifications
- Department transfer request workflow
- Admin-only audit log
- Admin hide/show/change controls with no delete action
- Local JSON persistence for demo data
- Mobile, tablet, and web responsive layout
- Screenshot automation for README images

## Clinic Data Included

The demo starts with a realistic clinic workspace:

- 5 departments
- 2 doctors per department
- 5 patients per department
- 25 department patients
- seeded appointments, messages, records, schedules, and notifications

Departments included:

- Primary Care
- Cardiology
- Pediatrics
- Dermatology
- Mental Health

## Tech Stack

- React Native
- Expo SDK 54
- React Native Web
- Node.js
- Express
- JSON Web Tokens
- bcryptjs
- Local JSON file persistence

## Run The Project

The easiest way to run everything is:

```bash
./run-portal.sh
```

That script starts the backend and Expo together. Scan the QR code with Expo Go for the mobile app, or press `w` in the terminal to open the web version.

You can also choose one mode:

```bash
./run-portal.sh mobile
./run-portal.sh web
```

The script will install dependencies if needed, start the backend on `http://localhost:4000`, detect your LAN IP for Expo Go, and set `EXPO_PUBLIC_API_URL` for the app.

## Manual Commands

```bash
npm install
npm run backend
npm start
```

For web only:

```bash
npm run web
```

For validation:

```bash
npm run check:api
npm run build:web
npm run test:workflows
```

To regenerate README screenshots:

```bash
npm run screenshots
```

## Local Configuration

Create a local `.env` file from the example if you want to change ports or secrets:

```bash
cp .env.example .env
```

Supported values:

```text
PORT=4000
JWT_SECRET=replace-with-a-long-random-secret
DATA_FILE=backend/data/portal-state.json
EXPO_PUBLIC_API_URL=http://localhost:4000
```

Runtime data is stored in `backend/data/portal-state.json`. That file is ignored by git so local testing changes do not get uploaded.

## Demo Logins

All seeded local accounts use this password:

```text
portal123
```

Main accounts:

```text
Patient: maya@care.test
Doctor: dr.chen@care.test
Admin: admin@care.test
```

All doctor and patient accounts are listed in [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md).

## API Routes

```text
GET    /api/health
POST   /api/auth/login
POST   /api/auth/register
GET    /api/portal
GET    /api/search
GET    /api/audit-logs
POST   /api/appointments
PATCH  /api/appointments/:id/status
POST   /api/messages
PATCH  /api/patient-profile
POST   /api/patients
PATCH  /api/patients/:id/transfer
PATCH  /api/transfers/:id/status
POST   /api/doctors
PATCH  /api/admin/items/:collection/:id
```

## Project Structure

```text
App.js                         App shell, auth flow, shared state, navigation
src/data/portalSeed.js         Seed users, departments, records, tasks
src/screens/PortalScreens.js   Patient, provider, and admin screens
src/components/common.js       Shared cards, fields, panels, toggles
src/services/api.js            API URL and fetch helper
src/services/sessionStorage.js Browser session persistence helper
src/utils/roleScope.js         Role scoping helpers
src/styles.js                  Shared React Native styles
backend/server.js              Express API server
run-portal.sh                  One-command backend and Expo launcher
tools/capture-screenshots.mjs  Screenshot automation
docs/ARCHITECTURE.md           Expansion notes
docs/WORKFLOW_AND_GAPS.md      Workflow map and gap analysis
docs/screenshots/              README screenshots
```

## Notes

This is a demo/training portal. It uses synthetic data only and should not be used with real patient information.

Generated folders such as `node_modules`, `dist`, `.expo`, backend runtime data, and archived backup files are intentionally ignored by git.
