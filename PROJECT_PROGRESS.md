# Rototuna Alumni Platform
## Project Progress Report

**Project:** Alumni management and digital archive platform for Rototuna Senior High School  
**Report date:** 28 August 2026  
**Current branch:** Aza

## Project Overview

The application is a full-stack alumni platform with a React frontend, an Express backend, and PostgreSQL data storage. It supports alumni registration, account approval, authentication, profile management, employment and education history, events, messaging, profile search, and administrator workflows.

## Timeline

### 20-24 August 2026: Core platform and deployment work

- Built and extended the React/Vite client application and Express API.
- Added authentication forms and protected application routes.
- Added JWT access-token handling and refresh-token cookies.
- Added deployment configuration for a production API hosted on Render and a frontend hosted on Vercel.
- Added Supabase Storage integration for profile image uploads.
- Improved the AlumniConnect logo and production asset handling.
- Added profile editing improvements, location fields, profile photos, and profile data updates.
- Added duplicate username handling with a clear registration response.

### 25 August 2026: Education and profile features

- Added education history to user profiles.
- Added education API routes, controllers, and database model support.
- Continued profile and employment history improvements.

### 26 August 2026: Registration approval and identity fixes

- Changed new registrations to pending status using `active = 2`.
- Prevented pending users from logging in until an administrator approves their account.
- Added the message: `Admin needs to approve your account.`
- Added administrator-only membership request access.
- Added administrator approval workflow to change a user from `active = 2` to `active = 1`.
- Fixed login compatibility for `login`, `username`, and email identifiers.
- Fixed token restoration after page reload so authenticated profile updates continue to work.
- Added `/profile/me` to load the authenticated user's own profile.
- Removed the unsafe fallback that could show another user's profile.
- Restricted profile updates to the authenticated profile owner.
- Fixed route ordering so `/profile/me` is not interpreted as `/profile/:id`.

### 27 August 2026: Search, views, and reporting

- Added profile sorting by first name and last name.
- Added client-side pagination with 20 profiles per page.
- Added administrator-only Tile view and List view options.
- Added selected-record checkboxes in List view.
- Added a filtered-result Select all checkbox.
- Added Excel report export using the `xlsx` library.
- Added selected-recipient email support that copies addresses and opens the default email client.
- Added responsive styling for desktop, tablet, and mobile layouts.

## Delivered Features

### Authentication and security

- User registration and login.
- Username or email login support.
- Password hashing with bcrypt.
- Short-lived JWT access tokens.
- HttpOnly refresh-token cookies.
- Refresh-token endpoint and logout cookie clearing.
- Protected routes and bearer-token middleware.
- Pending-account restriction until administrator approval.
- Administrator-only membership request and approval operations.
- Duplicate username handling for PostgreSQL and MySQL error formats.
- Profile update ownership checks.

### Alumni profiles

- Search profiles by name or city.
- Filter profiles by graduation year.
- Sort by first name or last name in ascending or descending order.
- Tile and list presentation modes for administrators.
- Profile cards with name, location, email, and batch year.
- Profile creation and editing.
- Profile photo upload and Supabase-hosted image storage.
- Current profile lookup based on the authenticated user identity.
- Responsive profile layouts for mobile screens.

### Administrator workflows

- View pending membership requests.
- View applicant first name, last name, username, user ID, and batch.
- Approve pending accounts.
- Export selected profile records to an Excel workbook.
- Copy selected profile email addresses and open the default email client.
- Add new profiles from the profile management screen.

### Employment and education

- Add and display employment history.
- Add and display education history.
- Store company, job title, dates, descriptions, institutions, qualifications, and fields of study.

### Events and messaging

- Events page and event cards.
- Event detail modal.
- Add-event workflow for supported users.
- Alumni messaging page and recipient selection workflow.
- Message composition, templates, attachments, and scheduling fields.

### Responsive experience

- Responsive navigation bar with mobile menu.
- Stable profile dropdown behavior.
- Responsive cards, forms, modals, event grids, and message layouts.
- Mobile-friendly list controls, sorting, pagination, and administrator actions.

## Current Technical Structure

### Frontend

- React 19 with Vite.
- React Router for application navigation.
- Axios for API requests.
- Sass stylesheet in `clientside/src/css/style.scss`.
- `xlsx` for Excel workbook generation in the browser.

### Backend

- Node.js and Express.
- PostgreSQL through the `pg` package.
- JWT authentication with bcrypt password hashing.
- Cookie parsing and credentialed CORS.
- Supabase Storage for profile images.
- Separate route, controller, model, and middleware layers.

### Main API areas

- `/auth`: registration, login, refresh, logout, membership requests, approval.
- `/profile`: profile listing, current profile, profile details, updates, deletion, images.
- `/employment`: employment history operations.
- `/education`: education history operations.
- `/country`: country lookup data.

## Verification Completed

- Client production builds pass with `npm --prefix clientside run build`.
- Focused ESLint checks pass for recently changed components.
- Editor diagnostics pass for changed files.
- Node syntax checks pass for changed backend files.
- `git diff --check` passes for recent changes.
- Local `/auth/refresh` and `/profile/me` route behavior was verified during development.

## Known Follow-up Items

- Review the `xlsx` dependency audit warning and consider a supported upgrade or alternative export strategy.
- Run full end-to-end tests against the deployed frontend and backend.
- Add automated backend tests for authentication, account approval, profile ownership, and cookie clearing.
- Add automated frontend tests for list selection, filtering, pagination, Excel export, and email actions.
- Consider server-side pagination for very large alumni datasets.
- Review and disable or remove unused legacy files and duplicate development artifacts before release.
- Ensure production cookies use `secure: true` and HTTPS-only deployment settings.

## Overall Status

The platform has a working full-stack foundation and a broad set of user and administrator features. Authentication, account approval, profile ownership, responsive layouts, profile management, and administrator reporting workflows are implemented. The next stage should focus on automated testing, production hardening, dependency review, and cleanup of legacy code before final release.
