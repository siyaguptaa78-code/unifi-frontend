# UniCafe — REST API Documentation

UniCafe exposes a structured, RESTful HTTP API built using Next.js App Router Route Handlers. All endpoints accept and return JSON (with the exception of CSV report exports). Protected endpoints use HTTP-only session cookies containing signed JWT tokens.

---

## 🔒 Authentication & Security

### Authorization Header / Cookies
- Client web sessions authenticate via an HTTP-only cookie named `unicafe_session`.
- Machine clients or external POS adapters can supply an `Authorization: Bearer <jwt_token>` header.

### Central Role Hierarchy
| Role Enum | Portal Scope |
| :--- | :--- |
| `SUPER_ADMIN` | Global platform administration |
| `SUPERVISOR` | Assigned territory / cafes |
| `FRANCHISE_OWNER`| Assigned franchise cafe(s) |
| `CAFE_MANAGER` | Single assigned cafe |
| `CAFE_STAFF` | Single assigned cafe |
| `CUSTOMER` | Customer personal portal |

### Standard Response Envelope
All API responses adhere to a consistent JSON structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_POINTS",
    "message": "Insufficient points balance for this order.",
    "details": { "required": 450, "available": 200 }
  }
}
```

---

## 1. Authentication APIs

### `POST /api/auth/register`
Register a new customer account.

- **Access:** Public
- **Rate Limit:** 5 requests / 60s
- **Request Body:**
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "mobile": "9876543210",
    "password": "Password@123",
    "confirmPassword": "Password@123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6724...",
        "name": "Aarav Sharma",
        "email": "aarav@example.com",
        "mobile": "9876543210",
        "role": "CUSTOMER",
        "status": "ACTIVE"
      },
      "customerCode": "UC8921"
    }
  }
  ```

### `POST /api/auth/login`
Authenticate with email/mobile and password. Sets HTTP-only session cookie.

- **Access:** Public
- **Rate Limit:** 10 requests / 60s
- **Request Body:**
  ```json
  {
    "identifier": "customer@unicafe.demo",
    "password": "Demo@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6724...",
        "name": "Rohan Verma",
        "email": "customer@unicafe.demo",
        "role": "CUSTOMER"
      },
      "portalUrl": "/customer/dashboard"
    }
  }
  ```

### `GET /api/auth/me`
Retrieve currently logged-in user profile and permissions.

- **Access:** Authenticated
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6724...",
        "name": "Rohan Verma",
        "email": "customer@unicafe.demo",
        "role": "CUSTOMER"
      }
    }
  }
  ```

### `POST /api/auth/logout`
Terminates the session and clears the HTTP-only cookie.

- **Access:** Authenticated
- **Response (200 OK):** `{"success": true, "message": "Logged out successfully"}`

---

## 2. Customer Portal APIs

### `GET /api/customer/profile`
Retrieve full customer details including membership, wallet, and active smart card.

- **Access:** `CUSTOMER`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "profile": { "customerCode": "UC1001", "city": "Bengaluru" },
      "membership": {
        "status": "ACTIVE",
        "pointsBalance": 4650,
        "remainingMinutes": 8100,
        "remainingHours": 135
      },
      "card": {
        "cardNumber": "UCM-2026-1001",
        "uid": "NFC-IND-001",
        "status": "ACTIVE"
      }
    }
  }
  ```

### `GET /api/customer/wallet`
Fetch real-time points balance, credits, debits, refunds, and points ledger history.

