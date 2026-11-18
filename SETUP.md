# Unifi Cafe — Setup & Installation Guide

This guide provides comprehensive, step-by-step instructions to configure, run, test, and deploy the Unifi Cafe multi-location cafe management platform.

---

## 📋 System Requirements

| Component | Minimum Version | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | v18.18.0 | v20.x or v22.x LTS | App Router & React 19 support |
| **Package Manager** | npm v9+ | npm v10+ or pnpm | Standard npm scripts included |
| **Operating System** | Windows 10/11, macOS, Linux | Any 64-bit OS | Fully cross-platform |
| **Database** | MongoDB 6.0+ | MongoDB 7.0+ Replica Set | **Replica Set required** for multi-document ACID transactions |
| **Memory** | 4 GB RAM | 8 GB+ RAM | For running local dev server & embedded DB |

---

## 🚀 Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/unifi-cafe.git
cd unifi-cafe

# Install npm dependencies
npm install
```

---

## ⚙️ Step 2: Environment Configuration

Copy the example environment configuration into `.env.local`:

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# Linux / macOS
cp .env.example .env.local
```

### Essential Environment Variables

Open `.env.local` and review the key variables:

```ini
# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# MongoDB Connection String (must support replica set for transactions)
MONGODB_URI="mongodb://127.0.0.1:27017/unicafe?replicaSet=rs0"

# JWT Authentication Secret (must be at least 32 characters)
JWT_SECRET="super-secret-production-quality-unifi-cafe-jwt-signing-key-32chars"

# Razorpay Payment Gateway (Test or Live credentials)
RAZORPAY_KEY_ID="rzp_test_YourTestKey12345"
RAZORPAY_KEY_SECRET="YourRazorpaySecretKey12345"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YourTestKey12345"

# Security & Sessions
BCRYPT_ROUNDS=10
SESSION_COOKIE_NAME="uc_session"
SESSION_MAX_AGE_SECONDS=604800
```

> [!NOTE]
> Even if Razorpay keys are omitted or set to placeholder values, Unifi Cafe's built-in **Demo Payment Simulator** allows testing end-to-end recharge workflows without external network dependencies.

---

## 🗄️ Step 3: MongoDB Database Setup

Unifi Cafe relies on MongoDB transactions (`session.withTransaction`) to guarantee that financial ledger records, points balances, and visit sessions are updated atomically. This requires MongoDB to run as a **Replica Set** (`rs0`).

You have two options:

### Option A: Use the Built-in Embedded Replica Set (Recommended for Local Dev)

The repository includes a zero-config persistent replica set runner using MongoDB 7.0:

```bash
# Run in a separate terminal:
npm run db:local
```

This starts a local MongoDB replica set listening on `127.0.0.1:27017`, naming the replica set `rs0` and storing files persistently in `.local-db/`.

### Option B: Use an Existing Local MongoDB or Docker Instance

If you already have Docker installed:

```bash
docker run -d --name unifi-cafe-mongo -p 27017:27017 mongo:7.0 --replSet rs0
docker exec -it unifi-cafe-mongo mongosh --eval "rs.initiate()"
```

Or for MongoDB installed natively via Homebrew or Windows MSI:
1. Edit `mongod.conf` and add:
   ```yaml
   replication:
     replSetName: rs0
   ```
2. Restart the MongoDB service and initiate the replica set in `mongosh`:
   ```javascript
   rs.initiate()
   ```

---

## 🌱 Step 4: Seed the Database

Once your MongoDB instance is running, execute the database seed script:

```bash
npm run seed
```

To wipe existing collections and perform a clean re-seed:

```bash
npm run seed:reset
```

### What Gets Seeded:
- **6 Demo Accounts** covering every role with known credentials.
- **5 Cafe Locations** (Indiranagar, Koramangala, Whitefield in Bengaluru; Bandra in Mumbai; CyberCity in Gurgaon).
- **2 Franchise Packages** (Silver 3-branch and Gold 10-branch packages).
- **3 Registered Franchises** with assigned cafe ownership.
- **42 Menu Items** across 6 categories (Espresso, Brews, Sandwiches, Pastries, Healthy Bowls, Desserts).
- **20 Verified Demo Customers** with customer profiles, initial ₹5,000 recharges, points wallets, and assigned smart cards.
- **32 Realistic Orders** across all statuses (`PENDING`, `ACCEPTED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`).
- **25 Visit Sessions** including historical completed visits and active ongoing cafe visits.
- **System Settings** configured with default pricing (₹5,000), 5,000 points, 150 hours, and low-balance thresholds.

---

## 💻 Step 5: Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Step 6: Run Automated Tests

To run the business logic verification suite:

```bash
npx tsx tests/run-tests.ts
```

This executes 24 automated assertions covering:
- Customer registration, email uniqueness, and bcrypt login.
- Membership purchase and recharge logic (₹5,000 = 5,000 pts + 150h).
- Webhook duplicate protection and idempotency.
- Points carry-forward and hours reset to 150h.
- Razorpay HMAC-SHA256 signature verification.
- Smart card NFC/RFID entry, duplicate tap rejection, zero-hours entry block, and safety exit.
- Order placement, atomic points deduction, insufficient points rejection, and cancellation refunds.
- Area supervisor role-based cafe scoping and unauthorized location blocking.

---

## 🏗️ Step 7: Production Build & Deployment

To verify the production build locally:

```bash
npm run build
npm run start
```

### Deployment on Vercel / Node.js Host:
1. Connect your repository to Vercel or your container hosting platform (Render, Railway, AWS ECS).
2. Set the environment variables (`MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_APP_URL`).
3. Ensure the production MongoDB URI points to a MongoDB Atlas cluster (which runs as a replica set by default).
4. Run `npm run seed` once against your database using the build hook or post-deploy task.

---

## 🔍 Troubleshooting

### 1. `EPERM: operation not permitted, mkdir ...` (Windows)
This is caused by background anti-virus or file search indexers briefly locking the `.next` folder during webpack asset generation. Simply rerun `npm run build`.

### 2. `Transaction numbers are only allowed on a replica set member`
Unifi Cafe uses MongoDB transactions for financial consistency. Ensure your MongoDB connection string includes `?replicaSet=rs0` and that the replica set has been initiated (`rs.initiate()` in mongosh). Alternatively, use `npm run db:local`.

### 3. Missing MSVC Runtime DLLs on Windows (`STATUS_DLL_NOT_FOUND`)
If the embedded `mongod.exe` fails to start on clean Windows machines, ensure Microsoft Visual C++ Redistributable 2015-2022 is installed, or copy `msvcp140.dll` and `vcruntime140_1.dll` to the `node_modules/.cache/mongodb-memory-server/` directory.

