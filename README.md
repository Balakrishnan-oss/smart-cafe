# ☕ Smart Café — Full Stack Web Application

A modern, responsive café ordering and management platform built for **Eswar, Bala & Co (Salem Flagship)**. Powered by React, Supabase PostgreSQL, Edge Functions, and database Row Level Security (RLS).

---

## 🌟 Key Features

- **Digital Menu & Filters**: Real-time menu items retrieved from Supabase PostgreSQL with category filtering and instant search.
- **Interactive Cart & Checkout**: Live cart quantity controls, tax calculations, and demo checkout options (UPI, Card, Cash on Delivery).
- **Secure Atomic Orders**: Order processing powered by Supabase Edge Functions (`create-order`) with server-side price validation and transactional database integrity.
- **Customer Authentication**: Secure signup, login, session persistence, and profile triggers via Supabase Auth.
- **Role-Based Access Control (RBAC)**:
  - **Customers**: View own token queue, order history, and personal profile.
  - **Admins (Staff Hub)**: Full Live Kitchen Order Ticket (KOT) queue management and live menu price/availability manager.
- **Database Row Level Security (RLS)**: Enforced via PostgreSQL policies with a `SECURITY DEFINER` `public.is_admin()` verification function to prevent client-side security tampering.

---

## 🏗️ Project Architecture

```text
smart-cafe/
├── public/
│   ├── images/
│   └── vendor/          # React, ReactDOM & Supabase UMD bundles
├── src/
│   ├── components/
│   │   ├── Navbar.jsx   # Role badge, auth dropdown & navigation
│   │   ├── MenuCard.jsx # Dish cards with pricing and add-to-cart
│   │   └── Cart.jsx     # Slide-out cart with subtotal calculation
│   ├── pages/
│   │   ├── Home.jsx     # Hero banner and café specials
│   │   ├── Menu.jsx     # Database-backed menu catalog
│   │   ├── Checkout.jsx # Order placement with Edge Function integration
│   │   ├── Orders.jsx   # Live KOT queue (Admin) & Customer orders
│   │   ├── Login.jsx    # Supabase email/password login + 1-click demos
│   │   └── Register.jsx # Customer signup with metadata trigger
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── App.jsx          # Route guards, RBAC navigation & session handlers
│   ├── bundle.js        # Active compiled browser application
│   └── index.css        # Salem Café styling palette
├── supabase/
│   ├── functions/
│   │   └── create-order/index.ts
│   └── migrations/
│       ├── 20261105_create_order_atomic.sql
│       └── 20261105_role_based_access_control.sql
├── dev-server.js
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Run Local Development Server
```bash
./rundev
```
Or with node:
```bash
node dev-server.js
```
The application will be live at:
**`http://localhost:3000/`**

### 2. Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://zzbshemwksvmmpdxudyd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

---

## 🛡️ Role-Based Access Control Testing Accounts

- **Customer Demo**:
  - Email: `karthik.salemcafe@gmail.com`
  - Password: `SalemKaapi@2025!`
  - Role: `customer` (Personal orders and live token tracking)

- **Admin Staff Demo**:
  - Email: `admin.salemcafe@gmail.com`
  - Password: `AdminSalemKaapi@2025!`
  - Role: `admin` (Live KOT queue management and Menu & Price Manager)
# smart-cafe
# smart-cafe
