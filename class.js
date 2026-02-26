const SUPABASE_URL = "https://rdnkijeggxngvrfwuobo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbmtpamVnZ3huZ3ZyZnd1b2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjExOTgsImV4cCI6MjA4NTU5NzE5OH0.7mPgjG1T95MH1xaL2HFySm2GGjSt_BDZCJcI5McWth0";

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentUser = null;
async function checkAuth() {
  const {
    data: { user },
  } = await client.auth.getUser();

  const isLoginPage = window.location.pathname.includes("login.html");

  if (!user && !isLoginPage) {
    window.location.href = "login.html";
    return;
  }
}

async function handleLogout() {
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("cart");
    window.location.href = "login.html";
  } catch (error) {
    alert("error signing out: " + error.message);
  }
}

//
async function init() {
  await checkAuth();

  await loadProducts();

  updateCartUI();
}

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
    console.error("error loading products:", error);
    products = getSampleProducts();
    filteredProducts = [...products];
    renderProducts();
  }
}

function getSampleProducts() {
  return [
    {
      id: 1,
      name: "wireless headphones",
      description: "premium noise cancelling headphones",
      price: 199.99,
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

init();
