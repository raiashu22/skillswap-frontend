# SkillSwap Frontend

React frontend for SkillSwap, built with Vite. Connects to the `skillswap-backend` API.

## Tech Stack
- React 18 + React Router
- Vite (dev server + build tool)
- Plain CSS with design tokens (no framework) - colors/type match the project report

## Setup

1. **Make sure the backend is running first**, on `http://localhost:5001` (see `skillswap-backend/README.md`)

2. **Install dependencies**
   ```
   npm install
   ```

3. **Start the dev server**
   ```
   npm run dev
   ```
   Opens at `http://localhost:5173`

## Project Structure
```
src/
  main.jsx               - App entry point, wraps everything in Router + AuthProvider
  App.jsx                 - Route definitions
  App.css                 - Shared component styles (navbar, buttons, cards, forms)
  index.css                - Design tokens (colors, fonts) + base resets
  api/client.js            - Single place all backend calls go through
  context/AuthContext.jsx  - Tracks logged-in user + token, persists to localStorage
  components/
    Navbar.jsx              - Top navigation, shows credit balance when logged in
    ProtectedRoute.jsx      - Redirects to /login if not authenticated
  pages/
    Home.jsx                - Landing page
    Login.jsx / Signup.jsx  - Auth forms
    BrowseSkills.jsx        - Browse/filter skills, post a new skill, send requests
    Dashboard.jsx            - Manage requests: accept/decline/complete, submit ratings
```

## Pages & what they do

| Page | Route | Auth required | What it does |
|---|---|---|---|
| Home | `/` | No | Landing page |
| Login | `/login` | No | Log in |
| Signup | `/signup` | No | Create account (starts with 5 credits) |
| Browse skills | `/browse` | No (posting/requesting needs login) | Browse all skills, filter by category, post your own, send a request |
| Dashboard | `/dashboard` | Yes | See requests you've sent/received, accept/decline/complete, rate sessions |

## Notes on design
The color palette (navy `#1b2b3a`, gold `#c3a25a`, teal `#1e6e63`) intentionally matches the mini-project PPT report, so the presentation and the live demo feel like one product.

## If something doesn't connect
- Check the backend is actually running (`http://localhost:5001/api/health` should return `{"status":"ok"}`)
- Check `src/api/client.js` - `API_BASE` must match whatever port your backend is running on
