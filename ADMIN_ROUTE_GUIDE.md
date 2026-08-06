# Admin and Agent Route Guide

This guide is the admin-side reference for which backend route each frontend module calls.

Use it while working in `admin-side-lic` and when checking agent-side compatibility.

## Base URLs

- Backend: `http://localhost:3000`
- Admin frontend: `admin-side-lic`
- Agent frontend: `LIC`

## Admin Side

### Authentication

- `POST /api/admin/login` for admin login
- `POST /api/auth/refresh` for token refresh
- `POST /api/auth/logout-all` for session revocation

Frontend module:

- `src/modules/admin/auth/authService.ts`

### Dashboard

- `GET /api/user-panel/dashboard-overview`

Frontend module:

- `src/modules/admin/dashboard/dashboardService.ts`

### Users

- `GET /api/admin/users/`
- `GET /api/admin/users/:id/`
- `POST /api/admin/users/`
- `PATCH /api/admin/users/:id/`
- `DELETE /api/admin/users/:id/`

Frontend module:

- `src/modules/admin/users/usersService.ts`

### Companies

- `GET /api/admin/companies/`
- `GET /api/admin/companies/:id/`
- `POST /api/admin/companies/`
- `PATCH /api/admin/companies/:id/`
- `DELETE /api/admin/companies/:id/`

Frontend module:

- `src/modules/admin/companies/companyService.ts`

### Bulk Notifications

- `GET /api/admin/bulk-notifications/`
- `GET /api/admin/bulk-notifications/:id/`
- `POST /api/admin/bulk-notifications/`
- `DELETE /api/admin/bulk-notifications/:id/`

Frontend modules:

- `src/modules/user/bulk-notifications/bulkNotificationsService.ts`
- `src/modules/admin/notifications/bulkNotificationsService.ts`

## Agent Side

### Authentication

- `POST /api/agent/login`

### Profile

- `GET /api/users/me`
- `PUT /api/users/me`

### Notifications

- `GET /api/agent/notifications`
- `GET /api/agent/notifications/unread/count`
- `GET /api/agent/notifications/:id`
- `PATCH /api/agent/notifications/:id/read`

## Route Ownership

- Admin only: `/api/admin/*`
- Agent only: `/api/agent/*`
- Shared auth: `/api/auth/refresh`, `/api/auth/logout-all`
- Profile: `/api/users/me`

## Notes

- The correct admin login route is `/api/admin/login`, not `/api/auth/login`.
- The admin dashboard currently uses the `user-panel` route tree.
- Most admin records use soft delete.
- Company create supports logo/image upload.