- **Access:** `CUSTOMER`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "balance": 4650,
      "totalCredited": 5000,
      "totalSpent": 350,
      "totalRefunded": 0,
      "ledger": [
        {
          "type": "DEBIT",
          "points": 350,
          "source": "ORDER",
          "reference": "ORD-202610-1001",
          "balanceAfter": 4650,
          "createdAt": "2026-10-31T14:30:00.000Z"
        }
      ]
    }
  }
  ```

### `GET /api/customer/membership`
Fetch membership plan details, recharge history, and remaining minutes.

- **Access:** `CUSTOMER`

### `GET /api/customer/card`
Fetch active digital and physical smart card credentials.

- **Access:** `CUSTOMER`

### `GET /api/customer/visits`
List past and active cafe check-in/check-out sessions.

- **Access:** `CUSTOMER`

### `GET /api/customer/orders`
List past food and beverage orders placed by the customer.

- **Access:** `CUSTOMER`

---

## 3. Payments & Membership Recharge APIs

### `POST /api/payments/create-order`
Create a new Razorpay payment order for membership recharge (₹5,000).

- **Access:** `CUSTOMER`
- **Request Body:**
  ```json
  {
    "purpose": "MEMBERSHIP_RECHARGE",
    "amount": 5000
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "order_MN89xkl120",
      "amount": 500000,
      "currency": "INR",
      "key": "rzp_test_..."
    }
  }
  ```

### `POST /api/payments/verify`
Verify Razorpay HMAC-SHA256 signature and apply recharge.

- **Access:** `CUSTOMER`
- **Request Body:**
  ```json
  {
    "razorpay_order_id": "order_MN89xkl120",
    "razorpay_payment_id": "pay_MN89zz90",
    "razorpay_signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "status": "SUCCESS",
      "pointsBalance": 9650,
      "remainingHours": 150
    }
  }
  ```

### `POST /api/payments/demo-complete`
Instant simulation recharge for development, demo, and evaluation testing without a live Razorpay gateway.

- **Access:** `CUSTOMER`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "receipt": "DEMO-RCP-1730419200",
      "pointsCredited": 5000,
      "hoursReset": 150
    }
  }
  ```

---

## 4. NFC/RFID Smart Card & Cafe Visit APIs

### `POST /api/visits/scan`
Process contactless smart card tap for entry or exit.

- **Access:** `SUPER_ADMIN`, `CAFE_MANAGER`, `CAFE_STAFF`
- **Request Body:**
  ```json
  {
    "uid": "NFC-IND-001",
    "cafeId": "67241234abcd...",
    "mode": "AUTO",
    "deviceId": "READER_COUNTER_01"
  }
  ```
- **Response (Entry - 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "action": "ENTRY",
      "message": "Welcome to UniCafe Indiranagar!",
      "session": { "id": "6724...", "entryAt": "2026-11-01T10:00:00.000Z" },
      "customer": { "name": "Rohan Verma", "customerCode": "UC1001", "remainingHours": 142 }
    }
  }
  ```
- **Response (Exit - 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "action": "EXIT",
      "message": "Checked out — 75 min deducted",
      "elapsedMinutes": 75,
      "remainingMinutes": 7800,
      "customer": { "name": "Rohan Verma", "customerCode": "UC1001" }
    }
  }
  ```

### `GET /api/cards/lookup`
Lookup customer card details by UID or customer phone number before scanning.

- **Access:** `SUPER_ADMIN`, `CAFE_MANAGER`, `CAFE_STAFF`
- **Query Params:** `?uid=NFC-IND-001` or `?mobile=9876543210`

### `POST /api/cards`
Issue or assign a new physical card UID to a customer.

- **Access:** `SUPER_ADMIN`, `CAFE_MANAGER`, `CAFE_STAFF`

### `PATCH /api/cards/[id]/status`
Update card state (`ACTIVE`, `BLOCKED`, `LOST`, `REPLACED`).

- **Access:** `SUPER_ADMIN`, `CAFE_MANAGER`

---

## 5. Food Ordering APIs

### `POST /api/orders`
Place a food order using wallet points. Points are debited atomically inside a database transaction.

