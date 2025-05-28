# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QMS+ is a multi-industry web application for managing Quality Management Systems (QMS) following ISO 9001:2015 standards. Initially designed for hotels, it has been generalized to support any industry (manufacturing, healthcare, retail, technology, etc.). It transforms manual quality processes into a digital, interactive, and proactive tool using Firebase as the backend infrastructure.

## Architecture

This is a monorepo with the following structure:
- **packages/web-app**: React 19 + TypeScript frontend with Material-UI v7
- **packages/functions**: Firebase Cloud Functions (Node.js 18 + TypeScript)
- **packages/shared**: Shared TypeScript types between frontend and backend
- **infrastructure**: Firebase configuration files

The project uses Firebase BaaS (Backend-as-a-Service) for:
- Authentication (user management)
- Firestore (real-time NoSQL database)
- Cloud Functions (serverless backend)
- Cloud Storage (file storage)
- Hosting (web deployment)

## Development Commands

### Frontend (packages/web-app)
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run test         # Run tests with Vitest
npm run format       # Format code with Prettier
```

### Backend Functions (packages/functions)
```bash
npm run build        # Compile TypeScript
npm run serve        # Start Firebase emulators
npm run deploy       # Deploy to Firebase
```

### Firebase Setup
Before running the project, ensure Firebase configuration is set up in `packages/web-app/.env`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Key Design Decisions

1. **Multi-tenant Architecture**: The system supports multiple companies across industries with data isolation at the Firestore level (`/companies/{companyId}/...`). Three hierarchical levels:
   - Platform level (super_admin)
   - Organization level (org_admin) - for corporations, franchises, groups
   - Company level (company_admin) - individual business units

2. **Role-Based Access Control**: Main roles are defined:
   - `super_admin`: Platform administrator
   - `org_admin`: Organization/chain administrator  
   - `company_admin`: Company/business unit administrator
   - `quality_manager`: Quality management lead
   - `department_manager`: Department heads
   - `employee`: Regular staff

3. **Real-time Updates**: Firestore's real-time capabilities are central to the "living system" concept

4. **Material Design 3**: The UI follows Google's latest design system with custom theming

5. **TypeScript Throughout**: Strong typing is used across frontend, backend, and shared types

6. **Industry Agnostic**: The system now supports 20+ industries with:
   - Configurable department templates per industry
   - Industry-specific KPIs and metrics
   - Customizable processes and certifications
   - Industry-specific risk categories

## Module Structure

The application is organized into functional modules:
- **Dashboard**: Real-time KPIs and metrics
- **Documents**: ISO documentation management with version control
- **Non-Conformities**: NC/CAPA tracking and resolution
- **Processes**: Process mapping and management
- **Audits**: Internal/external audit management
- **Gamification**: Points and badges system to encourage participation

## Testing Strategy

- **Unit Tests**: Vitest for components and functions
- **Integration Tests**: Testing Firebase integration
- **E2E Tests**: Planned with Cypress

Run tests before committing any changes.

## Security Considerations

- Firestore Security Rules enforce data access at the database level
- Custom Claims in Firebase Auth control user permissions
- All sensitive operations require authentication
- Environment variables store Firebase configuration

## Important Files

- `infrastructure/firestore.rules`: Database security rules (updated for companies)
- `packages/shared/types/Company.ts`: Main company entity definition
- `packages/shared/types/Industry.ts`: Industry types and configurations
- `packages/shared/types/Organization.ts`: Organization entity for multi-tenant
- `packages/web-app/src/theme/`: Material-UI theme configuration
- `FIREBASE_SETUP.md`: Detailed Firebase setup instructions

## Development Workflow

1. Always run `npm run lint` and `npm run test` before committing
2. Use the existing component patterns in `packages/web-app/src/components/`
3. Follow the established Firestore data structure
4. Maintain TypeScript types in the shared package
5. Update Firestore rules when adding new collections