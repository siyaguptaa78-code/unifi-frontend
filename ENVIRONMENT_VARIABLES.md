# Unifi Cafe — Environment Variables Reference

This document provides a comprehensive guide to all environment variables used by the Unifi Cafe platform across development, testing, staging, and production environments.

---

## 📋 Variable Specifications

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `http://localhost:3000` | Canonical root URL of the application. Used for absolute links in notifications, redirects, and webhooks. |
| `MONGODB_URI` | **Yes** | `mongodb://127.0.0.1:27017/unicafe?replicaSet=rs0` | MongoDB connection URI. **Must connect to a replica set** (or mongos) to support multi-document ACID transactions. |
| `JWT_SECRET` | **Yes** | *(Min 32 characters)* | Secret key used to sign and verify HS256 authentication tokens stored in HTTP-only cookies. |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_...` | Razorpay API Key ID for server-side order generation and webhook processing. |
| `RAZORPAY_KEY_SECRET` | Optional | `your_secret_...` | Razorpay API Secret for validating HMAC-SHA256 checkout signatures. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional | `rzp_test_...` | Public Razorpay Key ID exposed to the browser to open the Razorpay Checkout modal. |
| `BCRYPT_ROUNDS` | No | `10` | Salt work factor for hashing user passwords. Recommended: 10-12. |
| `SESSION_COOKIE_NAME` | No | `uc_session` | Name of the secure HTTP-only cookie storing the session token. |
| `SESSION_MAX_AGE_SECONDS` | No | `604800` | Session cookie lifespan in seconds (default: 7 days). |
| `NODE_ENV` | No | `development` | Node runtime environment (`development`, `production`, `test`). |

---

## 🔒 Security Best Practices

### 1. Generating a Cryptographically Secure `JWT_SECRET`
Never use guessable strings or default placeholders in staging or production. Generate a strong 64-character secret using Node's native crypto module:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Cookie Security Configuration
In production (`NODE_ENV=production`), Unifi Cafe automatically sets:
- `Secure: true` (only transmitted over HTTPS).
- `HttpOnly: true` (inaccessible to browser JavaScript, mitigating XSS attacks).
- `SameSite: "lax"` (protects against CSRF).
- `Path: "/"`

### 3. Production MongoDB Atlas
When deploying to MongoDB Atlas:
- Replica set mode is enabled automatically.
- Ensure the connection URI starts with `mongodb+srv://`.
- Add network IP access rules for your deployment hosts or use VPC peering.

Example:
```ini
MONGODB_URI="mongodb+srv://unifi-cafe-prod:ComplexPassword@cluster0.abcde.mongodb.net/unicafe?retryWrites=true&w=majority"
```

---

## 📄 Sample `.env.local`

```ini
# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
MONGODB_URI="mongodb://127.0.0.1:27017/unicafe?replicaSet=rs0"

# Authentication
JWT_SECRET="e9a4f61b0c954e7d823485c2901aef32948b8c71d234a5e6f8901234bc56789a"
BCRYPT_ROUNDS=10
SESSION_COOKIE_NAME="uc_session"
SESSION_MAX_AGE_SECONDS=604800

# Payments (Razorpay)
RAZORPAY_KEY_ID="rzp_test_1234567890ABCD"
RAZORPAY_KEY_SECRET="SecretKeyRazorpay9876543210"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_1234567890ABCD"
```

