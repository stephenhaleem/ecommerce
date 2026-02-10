# E-Commerce Website - Student Setup Guide

## 🎯 What You'll Learn

This project teaches the fundamental concepts of modern web development:
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: User sign-up and login
- **CRUD Operations**: Create, Read, Update, Delete data
- **State Management**: Shopping cart with localStorage
- **API Integration**: Connecting frontend to backend

---

## 📋 Prerequisites

1. A modern web browser (Chrome, Firefox, Safari, Edge)
2. A text editor (VS Code, Sublime Text, etc.)
3. A Supabase account (free tier is perfect)

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

### Step 4: Configure the Website

1. Open `ecommerce-store.html` in your text editor
2. Find these lines near the top of the `<script>` section:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-actual-anon-key-here';
   ```
4. Save the file

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

1. Open `ecommerce-store.html` in your web browser
2. The website should load with products displayed
3. Try these features:
   - **Browse products** - should load from Supabase
   - **Add to cart** - uses localStorage
   - **View cart** - click the Cart button
   - **Sign up** - create an account
   - **Sign in** - log in with your account
   - **Checkout** - requires login, saves to database

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

### Exercise 2: Add Product Images
Modify the products table to include image URLs instead of emoji icons.

### Exercise 3: Order History Page
Create a new page that shows a user's previous orders by querying the orders table.

### Exercise 4: Product Search
Add a search bar that filters products by name or description.

### Exercise 5: Admin Panel
Create an admin page where you can add/edit/delete products.

---

## 🔧 Troubleshooting

### Products Not Loading?
- Check browser console (F12) for errors
- Verify your Supabase URL and API key are correct
- Make sure you ran the SQL schema to create tables
- Check Supabase **Table Editor** to confirm products exist

### Can't Sign Up?
- Check Supabase **Authentication** settings
- Make sure email confirmation is disabled for development:
  - Go to Authentication → Settings
  - Disable "Enable email confirmations"

### Cart Not Working?
- The cart uses localStorage and works without Supabase
- Check browser console for errors
- Try clearing localStorage: `localStorage.clear()`

### Checkout Fails?
- You must be signed in to checkout
- Check the orders table was created in Supabase
- Check browser console for detailed error messages

---

## 📚 Code Structure Explained

### HTML Structure
```
- Header (navigation + cart button)
- Hero section (title and description)
- Authentication section (sign in/up forms)
- Products grid (dynamically loaded from Supabase)
- Cart modal (overlay showing cart items)
```

### JavaScript Functions

**Authentication:**
- `handleAuth()` - Sign in with email/password
- `handleSignUp()` - Create new account
- `handleSignOut()` - Log out user

**Products:**
- `loadProducts()` - Fetch products from Supabase
- `renderProducts()` - Display products on page

**Cart:**
- `addToCart()` - Add item to cart
- `updateQuantity()` - Increase/decrease quantity
- `removeFromCart()` - Remove item
- `updateCartUI()` - Refresh cart display

**Checkout:**
- `handleCheckout()` - Save order to database

### State Management
- `products` - Array of all products
- `cart` - Array of items in cart (saved to localStorage)
- `currentUser` - Currently logged-in user

---

## 🎨 Customization Ideas

1. **Change Colors**: Modify CSS variables in `:root`
2. **Add Categories**: Group products by category
3. **Add Reviews**: Let users rate and review products
4. **Add Wishlist**: Save favorite products
5. **Add Discount Codes**: Apply coupons at checkout
6. **Add Shipping**: Calculate shipping costs
7. **Add Payment**: Integrate Stripe for real payments

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
- [ ] Updated API credentials in HTML file
- [ ] Opened website in browser
- [ ] Products load correctly
- [ ] Can add items to cart
- [ ] Can sign up/sign in
- [ ] Can complete checkout
- [ ] Checked orders table for saved order

---

**Happy Learning! 🚀**

Remember: The best way to learn is by experimenting. Break things, fix them, and try new features!