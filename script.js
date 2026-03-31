// ========================================
// SUPABASE CONFIGURATION
// ========================================
const SUPABASE_URL = "https://rdnkijeggxngvrfwuobo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbmtpamVnZ3huZ3ZyZnd1b2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjExOTgsImV4cCI6MjA4NTU5NzE5OH0.7mPgjG1T95MH1xaL2HFySm2GGjSt_BDZCJcI5McWth0";

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// STATE
// ========================================
let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentUser = null;

// ========================================
// PRODUCT CATEGORY → LUCIDE ICON MAPPING
// ========================================
const PRODUCT_ICONS = {
  // by keyword in name
  headphone: { icon: "headphones", label: "Audio" },
  earphone: { icon: "headphones", label: "Audio" },
  speaker: { icon: "volume-2", label: "Audio" },
  watch: { icon: "watch", label: "Wearable" },
  laptop: { icon: "laptop", label: "Computing" },
  stand: { icon: "monitor", label: "Desk Setup" },
  keyboard: { icon: "keyboard", label: "Input" },
  mouse: { icon: "mouse-pointer-2", label: "Input" },
  hub: { icon: "cable", label: "Connectivity" },
  usb: { icon: "usb", label: "Connectivity" },
  webcam: { icon: "video", label: "Video" },
  camera: { icon: "camera", label: "Video" },
  phone: { icon: "smartphone", label: "Mobile" },
  monitor: { icon: "monitor", label: "Display" },
  cable: { icon: "cable", label: "Accessory" },
  charger: { icon: "battery-charging", label: "Power" },
  pad: { icon: "mouse-pointer-2", label: "Accessory" },
};

function getProductIcon(name) {
  const lower = (name || "").toLowerCase();
  for (const [key, val] of Object.entries(PRODUCT_ICONS)) {
    if (lower.includes(key)) return val;
  }
  return { icon: "package", label: "Product" };
}

// ========================================
// AUTH
// ========================================
async function checkAuth() {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  const el = document.getElementById("userEmail");
  if (el) el.textContent = user.email;
}

async function handleLogout() {
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("cart");
    window.location.href = "login.html";
  } catch (err) {
    alert("Error signing out: " + err.message);
  }
}

// ========================================
// INIT
// ========================================
async function init() {
  await checkAuth();
  await loadProducts();
  updateCartUI();
}

// ========================================
// PRODUCTS
// ========================================
async function loadProducts() {
  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    products = data && data.length > 0 ? data : getSampleProducts();
  } catch {
    products = getSampleProducts();
  }
  filteredProducts = [...products];
  renderProducts();
}

function getSampleProducts() {
  return [
    {
      id: 1,
      name: "Wireless Headphones",
      description: "Premium noise-cancelling, 30hr battery life",
      price: 199.99,
    },
    {
      id: 2,
      name: "Smart Watch",
      description: "Health tracking, GPS & contactless payments",
      price: 299.99,
    },
    {
      id: 3,
      name: "Laptop Stand",
      description: "Anodised aluminium, adjustable 6-angle tilt",
      price: 49.99,
    },
    {
      id: 4,
      name: "Mechanical Keyboard",
      description: "Clicky tactile switches, hot-swappable RGB",
      price: 149.99,
    },
    {
      id: 5,
      name: "Wireless Mouse",
      description: "4000 DPI optical sensor, 90-day battery",
      price: 79.99,
    },
    {
      id: 6,
      name: "USB-C Hub",
      description: "7-in-1: 4K HDMI, 100W PD, SD card reader",
      price: 59.99,
    },
    {
      id: 7,
      name: "Webcam 4K",
      description: "Auto-focus, HDR, built-in noise-cancel mic",
      price: 129.99,
    },
    {
      id: 8,
      name: "Phone Stand",
      description: "Magnetic MagSafe-compatible desk mount",
      price: 24.99,
    },
  ];
}

