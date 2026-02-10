# E-Commerce Website - Student Setup Guide

## 🎯 What You'll Learn

This project teaches the fundamental concepts of modern web development:
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Protected routes with user sign-up and login
- **CRUD Operations**: Create, Read, Update, Delete data
- **State Management**: Shopping cart with localStorage
- **API Integration**: Connecting frontend to backend
- **Session Management**: Keeping users logged in across pages

---

## 📋 Prerequisites

1. A modern web browser (Chrome, Firefox, Safari, Edge)
2. A text editor (VS Code, Sublime Text, etc.)
3. A Supabase account (free tier is perfect)

## 📄 Project Structure

This project consists of **two main pages**:

1. **login.html** - Authentication page where users sign up or sign in
2. **store.html** - The main store (protected, requires login to access)

**How it works:**
- Users must create an account or sign in before accessing the store
- If a user tries to visit `store.html` without being logged in, they're redirected to `login.html`
- After successful login, users are automatically redirected to the store
- Users stay logged in across browser sessions until they sign out

---

## 🚀 Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Click "New Project"
4. Fill in:
   - **Project name**: `ecommerce-store` (or any name you like)
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
5. Click "Create new project" (takes ~2 minutes)

### Step 2: Set Up Database Tables

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the SQL schema below
4. Click **Run** to create the tables

### Step 3: Get Your API Credentials

1. In Supabase, click **Settings** (gear icon) in the left sidebar
2. Click **API** under Project Settings
3. Copy two values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (under "Project API keys")

### Step 4: Configure Both Website Files

1. Open **both** `login.html` and `store.html` in your text editor
2. In each file, find these lines near the top of the `<script>` section:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with your actual values in **BOTH FILES**:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-actual-anon-key-here';
   ```
4. Save both files

### Step 5: Add Sample Products (Optional)

1. Go back to Supabase **SQL Editor**
2. Run this query to add sample products:

```sql
INSERT INTO products (name, description, price, icon) VALUES
  ('Wireless Headphones', 'Premium noise-cancelling headphones', 199.99, '🎧'),
  ('Smart Watch', 'Fitness tracking & notifications', 299.99, '⌚'),
  ('Laptop Stand', 'Ergonomic aluminum stand', 49.99, '💻'),
  ('Mechanical Keyboard', 'RGB backlit gaming keyboard', 149.99, '⌨️'),
  ('Wireless Mouse', 'Precision optical mouse', 79.99, '🖱️'),
  ('USB-C Hub', '7-in-1 multiport adapter', 59.99, '🔌');
```

### Step 6: Test Your Website

1. Open `login.html` in your web browser (this is your starting page)
2. **Create an account:**
   - Click the "Sign Up" tab
   - Enter your name, email, and password (minimum 6 characters)
   - Click "Create Account"
   - You should see a success message
3. **Sign in:**
   - Enter your email and password
   - Click "Sign In"
   - You should be automatically redirected to the store
4. **Try the store features:**
   - Browse products (loaded from Supabase or sample data)
   - Add items to cart
   - View your cart by clicking the Cart button
   - Adjust quantities or remove items
   - Click "Proceed to Checkout" to complete an order
5. **Test logout:**
   - Click "Sign Out" in the header
   - You should be redirected back to login.html
6. **Test protected route:**
   - Try to open `store.html` directly without logging in
   - You should be automatically redirected to `login.html`

---

## 📊 Database Schema

Here's the complete SQL to create your tables:

```sql
-- Enable Row Level Security (RLS) will be configured after
-- For learning purposes, we'll keep it simple initially

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  icon TEXT DEFAULT '📦',
  image_url TEXT,
  stock INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for better performance
-- =====================================================
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Important for production!
-- =====================================================
-- Enable RLS on tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read, only authenticated users can insert
CREATE POLICY "Anyone can view products" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert products" 
  ON products FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

---

## 🎓 Learning Exercises

### Exercise 1: Add More Products
Practice SQL INSERT statements by adding your own products to the database.

### Exercise 2: Create Order History Page
Create a third page (`orders.html`) that shows a user's previous orders:
- Fetch orders from Supabase filtered by user_id
- Display order date, items, and total
- Add a link to this page in the store header

### Exercise 3: Add Product Search
Add a search bar on the store page that filters products by name or description in real-time.

### Exercise 4: Improve Password Reset
Create a dedicated password reset page instead of using a browser prompt.

### Exercise 5: Add Admin Features
Create an admin page where authenticated admins can:
- Add new products
- Edit existing products
- Delete products
- View all orders from all users

---

## 🔧 Troubleshooting

### Can't Access the Store?
- Make sure you're starting at `login.html`, not `store.html`
- The store page is protected - you must sign in first
- If redirected to login when you should be logged in, check browser console

