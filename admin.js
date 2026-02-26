async function checkAdminAccess() {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // OPTIONAL: If you have is_admin column in profiles
  const { data: profile } = await client
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profile && !profile.is_admin) {
    alert("Not authorized");
    window.location.href = "store.html";
  }
}

checkAdminAccess();
// ==========================
// LOAD PRODUCTS
// ==========================
async function loadAdminProducts() {
  const { data, error } = await client
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  renderAdminProducts(data);
}

loadAdminProducts();

// ==========================
// RENDER PRODUCTS
// ==========================
function renderAdminProducts(products) {
  const container = document.getElementById("admin-products");
  container.innerHTML = "";

  products.forEach((product) => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${product.image_url || ""}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p>$${Number(product.price).toFixed(2)}</p>

        <div class="product-actions">
          <button onclick="deleteProduct('${product.id}')">Delete</button>
          <button onclick="updateProduct('${product.id}')">Update</button>
        </div>
      </div>
    `;
  });
}

// ==========================
// ADD PRODUCT WITH IMAGE
// ==========================
async function addProduct() {
  const name = document.getElementById("name").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const imageFile = document.getElementById("image").files[0];

  if (!name || !description || !price || !imageFile) {
    alert("Fill all fields");
    return;
  }

  // Unique filename
  const fileName = `${Date.now()}-${imageFile.name}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await client.storage
    .from("product-images")
    .upload(fileName, imageFile);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  // Get public URL
  const { data } = client.storage.from("product-images").getPublicUrl(fileName);

  const image_url = data.publicUrl;

  // Insert into products table
  const { error: insertError } = await client
    .from("products")
    .insert([{ name, description, price, image_url }]);

  if (insertError) {
    alert(insertError.message);
    return;
  }

  loadAdminProducts();
}

// ==========================
// DELETE PRODUCT
// ==========================
async function deleteProduct(id) {
  const { error } = await client.from("products").delete().eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdminProducts();
}

// ==========================
// UPDATE PRODUCT
// ==========================
async function updateProduct(id) {
  const name = prompt("New name:");
  const description = prompt("New description:");
  const price = prompt("New price:");

  if (!name || !description || !price) return;

  const { error } = await client
    .from("products")
    .update({ name, description, price })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadAdminProducts();
}
