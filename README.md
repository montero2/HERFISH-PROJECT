# MOSESTA LIMITED - Getting Started

## Applications
- ERP App (internal operators only): `frontend/` on `http://localhost:5173`
- Customer App (standalone): `customer-app/` on `http://localhost:5174`
- Distributor App (standalone): `distributor-app/` on `http://localhost:5176`
- Official Website: `website/` on `http://localhost:5175`
- Backend API: `backend/` on `http://localhost:3000`

## Quick Start
```bash
# install dependencies per app
cd backend && npm install
cd ../frontend && npm install
cd ../customer-app && npm install
cd ../distributor-app && npm install
cd ../website && npm install

# run backend
cd ../backend && npm run dev

# run ERP frontend
cd ../frontend && npm run dev

# run standalone customer app
cd ../customer-app && npm run dev

# run standalone distributor app
cd ../distributor-app && npm run dev

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

## Notification Providers (Email + SMS)

Set these in `backend/.env` to enable external notifications:

```env
EMAIL_NOTIFICATIONS_ENABLED=true
SMS_NOTIFICATIONS_ENABLED=true

SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=alerts@mosestalimited.co.ke

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1XXXXXXXXXX

OPERATOR_PHONE=+2547XXXXXXXX
DISTRIBUTOR_PHONE=+2547XXXXXXXX
```

Notes:
- Customer emails use the registered customer email.
- Customer SMS uses customer phone in backend store (extend customer profile for production).

## Access Model and Workflow
- ERP is for business operators only and does not include customer access screens.
- **Privileged Access**: ERP and Distributor apps are installed on Administrator/Distributor devices (Computer/Phone) and require privileged access.
- **Public Access**: Customers use the Official Website or the standalone Customer App.
- Customer actions flow into ERP through shared backend APIs:
1. Customer signs in to the standalone app.
2. Customer browses catalog and places order.
3. Customer completes payment.
4. Order appears in ERP Sales for fulfillment.
5. Invoice and payment appear in ERP Finance for reconciliation.

## Order Fulfillment Lifecycle
1. **Order**: Customer places order via Website or Customer App.
2. **Approval**: Manager/Operator reviews and approves the order in the ERP System.
3. **Dispatch**: Once approved, the order reflects in the Distributor App.
4. **Shipping**: Distributor fulfills and ships the order.
5. **Delivery**: Customer marks the order as "Delivered" in the Customer App.
6. **Sync**: Delivery status updates automatically across Distributor App and ERP.

## Project Structure
```text
MOSESTA LIMITED/
|-- frontend/        # ERP React app
|-- customer-app/    # Standalone customer React app
|-- distributor-app/ # Standalone distributor React app
|-- website/         # Official company website
|-- backend/         # Express API
`-- docs/            # Documentation
```