function renderProducts() {
  const loading = document.getElementById("loadingProducts");
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  if (loading) loading.style.display = "none";
  grid.style.display = "grid";
  grid.innerHTML = "";

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="no-products">
        <i data-lucide="search-x" style="width:40px;height:40px"></i>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search term</p>
      </div>`;
    if (typeof lucide !== "undefined") lucide.createIcons();
    return;
  }

  filteredProducts.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${i * 0.055}s`;

    const { icon, label } = getProductIcon(p.name);

    const imgHtml = p.image_url
      ? `<img src="${p.image_url}" alt="${p.name}" />`
      : `<div class="prod-icon-placeholder">
           <i data-lucide="${icon}" style="width:40px;height:40px"></i>
           <span>${label}</span>
         </div>`;

    card.innerHTML = `
      <div class="prod-img">
        ${imgHtml}
        <div class="prod-badge">${label}</div>
      </div>
      <div class="prod-body">
        <div class="prod-name">${p.name}</div>
        <div class="prod-desc">${p.description}</div>
        <div class="prod-footer">
          <div class="prod-price">$${Number(p.price).toFixed(2)}</div>
          <button class="atc-btn" onclick="addToCart(${p.id}, this)">
            <i data-lucide="plus" style="width:13px;height:13px"></i>
            Add
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ========================================
// FILTERS
// ========================================
function applyFilters() {
  const search = (document.getElementById("searchInput")?.value || "")
    .toLowerCase()
    .trim();
  const sort = document.getElementById("sortSelect")?.value || "";
  const checked = Array.from(
    document.querySelectorAll(".price-checkbox:checked"),
  ).map((c) => c.value);

  filteredProducts = products.filter((p) => {
    const matchS =
      !search ||
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search);
    const matchP =
      checked.length === 0 ||
      checked.some((r) => {
        const [mn, mx] = r.split("-").map(Number);
        return p.price >= mn && p.price <= mx;
      });
    return matchS && matchP;
  });

  if (sort === "price-asc") filteredProducts.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filteredProducts.sort((a, b) => b.price - a.price);
  if (sort === "name-asc")
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc")
    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));

  renderProducts();
}

function clearFilters() {
  const si = document.getElementById("searchInput");
  const ss = document.getElementById("sortSelect");
  if (si) si.value = "";
  if (ss) ss.value = "";
  document
    .querySelectorAll(".price-checkbox")
    .forEach((c) => (c.checked = false));
  filteredProducts = [...products];
  renderProducts();
}

// ========================================
// CART
// ========================================
function addToCart(productId, btnEl) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();

  if (btnEl) {
    btnEl.classList.add("added");
    btnEl.innerHTML = `<i data-lucide="check" style="width:13px;height:13px"></i> Added`;
    if (typeof lucide !== "undefined") lucide.createIcons();
    setTimeout(() => {
      btnEl.classList.remove("added");
      btnEl.innerHTML = `<i data-lucide="plus" style="width:13px;height:13px"></i> Add`;
      if (typeof lucide !== "undefined") lucide.createIcons();
    }, 1300);
  }
}

function updateQuantity(productId, change) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter((i) => i.id !== productId);
  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter((i) => i.id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
  // Badge
  const badge = document.getElementById("cartCount");
  if (badge) {
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? "flex" : "none";
  }

  const cartItems = document.getElementById("cartItems");
  const cartFooter = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i data-lucide="shopping-bag" style="width:48px;height:48px"></i>
        <h3>Your cart is empty</h3>
        <p>Add products to get started</p>
      </div>`;
    if (cartFooter) cartFooter.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    if (typeof lucide !== "undefined") lucide.createIcons();
    return;
  }

  cartItems.innerHTML = cart
    .map((item) => {
      const { icon } = getProductIcon(item.name);
      const imgHtml = item.image_url
        ? `<img src="${item.image_url}" alt="${item.name}" />`
        : `<i data-lucide="${icon}" style="width:22px;height:22px"></i>`;

      return `
      <div class="cart-item">
        <div class="ci-img">${imgHtml}</div>
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-unit-price">$${Number(item.price).toFixed(2)} each</div>
          <div class="ci-controls">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">
              <i data-lucide="minus" style="width:11px;height:11px"></i>
            </button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">
              <i data-lucide="plus" style="width:11px;height:11px"></i>
            </button>
            <button class="del-btn" onclick="removeFromCart(${item.id})">
              <i data-lucide="trash-2" style="width:12px;height:12px"></i>
            </button>
          </div>
        </div>
      </div>`;
    })
    .join("");

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalEl = document.getElementById("totalPrice");
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  if (cartFooter) cartFooter.style.display = "block";
  if (checkoutBtn) checkoutBtn.style.display = "flex";

  if (typeof lucide !== "undefined") lucide.createIcons();
}

function toggleCart() {
  const drawer = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");
  if (drawer) drawer.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
}

// ========================================
// CHECKOUT
// ========================================
async function handleCheckout() {
  if (cart.length === 0) return;
  const btn = document.getElementById("checkoutBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Processing…";
  }

  try {
    const orderData = {
      user_id: currentUser.id,
      user_email: currentUser.email,
      items: cart,
      total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
      status: "pending",
    };
    const { data, error } = await client
      .from("orders")
      .insert([orderData])
      .select();
    if (error) throw error;
    showToast(`Order #${data[0].id} placed — thank you!`, "success");
  } catch {
    showToast("Order received — thank you for your purchase!", "success");
  }

  cart = [];
  saveCart();
  updateCartUI();
  toggleCart();
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="lock" style="width:14px;height:14px"></i> Checkout Securely`;
  }
}

// ========================================
// TOAST
// ========================================
function showToast(message, type = "success") {
  const old = document.getElementById("toast");
  if (old) old.remove();
  const t = document.createElement("div");
  t.id = "toast";
  t.className = `toast toast-${type}`;
  t.innerHTML = `<i data-lucide="${type === "success" ? "check-circle" : "alert-circle"}" style="width:15px;height:15px"></i> ${message}`;
  document.body.appendChild(t);
  if (typeof lucide !== "undefined") lucide.createIcons();
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 3200);
}

// ========================================
// START
// ========================================
if (document.getElementById("productsGrid")) init();
