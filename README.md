# CareBridge Patient Portal

A React Native/Expo mini patient portal for the assignment. It demonstrates:

- User registration and login with patient, provider, and admin roles
- Personalized dashboard with medical history, appointments, provider messages, and security status
- Search across records, appointments, messages, providers, and resources
- Responsive layout for phone, tablet, and web/desktop
- Security-focused UI: MFA, session status, privacy masking, emergency access, consent settings, and audit activity

## Run

```bash
npm install
npm run backend
```

Open another terminal:

```bash
npm run web
```

For a phone or emulator:

```bash
npm start
```

Then scan the Expo QR code with Expo Go or press `a`/`i` for Android/iOS.

If you run on a physical phone, keep the backend running and set the API URL to your computer's LAN address if it changes:

```bash
EXPO_PUBLIC_API_URL=http://YOUR-LAPTOP-IP:4000 npm start
```

This project currently defaults to:

```bash
http://192.168.250.26:4000
```

## Backend API

The backend is a local Express server with in-memory demo data. It includes:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/portal`
- `GET /api/search`
- `POST /api/appointments`
- `POST /api/messages`
- `GET /api/health`

## Demo Accounts

- Patient: `maya@care.test` / `portal123`
- Provider: `dr.chen@care.test` / `portal123`
- Admin: `admin@care.test` / `portal123`

You can also register a new local demo account from the first screen.
