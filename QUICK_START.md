# HERFISH LEGACY - Fish Supply ERP System

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../customer-app && npm install
cd ../distributor-app && npm install
cd ../website && npm install
```

### 2. Start Development Servers

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - ERP Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Standalone Customer App:
```bash
cd customer-app
npm run dev
```

Terminal 4 - Official Website:
```bash
cd website
npm run dev
```

Terminal 5 - Distributor App:
```bash
cd distributor-app
npm run dev
```

### 3. Open Applications
- ERP Frontend (operators only): http://localhost:5173
- Customer App: http://localhost:5174
- Official Website: http://localhost:5175
- Distributor App: http://localhost:5176
- Backend API: http://localhost:3000

## Features
- Dashboard with KPIs
- Inventory Management
- Procurement Module
- Sales Order Management
- Finance and Accounting
- Quality Control and Traceability
- Standalone Customer Ordering App

## Technology Stack
- Frontend: React 18 + TypeScript + Vite
- Customer App: React 18 + TypeScript + Vite
- Backend: Express + TypeScript

## Project Structure
```text
HERFISH-LEGACY/
|-- frontend/       # ERP React application
|-- customer-app/   # Standalone customer React application
|-- distributor-app/# Standalone distributor React application
|-- website/        # Official company website
|-- backend/        # Express API
`-- docs/           # Documentation
```

## Next Steps
1. Keep backend running on port 3000.
2. Run ERP frontend for internal staff (port 5173).
3. Run customer app for buyers (port 5174).
4. Run official website for public users (port 5175).
5. Run distributor app for dispatch team (port 5176).
6. Build customer app with `npm --prefix customer-app run build` and publish its dist files on the official website when ready.

## Refined Operating Workflow
1. Internal team works only in ERP (`frontend`).
2. Buyers/distributors work only in standalone customer app (`customer-app`).
3. Orders and payments submitted from customer app sync to backend.
4. ERP operator confirms payment/order and releases to distributor queue.
5. Distributor team packages and updates delivery progress in distributor app.
6. ERP and customer views consume the same backend records for fulfillment tracking and accounting.
