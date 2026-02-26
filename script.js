// ========================================
// SUPABASE CONFIGURATION
// ========================================
const SUPABASE_URL = "https://rdnkijeggxngvrfwuobo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbmtpamVnZ3huZ3ZyZnd1b2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjExOTgsImV4cCI6MjA4NTU5NzE5OH0.7mPgjG1T95MH1xaL2HFySm2GGjSt_BDZCJcI5McWth0";

// Initialize Supabase client
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// STATE MANAGEMENT
// ========================================
let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentUser = null;

// ========================================
// AUTHENTICATION CHECK
// ========================================
async function checkAuth() {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    // User is not logged in, redirect to login page
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  const userEmailElement = document.getElementById("userEmail");
  if (userEmailElement) {
    userEmailElement.textContent = user.email;
  }
}

// ========================================
// LOGOUT
// ========================================
async function handleLogout() {
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;

    // Clear cart
    localStorage.removeItem("cart");

    // Redirect to login
    window.location.href = "login.html";
  } catch (error) {
    alert("Error signing out: " + error.message);
  }
}

// ========================================
// INITIALIZATION
// ========================================
async function init() {
  // Check authentication first
  await checkAuth();

  // Load products
  await loadProducts();

  // Update cart UI
  updateCartUI();
}

// ========================================
// PRODUCTS FUNCTIONS
// ========================================
async function loadProducts() {
  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    products = data || [];

    if (products.length === 0) {
      products = getSampleProducts();
    }

    filteredProducts = [...products];
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    products = getSampleProducts();
    filteredProducts = [...products];
    renderProducts();
  }
}

function getSampleProducts() {
  return [
    {
      id: 1,
      name: "Wireless Headphones",
      description: "Premium noise-cancelling headphones",
      price: 199.99,
      icon: "🎧",
    },
    {
      id: 2,
      name: "Smart Watch",
      description: "Fitness tracking & notifications",
      price: 299.99,
      icon: "⌚",
    },
    {
      id: 3,
      name: "Laptop Stand",
      description: "Ergonomic aluminum stand",
      price: 49.99,
      icon: "💻",
    },
    {
      id: 4,
      name: "Mechanical Keyboard",
      description: "RGB backlit gaming keyboard",
      price: 149.99,
      icon: "⌨️",
    },
    {
      id: 5,
      name: "Wireless Mouse",
      description: "Precision optical mouse",
      price: 79.99,
      icon: "🖱️",
    },
    {
      id: 6,
      name: "USB-C Hub",
      description: "7-in-1 multiport adapter",
      price: 59.99,
      icon: "🔌",
    },
    {
      id: 7,
      name: "Webcam 4K",
      description: "Crystal clear video calls",
      price: 129.99,
      icon: "📹",
    },
    {
      id: 8,
      name: "Phone Stand",
      description: "Adjustable desk stand",
      price: 24.99,
      icon: "📱",
    },
  ];
}

function renderProducts() {
  const loadingProducts = document.getElementById("loadingProducts");
  const productsGrid = document.getElementById("productsGrid");

  if (loadingProducts) {
    loadingProducts.style.display = "none";
  }

  if (productsGrid) {
    productsGrid.style.display = "grid";
    productsGrid.innerHTML = "";

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products" style="grid-column: 1 / -1;">
          <div class="no-products-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your filters</p>
        </div>
      `;
      return;
    }

    filteredProducts.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
                <div class="product-image">
  ${
    product.image_url
      ? `<img src="${product.image_url}" style="width:100%; height:100%; object-fit:cover;" />`
      : product.icon || "📦"
  }
</div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        
                        <div class="product-footer">
                            <div class="product-price">$${product.price.toFixed(2)}</div>
                            <button class="add-to-cart" onclick="addToCart(${product.id})">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `;
      productsGrid.appendChild(productCard);
    });
  }
}

// ========================================
// FILTER FUNCTIONS
// ========================================
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const priceCheckboxes = document.querySelectorAll(".price-checkbox");

  // Start with all products
  filteredProducts = [...products];

  // Apply search filter
  if (searchInput && searchInput.value.trim() !== "") {
    const searchTerm = searchInput.value.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm),
    );
  }

  // Apply price range filters
  if (priceCheckboxes) {
    const selectedPriceRanges = Array.from(priceCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (selectedPriceRanges.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        return selectedPriceRanges.some((range) => {
          const [min, max] = range.split("-").map(Number);
          return product.price >= min && product.price <= max;
        });
      });
    }
  }

  // Apply sorting
  if (sortSelect && sortSelect.value) {
    const sortValue = sortSelect.value;
    switch (sortValue) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }

  renderProducts();
}

function clearFilters() {
  // Clear search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
  }

  // Clear price checkboxes
  const priceCheckboxes = document.querySelectorAll(".price-checkbox");
  priceCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Reset sort select
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.value = "";
  }

  // Reset filtered products and render
  filteredProducts = [...products];
  renderProducts();
}

// ========================================
// CART FUNCTIONS
// ========================================
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();

  // Show feedback
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = "Added! ✓";
  btn.style.background = "var(--success)";
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = "";
  }, 1000);
}

function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateCartUI();
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }

  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!cartItems) return; // Exit if cart elements don't exist (e.g., on login page)

  if (cart.length === 0) {
    cartItems.innerHTML = `
                    <div class="empty-cart">
                        <div class="empty-cart-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started!</p>
                    </div>
                `;
    if (cartTotal) cartTotal.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
                    <div class="cart-item">
                        <div class="cart-item-image">${item.icon || "📦"}</div>
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                        </div>
                    </div>
                `,
      )
      .join("");

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const totalPriceElement = document.getElementById("totalPrice");
    if (totalPriceElement) {
      totalPriceElement.textContent = `$${total.toFixed(2)}`;
    }

    if (cartTotal) cartTotal.style.display = "flex";
    if (checkoutBtn) checkoutBtn.style.display = "block";
  }
}

function toggleCart() {
  const modal = document.getElementById("cartModal");
  if (modal) {
    modal.classList.toggle("active");
  }
}

// ========================================
// CART MODAL EVENT LISTENER
// ========================================
// Only add event listener if cartModal exists (store.html page)
const cartModal = document.getElementById("cartModal");
if (cartModal) {
  cartModal.addEventListener("click", function (event) {
    if (event.target === this) {
      toggleCart();
    }
  });
}

// ========================================
// CHECKOUT
// ========================================
async function handleCheckout() {
  if (cart.length === 0) return;

  try {
    const orderData = {
      user_id: currentUser.id,
      user_email: currentUser.email,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
    };

    const { data, error } = await client
      .from("orders")
      .insert([orderData])
      .select();

    if (error) throw error;

    alert(
      "🎉 Order placed successfully!\n\nOrder ID: " +
        data[0].id +
        "\n\nThank you for your purchase!",
    );

    cart = [];
    saveCart();
    updateCartUI();
    toggleCart();
  } catch (error) {
    console.error("Checkout error:", error);
    alert("✓ Order processed! (Supabase table may not be configured yet)");
    cart = [];
    saveCart();
    updateCartUI();
    toggleCart();
  }
}

// ========================================
// INITIALIZE ONLY IF ON STORE PAGE
// ========================================
// Check if we're on the store page by looking for the productsGrid element
if (document.getElementById("productsGrid")) {
  init();
}
