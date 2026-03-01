# Order Fulfillment Workflow Specification

## 1. Order Status Lifecycle
The order status dictates which application can see or act on the order.

| Status | Description | Visible In | Actionable By |
| :--- | :--- | :--- | :--- |
| **PENDING** | Customer has placed order. Awaiting payment/approval. | ERP (Sales), Customer App | **Manager** (Approve) |
| **APPROVED** | Manager confirmed order. Ready for dispatch. | ERP, Distributor App | **Distributor** (Ship) |
| **SHIPPED** | Distributor has dispatched goods. | ERP, Distributor App, Customer App | **Customer** (Confirm Delivery) |
| **DELIVERED** | Customer received goods. Transaction complete. | ERP (History), Customer App (History) | None (Read Only) |

## 2. Application Logic

### A. Customer App (Public)
- **Create Order**: Sets status to `PENDING`.
- **View Active**: Can see orders in `PENDING` or `SHIPPED`.
- **Confirm Delivery**: Button enabled only when status is `SHIPPED`. Updates status to `DELIVERED`.

### B. ERP System (Privileged - Manager)
- **View All**: Sees all orders.
- **Approve**: Button enabled only when status is `PENDING`. Updates status to `APPROVED`.
- **Notifications**: Receives alert when new order is created (`PENDING`).

### C. Distributor App (Privileged - Distributor)
- **View Queue**: Sees only orders in `APPROVED` status.
- **Ship**: Button enabled for `APPROVED` orders. Updates status to `SHIPPED`.
- **Notifications**: Receives alert when order is `APPROVED`.

## 3. API Endpoints (Planned)
- `POST /api/orders` - Create new order.
- `PATCH /api/orders/:id/status` - Update status (Requires Role Validation).
- `GET /api/orders` - Filter by status based on user role.