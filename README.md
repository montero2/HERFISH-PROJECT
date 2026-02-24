# HERFISH LEGACY - Getting Started

## Applications
- ERP App (internal operators only): `frontend/` on `http://localhost:5173`
- Customer App (standalone): `customer-app/` on `http://localhost:5174`
- Official Website: `website/` on `http://localhost:5175`
- Backend API: `backend/` on `http://localhost:3000`

## Quick Start
```bash
# install dependencies per app
cd backend && npm install
cd ../frontend && npm install
cd ../customer-app && npm install
cd ../website && npm install

# run backend
cd ../backend && npm run dev

# run ERP frontend
cd ../frontend && npm run dev

# run standalone customer app
cd ../customer-app && npm run dev

# run official website
cd ../website && npm run dev
```

## Build for Website Distribution
```bash
npm --prefix customer-app run build
```

Publish `customer-app/dist/` on your official company website when ready.

## Customer App Install and Release Links
- Customer app supports browser installation (PWA) on Android and desktop.
- Website download cards can be mapped to release artifacts using:
  - `website/.env` values from `website/.env.example`
  - `VITE_ANDROID_APK_URL`
  - `VITE_WINDOWS_INSTALLER_URL`
  - `VITE_MAC_INSTALLER_URL`

## Access Model and Workflow
- ERP is for business operators only and does not include customer access screens.
- Customers use only the standalone customer app downloaded from the official company website.
- Customer actions flow into ERP through shared backend APIs:
1. Customer signs in to the standalone app.
2. Customer browses catalog and places order.
3. Customer completes payment.
4. Order appears in ERP Sales for fulfillment.
5. Invoice and payment appear in ERP Finance for reconciliation.

## Project Structure
```text
HERFISH-LEGACY/
|-- frontend/        # ERP React app
|-- customer-app/    # Standalone customer React app
|-- website/         # Official company website
|-- backend/         # Express API
`-- docs/            # Documentation
```
