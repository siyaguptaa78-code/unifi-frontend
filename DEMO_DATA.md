# UniCafe — Demo Accounts & Seed Data Guide

This document describes the pre-configured accounts, cafe locations, customer profiles, orders, and data workflows provided in the UniCafe demo dataset.

---

## 👥 Demo User Credentials

The database is pre-seeded with 6 role-based accounts:

| Role | Name | Email | Password | Assigned Scope | Default Landing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Vikram Malhotra | `admin@unicafe.demo` | `Admin@123` | Entire Network | `/admin/dashboard` |
| **Area Supervisor**| Rajesh Nair | `supervisor@unicafe.demo` | `Demo@123` | Bengaluru Region (3 Cafes) | `/supervisor/dashboard` |
| **Franchise Owner**| Priya Sundaram | `owner@unicafe.demo` | `Demo@123` | Indiranagar & Koramangala | `/franchise/dashboard` |
| **Cafe Manager** | Ananya Sharma | `manager@unicafe.demo` | `Demo@123` | Indiranagar Cafe | `/manager/dashboard` |
| **Cafe Staff** | Rahul Verma | `staff@unicafe.demo` | `Demo@123` | Indiranagar Cafe | `/staff/scan-card` |
| **Customer** | Rohan Verma | `customer@unicafe.demo` | `Demo@123` | Personal Wallet & Card | `/customer/dashboard` |

---

## 📍 Seeded Cafe Locations

Five cafes across India's premier tech hubs are ready for operations:

| Cafe Name | Code | City | Address | Supervisor | Manager |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UniCafe Indiranagar** | `UC-BLR-01` | Bengaluru | 100ft Road, HAL 2nd Stage | Rajesh Nair | Ananya Sharma |
| **UniCafe Koramangala** | `UC-BLR-02` | Bengaluru | 80ft Road, 4th Block | Rajesh Nair | Seeded Manager |
| **UniCafe Whitefield** | `UC-BLR-03` | Bengaluru | ITPL Main Rd, EPIP Zone | Rajesh Nair | Seeded Manager |
| **UniCafe Bandra** | `UC-MUM-01` | Mumbai | Linking Road, Bandra West | Unassigned | Seeded Manager |
| **UniCafe CyberCity** | `UC-DEL-01` | Gurugram | DLF Phase 2, CyberCity | Unassigned | Seeded Manager |

---

## 💳 Seeded Customer Profiles & Cards

The primary demo customer (`customer@unicafe.demo`) has:
- **Customer Code:** `UC1001`
- **Initial Recharge:** ₹5,000 paid.
- **Starting Points:** 5,000 points.
- **Active Smart Card:**
  - Card Number: `UCM-2026-1001`
  - NFC/RFID UID: `NFC-IND-001`
  - Card Type: `PHYSICAL_NFC`
  - Status: `ACTIVE`

### Additional Demo Smart Cards for Staff Scanner Testing:
You can test the interactive NFC/RFID simulator on `/staff/scan-card` using these pre-seeded UIDs:

| Card UID | Customer Name | Status | Hours Left | Points Left | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NFC-IND-001` | Rohan Verma | `ACTIVE` | 135 hrs | 4,650 pts | Primary demo customer |
| `NFC-KOR-002` | Aditi Rao | `ACTIVE` | 148 hrs | 4,200 pts | Ready for entry tap |
| `NFC-WHI-003` | Kunal Shah | `ACTIVE` | 0 hrs | 1,800 pts | **Hours exhausted** — tests zero-hours entry block |
| `NFC-MUM-004` | Sneha Patel | `ACTIVE` | 89 hrs | 3,100 pts | Currently inside cafe (tests exit tap) |
| `NFC-DEL-005` | Arjun Kapoor | `BLOCKED`| 120 hrs | 5,000 pts | **Blocked card** — tests security rejection |

---

## 🍽️ Seeded Menu Catalog (42 Items)

Items are categorized with realistic points pricing (1 pt = ₹1 INR):

### 1. Espresso & Classics
- Espresso Solo (150 pts)
- Americano Reserve (180 pts)
- Cafe Latte (220 pts)
- Cappuccino Silk (220 pts)
- Flat White Australian (240 pts)
- Spanish Latte (280 pts)
- Mocha Supreme (260 pts)

### 2. Manual Brews & Cold Coffee
- Cold Brew Reserve (260 pts)
- Nitro Cold Brew (320 pts)
- Pour Over Chemex (280 pts)
- Aeropress Single Origin (260 pts)
- Vietnamese Iced Coffee (250 pts)
- Iced Caramel Macchiato (290 pts)
- Affogato al Caffe (240 pts)

### 3. Artisan Sandwiches & Sourdough
- Pesto Paneer Ciabatta (320 pts)
- Smoked Chicken Bagel (360 pts)
- Truffle Mushroom Toast (340 pts)
- Sourdough Grilled Cheese (290 pts)
- Avocado Sourdough Tartine (380 pts)
- Hummus & Roasted Veg Wrap (280 pts)
- Peri Peri Chicken Panini (350 pts)

### 4. French Pastries & Bakery
- Butter Croissant (180 pts)
- Almond Frangipane Croissant (240 pts)
- Pain au Chocolat (220 pts)
- Cinnamon Cruffin (210 pts)
- Blueberry Cream Danish (250 pts)
- Banana Walnut Bread (190 pts)
- Sourdough Garlic Knots (160 pts)

### 5. Healthy Bowls & Superfoods
- Acai Berry Smoothie Bowl (390 pts)
- Quinoa Greek Salad Bowl (340 pts)
- Roasted Chickpea Protein Bowl (320 pts)
- Chia Seed Coconut Parfait (260 pts)
- Grilled Teriyaki Tofu Bowl (360 pts)
- Mediterranean Falafel Bowl (340 pts)

### 6. Signature Desserts & Teas
- New York Baked Cheesecake (290 pts)
- Belgian Chocolate Fondant (320 pts)
- Classic Italian Tiramisu (310 pts)
- Matcha Green Tea Latte (280 pts)
- Masala Chai Artisan Pot (150 pts)
- Hibiscus Mint Iced Tea (210 pts)
- Peach Jasmine Sparkler (230 pts)

---

## 🔄 Resetting the Demo Data

To restore the demo database back to its pristine default state at any time:

```bash
# Connects to MongoDB, clears all collections, and repopulates the full dataset:
npm run seed:reset
```

