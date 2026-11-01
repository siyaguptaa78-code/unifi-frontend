# UniCafe — Testing Strategy & Verification Guide

This document outlines the testing architecture, automated test suites, execution procedures, and requirement mappings for the UniCafe platform.

---

## 🎯 Verification Objectives

The UniCafe platform enforces strict enterprise business rules around financial ledger consistency, contactless access control, wallet transactions, and multi-tenant scoping. The test suite guarantees:

1. **Zero Financial Discrepancies:** Wallet points can never be updated without an atomic, immutable ledger entry.
2. **Recharge Idempotency:** Duplicate payment webhooks or double-clicks never grant double points or double hours.
3. **Hours Reset vs. Points Carry-Forward:** Recharges reset usage hours back to 150h while carrying forward existing unspent points.
4. **Zero-Hours Access Enforcement:** A customer with 0 remaining hours is blocked from entering any cafe, but is **always permitted to exit** an ongoing session safely.
5. **Multi-Tenant Boundary Integrity:** Supervisors and Managers can only access cafes and orders within their assigned scope.

---

## 🧪 Automated Test Suite (`tests/run-tests.ts`)

UniCafe includes a standalone end-to-end integration test runner powered by `tsx` and an isolated, in-memory MongoDB Replica Set (`mongodb-memory-server`).

### Execution Command

```bash
npx tsx tests/run-tests.ts
```

### Key Highlights of the Test Runner:
- **Zero External Dependencies:** Spins up an isolated, temporary MongoDB replica set with WiredTiger storage in memory.
- **Full Transaction Support:** Tests actual MongoDB multi-document ACID transactions (`session.withTransaction`).
- **Clean Teardown:** Drops all collections and stops the replica set upon completion, leaving no artifacts.

---

## 📋 Test Suite Requirement Coverage Map

The suite executes 24 automated assertions covering all 8 business verification groups:

| Test Group | Business Rule Verified | Assertion Outcome |
| :--- | :--- | :--- |
| **Test 1: Auth & Registration** | - Customer registration creates User & CustomerProfile<br>- Automatically generates unique `customerCode` (`UCxxxx`)<br>- Rejects duplicate email registration<br>- Authenticates via bcrypt hash verification | ✅ PASSED |
| **Test 2: Membership Purchase** | - Verifies initial ₹5,000 payment<br>- Sets membership status to `ACTIVE`<br>- Credits 5,000 points to wallet<br>- Allocates 150 hours (9,000 minutes)<br>- Writes double-entry PointsLedger document | ✅ PASSED |
| **Test 3: Webhook Idempotency** | - Replays duplicate payment confirmation webhook<br>- Verifies replay is safely detected and ignored<br>- Confirms wallet points remain exactly 5,000 | ✅ PASSED |
| **Test 4: Points Carry-Forward** | - Debits 1,000 points for food order (balance = 4,000)<br>- Consumes 30 hours (remaining = 120h)<br>- Applies second ₹5,000 recharge<br>- Confirms points carried forward (4,000 + 5,000 = 9,000)<br>- Confirms hours reset back to full 150h | ✅ PASSED |
| **Test 5: Razorpay Signatures** | - Verifies HMAC-SHA256 signature calculation with secret<br>- Accepts valid cryptographic signatures<br>- Rejects forged or tampered signatures | ✅ PASSED |
| **Test 6: NFC/RFID Tap Protocol** | - Blocks customer with 0 remaining hours from cafe entry<br>- Permits entry tap for customer with active hours<br>- Blocks duplicate entry tap while already inside cafe<br>- **Safety Exit Rule:** Allows exit tap even when hours reach 0 | ✅ PASSED |
| **Test 7: Atomic Ordering & Refund** | - Rejects order when points balance is insufficient<br>- Places valid order with atomic points deduction<br>- Updates wallet balance and order status<br>- Cancelling order writes REFUND ledger and returns points | ✅ PASSED |
| **Test 8: Cafe Scoping & RBAC** | - Supervisor has full access to assigned cafe<br>- Supervisor is **blocked** from accessing unassigned cafe | ✅ PASSED |

---

## 📊 Sample Test Run Output

```text
=======================================================
  UNICAFE MANDATORY BUSINESS LOGIC VERIFICATION SUITE
=======================================================

1. Starting isolated MongoDB Memory Replica Set...

[Test 1] Registration, Email Uniqueness, Hashing & Login:
  ✅ PASSED: Customer registered successfully
  ✅ PASSED: Generated customerCode (UCxxxxxx)
  ✅ PASSED: Duplicate email registration rejected
  ✅ PASSED: Authenticated successfully with bcrypt verification

[Test 2] Membership Recharge: ₹5,000 -> 5,000 pts + 150h:
  ✅ PASSED: Membership status set to ACTIVE
  ✅ PASSED: 5,000 Points credited to wallet
  ✅ PASSED: Hours set to 150 (9,000 mins)

[Test 3] Duplicate Webhook / Repeated Payment Callbacks:
  ✅ PASSED: Repeated payment callback safely detected and ignored
  ✅ PASSED: Points balance unchanged (no duplicate crediting)

[Test 4] Points Carry-Forward & Hours Reset on Recharge:
  ✅ PASSED: Points carried forward (4,000 + 5,000 = 9,000 pts)
  ✅ PASSED: Hours reset back to full 150 hours

[Test 5] Razorpay Payment Signature Verification:
  ✅ PASSED: Valid signature successfully verified
  ✅ PASSED: Forged signature rejected

[Test 6] NFC/RFID Entry, Zero-Hours Block & Safety Exit:
  ✅ PASSED: Customer with 0 hours blocked from entry
  ✅ PASSED: Customer with active hours checked in successfully
  ✅ PASSED: Duplicate entry tap blocked for already active session
  ✅ PASSED: Exit successfully permitted even when hours exhausted during session

[Test 7] Orders, Atomic Points Deduction & Cancellation Refund:
  ✅ PASSED: Order rejected when points balance is insufficient
  ✅ PASSED: Order created for 700 points
  ✅ PASSED: Points debited from wallet (1000 - 700 = 300)
  ✅ PASSED: All 700 points refunded back to wallet (300 + 700 = 1000)
  ✅ PASSED: Immutable refund ledger record written with order link

[Test 8] Role-based Cafe Scoping & Restrictions:
  ✅ PASSED: Supervisor has access to assigned cafe
  ✅ PASSED: Supervisor access BLOCKED for unassigned cafe

=======================================================
  ALL 24 MANDATORY BUSINESS LOGIC TESTS PASSED!
=======================================================
```

---

## 🔍 Continuous Integration & Pre-Commit Checks

Before merging code or deploying to production, run the complete verification pipeline:

```bash
# 1. Typecheck TypeScript codebase
npm run typecheck

# 2. Run automated business test suite
npx tsx tests/run-tests.ts

# 3. Verify Next.js production build
npm run build
```

