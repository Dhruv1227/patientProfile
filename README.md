# CareBridge Patient Portal

CareBridge is a React Native/Expo patient portal with a local Express backend. It is built for mobile demo in Expo Go, with web support for Chrome presentation.

## Main Features

- Patient, Doctor/Provider, and Admin login
- User registration with role selection
- Mobile-first UI with bottom navigation
- Responsive tablet/desktop layout with sidebar navigation
- Animated login, screen transitions, cards, metrics, panels, tabs, and buttons
- Personalized dashboards for each role
- Medical records, care profile, vitals, messages, appointments, and search
- 5 departments with 5 patients per department
- 2 doctors per department with provider login accounts
- Patient appointment requests with department and doctor selection
- Automatic doctor assignment when patient does not choose a doctor
- Doctor schedules that sync with appointment requests
- Doctor approve/reject workflow for patient requests
- Doctor/Admin patient profile update workflow with patient-specific notifications
- Doctor/Admin create patient profile workflow
- Admin create doctor profile workflow
- Admin hide/show/change portal items without deleting data
- Admin-only security audit logs
- Local backend fallback behavior for class demo reliability

## Tech Stack

- React Native
- Expo SDK 54
- React Native Web
- Node.js
- Express
- JWT authentication
- bcrypt password hashing
- In-memory demo data

## Quick Start

Run the backend and Expo together:

```bash
./run-portal.sh
```

Then scan the QR code with Expo Go.

The script:

- installs dependencies if needed
- starts the backend on `http://localhost:4000`
- sets `EXPO_PUBLIC_API_URL` to your laptop LAN IP
- starts Expo in LAN mode

## Manual Run

Install dependencies:

```bash
npm install
```

Start backend:

```bash
npm run backend
```

Start Expo in another terminal:

```bash
npm start
```

For web:

```bash
npm run web
```

## Demo Credentials

All demo accounts use:

```text
portal123
```

Main accounts:

```text
Patient: maya@care.test
Doctor: dr.chen@care.test
Admin: admin@care.test
```

All department patient and doctor accounts are listed in:

```text
DEMO_CREDENTIALS.md
```

## Departments

- Primary Care
- Cardiology
- Pediatrics
- Dermatology
- Mental Health

Each department includes:

- 5 synthetic patients
- 2 doctors
- provider login accounts
- schedule data

## Role Workflows

### Patient

- login/register
- view dashboard
- view medical records
- send secure messages
- request appointment
- select department
- select doctor or use auto-assignment
- receive notifications after doctor updates or appointment decisions

### Doctor / Provider

- view patient requests
- approve/reject appointments
- view synced schedule
- update selected patient profile
- create new patient profile
- send profile updates that notify the specific patient

### Admin

- view full admin panel
- create doctor/provider profile
- view departments and patient counts
- manage appointments, messages, and notifications
- hide/show/change content without deleting
- view security audit logs

## Backend API

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
POST   /api/doctors
PATCH  /api/admin/items/:collection/:id
```

## Notes

- Data is stored in memory for classroom/demo use.
- Restarting the backend resets runtime changes.
- `node_modules`, `dist`, `.expo`, and backup files are ignored by git.