- **Access:** `CUSTOMER`
- **Request Body:**
  ```json
  {
    "cafeId": "6724cafe...",
    "orderType": "IN_CAFE",
    "tableNumber": "Table 14",
    "notes": "Less sugar in Cold Brew",
    "idempotencyKey": "idem_uuid_12345",
    "items": [
      { "menuItemId": "6724item1...", "quantity": 1 },
      { "menuItemId": "6724item2...", "quantity": 2 }
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "order": {
        "orderNumber": "ORD-20261101-0012",
        "totalPoints": 580,
        "status": "PENDING",
        "walletBalanceAfter": 4070
      }
    }
  }
  ```

### `GET /api/orders`
List orders with role-based filtering:
- Customers see their own orders.
- Staff/Managers see orders for their assigned cafe.
- Supervisors see orders for their assigned territory.
- Super Admins see all network orders.

- **Access:** All authenticated roles
- **Query Params:** `?cafeId=...&status=...&dateFrom=...&page=1&limit=20`

### `PATCH /api/orders/[id]`
Advance order lifecycle (`ACCEPTED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`).

- **Access:** `SUPER_ADMIN`, `CAFE_MANAGER`, `CAFE_STAFF`

### `POST /api/orders/[id]/refund`
Cancel an unfulfilled order and refund wallet points.

- **Access:** `CUSTOMER` (only if still `PENDING`), `CAFE_MANAGER`, `SUPER_ADMIN`

---

## 6. Menu Management APIs

### `GET /api/menu/cafe/[cafeId]`
Fetch the complete menu available at a specific cafe (merges central catalog with approved local items and overrides).

- **Access:** Public / Authenticated

### `GET /api/menu/items`
List central menu catalog items with category and dietary filters.

- **Access:** Public / Authenticated

### `POST /api/menu/items`
Create a new central menu item.

- **Access:** `SUPER_ADMIN`

### `POST /api/menu/customizations`
Submit a local cafe item or price customization request.

- **Access:** `CAFE_MANAGER`, `FRANCHISE_OWNER`

### `POST /api/menu/approvals`
Approve or reject local cafe menu customization requests.

- **Access:** `SUPER_ADMIN`

---

## 7. Reports & Analytics APIs

### `GET /api/reports`
Generate aggregate metrics for any of the 13 built-in enterprise reports:
- `MEMBERSHIP_SALES`
- `POINTS_CONSUMPTION`
- `HOURS_UTILIZATION`
- `VISIT_ANALYTICS`
- `CAFE_SALES`
- `MENU_ITEM_PERFORMANCE`
- `FRANCHISE_ROYALTY`
- `PEAK_HOURS`
- `CUSTOMER_RETENTION`
- `CARD_ISSUANCE`
- `REFUND_REPORT`
- `AUDIT_LOG_REPORT`
- `INACTIVE_MEMBERS`

- **Access:** `SUPER_ADMIN`, `SUPERVISOR`, `FRANCHISE_OWNER`, `CAFE_MANAGER` (scoped to permissions)
- **Query Params:** `?type=CAFE_SALES&cafeId=...&dateFrom=2026-10-01&dateTo=2026-10-31`

### `GET /api/reports/export`
Stream aggregate report data directly as a formatted RFC-4180 CSV download.

- **Access:** Privileged roles
- **Query Params:** `?type=MEMBERSHIP_SALES&format=csv`

---

## 8. Administrative & Operations APIs

### `GET /api/admin/dashboard`
Live platform KPIs (Active members, active check-ins, today's revenue, order queue, 30-day trend chart data).

- **Access:** `SUPER_ADMIN`

### `GET /api/operations/dashboard`
Operational status board scoped to Supervisor, Franchise Owner, or Cafe Manager.

- **Access:** `SUPERVISOR`, `FRANCHISE_OWNER`, `CAFE_MANAGER`, `CAFE_STAFF`

### `GET /api/settings` & `PUT /api/settings`
Fetch and update system configuration (Recharge price, points ratio, membership hours, alert thresholds).

- **Access:** `SUPER_ADMIN`

### `GET /api/audit-logs`
Query immutable audit logs tracking sensitive actions (refunds, session overrides, role elevations).

- **Access:** `SUPER_ADMIN`

