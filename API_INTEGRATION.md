# API Integration Guide - Canal Ético Platform

This document describes the API integration changes made to connect the frontend to a Railway-deployed backend.

## Overview

The platform has been refactored from using localStorage to connecting with a live REST API backend deployed on Railway.

## Changes Made

### 1. API Service Layer (`src/app/services/api.ts`)

A centralized API service file has been created with:
- Environment variable configuration using `VITE_API_URL`
- TypeScript interfaces for all API requests and responses
- API methods for all backend operations:
  - `crearDenuncia()` - Create a new report
  - `consultarDenuncia()` - Track/query a report
  - `adminLogin()` - Admin authentication
  - `obtenerDenuncias()` - Get all reports (admin)
  - `actualizarEstadoDenuncia()` - Update report status (admin)
  - `actualizarCampoDenuncia()` - Update report fields (admin)

### 2. Environment Configuration

**`.env` file:**
```env
VITE_API_URL=https://your-backend.up.railway.app
```

**`.env.example` file:**
Template for environment variables with examples for both production and development.

### 3. Component Updates

All components have been updated with:
- **Loading states**: Spinner animations during API calls
- **Error handling**: User-friendly error messages with try/catch blocks
- **Async/await**: Proper async operations for all API calls
- **Success feedback**: Confirmation messages after successful operations

**Updated components:**
- `SubmitReport.tsx` - Report submission with API integration
- `Tracking.tsx` - Report tracking with API verification
- `ReportStatus.tsx` - Display report details from API
- `AdminLogin.tsx` - Admin authentication with JWT tokens
- `AdminDashboard.tsx` - Full admin dashboard with real-time data

## API Endpoints

The frontend expects the following API endpoints:

### Public Endpoints

```
POST /api/denuncias
- Create a new report
- Body: { type, description, involved, date, password, empresa, departamento, ... }
- Response: { success: true, code: "CE-2026-0425-XXXX" }

POST /api/denuncias/consultar
- Track a report
- Body: { code, password }
- Response: { code, type, status, description, ... }
```

### Admin Endpoints (Require Authentication)

```
POST /api/admin/login
- Admin login
- Body: { username, password }
- Response: { success: true, token: "jwt-token", username: "admin" }

GET /api/admin/denuncias
- Get all reports
- Headers: { Authorization: "Bearer <token>" }
- Response: [ { code, type, status, ... }, ... ]

PATCH /api/admin/denuncias/:code/estado
- Update report status
- Headers: { Authorization: "Bearer <token>" }
- Body: { status: "En revisión" }
- Response: { success: true }

PATCH /api/admin/denuncias/:code/campo
- Update report field (analysis, conclusion)
- Headers: { Authorization: "Bearer <token>" }
- Body: { field: "analysis", value: "..." }
- Response: { success: true }
```

## Security Features

1. **HTTPS Only**: All API calls use HTTPS in production
2. **JWT Authentication**: Admin endpoints protected with Bearer tokens
3. **Password Hashing**: Passwords should be hashed on the backend
4. **CORS Configuration**: Backend must allow requests from the frontend domain
5. **No Hardcoded URLs**: All URLs configured via environment variables

## Deployment Instructions

### Frontend (Vercel/Netlify)

1. Build the application:
   ```bash
   pnpm install
   pnpm build
   ```

2. Set environment variables in your hosting platform:
   - `VITE_API_URL` = Your Railway backend URL

3. Deploy the build output

### Backend (Railway)

1. Ensure your backend implements all required API endpoints
2. Configure CORS to allow requests from your frontend domain
3. Set up JWT authentication for admin endpoints
4. Deploy to Railway and note the provided URL
5. Update frontend `.env` with the Railway URL

## Development Setup

For local development:

1. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Ensure your local backend is running on port 8080

## Testing

Test the following workflows:

1. **Report Submission**: Create a new report and receive a tracking code
2. **Report Tracking**: Query a report with code and password
3. **Admin Login**: Authenticate as admin
4. **Admin Dashboard**: View all reports, update status, add analysis/conclusion
5. **Error Handling**: Test with invalid credentials, network errors

## Migration from localStorage

The platform previously used localStorage for data persistence. The new API-based system provides:
- **Persistent storage**: Data survives across sessions and devices
- **Multi-user access**: Multiple admins can access the same data
- **Real-time updates**: Changes are immediately reflected
- **Security**: Proper authentication and authorization
- **Scalability**: Can handle thousands of reports

## Troubleshooting

**CORS Errors:**
- Ensure backend CORS configuration allows your frontend domain
- Check that credentials are included in requests if needed

**Authentication Errors:**
- Verify JWT token is being stored and sent correctly
- Check token expiration and refresh logic

**Network Errors:**
- Verify `VITE_API_URL` is set correctly
- Check that backend is deployed and accessible
- Review browser console for detailed error messages

**Loading States:**
- All API calls show loading spinners
- If stuck loading, check network tab for failed requests

## Next Steps

1. Deploy backend to Railway
2. Update `.env` with Railway URL
3. Test all functionality end-to-end
4. Deploy frontend to Vercel/Netlify
5. Monitor error logs and user feedback
