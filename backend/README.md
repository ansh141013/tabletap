# TableTap Backend API Reference

This backend is built on **Supabase** (PostgreSQL + Auth + Realtime).

## 1. Authentication
**Handled by:** Supabase Auth
- **Sign Up / Sign In:**
  - Email/Password
  - Google OAuth
  - Phone OTP
- **Behavior:**
  - Automatically creates a user profile in `public.users` via database trigger (`handle_new_user`).

## 2. Database API (Row Level Security Enforced)
Use the Supabase Client to interact with these tables.

### User Profile
- **Fetch Profile:** `SELECT * FROM users WHERE id = auth.uid()`
- **Update Profile:** Call RPC `update_user_onboarding` or `UPDATE users` directly.

### Restaurants & Tables
- **Fetch Restaurant Data:** `SELECT * FROM restaurants WHERE slug = :slug`
- **Fetch Tables:** `SELECT * FROM tables WHERE restaurant_id = :id`
- **Public Access:** Readable by anyone (valid URL/QR code required).

### Menu
- **Fetch Menu:** `SELECT * FROM menu_items WHERE restaurant_id = :id AND is_available = true`
- **Public Access:** Readable by anyone.

### Orders
- **Create Order:**
  - **Method:** `RPC (Remote Procedure Call)`
  - **Function:** `create_order`
  - **Params:** `restaurant_id`, `table_id`, `total_amount`
  - **Returns:** `order_id` (UUID)
- **Fetch My Orders:** `SELECT * FROM orders WHERE user_id = auth.uid()`
- **Update Order Status:**
  - **Who:** Restaurant Owners only.
  - **Method:** `UPDATE orders SET status = :status WHERE id = :id`

## 3. Realtime API
**Handled by:** Supabase Realtime Subscriptions
- **Channel:** `db-changes`
- **Event:** `INSERT`, `UPDATE` on `public.orders`
- **Usage:**
  - **Kitchen:** Listen for new orders (`INSERT` on orders where `restaurant_id` matches).
  - **Customer:** Listen for status updates (`UPDATE` on orders where `id` matches their order).

## 4. Functions (RPCs)
| Function Name | Params | Description |
|Data Type| | |
|---|---|---|
| `create_order` | `restaurant_id`, `table_id`, `total` | Securely creates an order, validates auth & duplicates. |
| `update_user_onboarding` | `full_name`, `theme`, `preferences` | Securely updates user profile. |

## 5. Verification Status
✅ **Authentication**: Configured for Email, Google, Phone (Automatic profile creation).
✅ **Security**: RLS enabled on all tables. No public write access.
✅ **Realtime**: `orders` and `order_items` configured for Live Kitchen Display.
✅ **Integrity**: Cross-restaurant data access blocked via database triggers.

# 🚀 STATUS: READY FOR FRONTEND INTEGRATION

