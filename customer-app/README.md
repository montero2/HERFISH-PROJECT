# HERFISH Customer App

Standalone customer-facing application for buyers to:
- Register/login
- Browse live product catalog
- Place orders
- Pay pending orders
- Install as app on Android and desktop browsers (PWA)

All actions sync to the same backend data used by ERP Sales and Finance modules.

## Run locally

```bash
cd customer-app
npm install
npm run dev
```

Default URL: `http://localhost:5174`

## Backend requirement

Backend API should be running on `http://localhost:3000`.

The app uses:
- `GET /api/v1/customer/catalog`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/customer/orders`
- `POST /api/v1/customer/orders`
- `POST /api/v1/customer/orders/:orderId/payments`

## Build for website distribution

```bash
npm run build
```

This generates static files in `customer-app/dist/`.

When the official company website is ready, host these files under a public path such as:
- `https://herfishlegacy.com/customer-app/`

You can also zip the `dist` folder for direct download links from the website.

## Install on Devices (PWA)

When running on HTTPS (or localhost), users can install the app:
- Android: open app in Chrome and tap `Install App` or `Add to Home Screen`.
- Desktop: open app in Chrome/Edge and click browser install icon or `Install App` button.
