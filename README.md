# MediTrack

A modern frontend for medicine stock and expiry management. The project currently includes a responsive sign-in page and a preview dashboard.

## Open on macOS

1. Install [Node.js](https://nodejs.org/) (version 20 or newer) and [Visual Studio Code](https://code.visualstudio.com/) if you do not already have them.
2. Open VS Code, choose **File → Open Folder**, and select this `Meditrack` folder.
3. In VS Code, choose **Terminal → New Terminal**.
4. Run `npm install` once, then run `npm run dev`.
5. Open the local address shown in the terminal, usually <http://127.0.0.1:5173/>.

To stop the app, press **Control + C** in the terminal. Run `npm run build` to check the production build.

## Try the login

Select **Fill in demo account**, then **Sign in to MediTrack**. The demo credentials are `demo@meditrack.app` and `MediTrack2026!`. **Remember me** keeps the demo session across browser restarts; otherwise it lasts for the current browser session. **Sign out** clears it.

This is a frontend demo. The credentials are present in browser code and **must not be used for real authentication**. There is no backend, database, password reset, or live medicine data yet. Before handling real accounts or health data, connect an authentication service and secure API, remove the demo credentials, and replace the preview dashboard data.

## Project structure

- `index.html` — app entry point
- `src/main.jsx` — React UI and demo login flow
- `src/styles.css` — responsive styling
- `package.json` — dependencies and development commands

Stack: React, Vite, and Lucide icons. The GitHub repository initially contained only a README and `.gitignore`.