### Products Not Loading?
- Check browser console (F12) for errors
- Verify your Supabase URL and API key are correct in BOTH files
- Make sure you ran the SQL schema to create tables
- Check Supabase **Table Editor** to confirm products exist

### Can't Sign Up?
- Password must be at least 6 characters
- Check Supabase **Authentication** settings
- For development, disable email confirmation:
  - Go to Authentication → Settings
  - Disable "Enable email confirmations"

### Can't Sign In?
- Make sure you created an account first
- Check that email and password are correct
- Look in browser console for specific error messages
- Verify Supabase credentials are configured in login.html

### Stuck on Login Page After Signing In?
- Check that store.html has the correct Supabase credentials
- Check browser console for errors
- Make sure both files are in the same directory

### Cart Not Working?
- The cart uses localStorage and works offline
- Check browser console for errors
- Try clearing localStorage: `localStorage.clear()`
- Sign out and back in to reset

### Checkout Fails?
- Make sure the orders table was created in Supabase
- Check browser console for detailed error messages
- Verify you're signed in (user email should show in header)

---

## 📚 Code Structure Explained

### File Structure
```
login.html      → Authentication page (entry point)
store.html      → Main store page (protected, requires auth)
```

### login.html - Authentication Flow
```
- Sign In/Sign Up tabs
- Form validation
- Password visibility toggle
- Supabase authentication
- Auto-redirect to store on success
- Forgot password functionality
```

### store.html - Main Store
```
- Authentication check (redirects if not logged in)
- Header with user email and logout button
- Products grid (loaded from Supabase)
- Shopping cart (localStorage)
- Checkout functionality
```

### JavaScript Functions

**Authentication (login.html):**
- `checkAuth()` - Check if already logged in, redirect if yes
- `handleSignIn()` - Sign in with email/password
- `handleSignUp()` - Create new account
- `handleForgotPassword()` - Send password reset email
- `switchTab()` - Toggle between sign in/sign up forms

**Store (store.html):**
- `checkAuth()` - Verify user is logged in, redirect to login if not
- `handleLogout()` - Sign out and redirect to login
- `loadProducts()` - Fetch products from Supabase
- `renderProducts()` - Display products on page
- `addToCart()` - Add item to cart
- `updateQuantity()` - Increase/decrease quantity
- `removeFromCart()` - Remove item
- `updateCartUI()` - Refresh cart display
- `handleCheckout()` - Save order to database

### State Management
- `currentUser` - Currently logged-in user (checked on both pages)
- `products` - Array of all products (store.html)
- `cart` - Array of items in cart, saved to localStorage (store.html)

---

## 🎨 Customization Ideas

1. **Change Colors**: Modify CSS variables in `:root` (both files)
2. **Add Product Categories**: Filter products by category
3. **Add Product Images**: Use real image URLs instead of emojis
4. **User Profile Page**: Show user info and order history
5. **Add Reviews**: Let users rate and review products
6. **Add Wishlist**: Save favorite products
7. **Email Verification**: Require email confirmation before shopping
8. **Password Strength**: Add visual password strength indicator
9. **Remember Me**: Add "Remember Me" checkbox on login
10. **Social Login**: Add Google/GitHub sign-in options

---

## 🔐 Security Notes for Students

**Important:** This is a learning project. For production:

1. ✅ Use Row Level Security (RLS) - already configured in schema
2. ✅ Enable email verification for sign-ups
3. ✅ Use environment variables for API keys (not in code)
4. ✅ Add server-side validation
5. ✅ Use HTTPS only
6. ✅ Add rate limiting
7. ✅ Sanitize user inputs

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Fundamentals](https://javascript.info/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [localStorage Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 💡 Need Help?

Common student questions:

**Q: Do I need to install anything?**
A: No! Just a browser and text editor. Supabase is cloud-based.

**Q: Is this free?**
A: Yes! Supabase free tier is more than enough for learning.

**Q: Can I deploy this?**
A: Yes! You can host the HTML file on GitHub Pages, Netlify, or Vercel for free.

**Q: How do I reset everything?**
A: Delete all rows in Supabase tables, or drop and recreate the tables.

---

## ✅ Checklist

- [ ] Created Supabase project
- [ ] Ran SQL schema to create tables
- [ ] Added sample products
- [ ] Updated API credentials in login.html
- [ ] Updated API credentials in store.html
- [ ] Opened login.html in browser
- [ ] Successfully created an account
- [ ] Successfully signed in
- [ ] Redirected to store page after login
- [ ] Products load correctly on store page
- [ ] Can add items to cart
- [ ] Can view and modify cart
- [ ] Can complete checkout
- [ ] Checked orders table for saved order
- [ ] Successfully signed out
- [ ] Confirmed redirect to login after logout

---

**Happy Learning! 🚀**

Remember: The best way to learn is by experimenting. Break things, fix them, and try new features!