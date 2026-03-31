async function checkAdminAccess() {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

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

function renderAdminProducts(products) {
  const container = document.getElementById("admin-products");
  container.innerHTML = "";

  products.forEach((product) => {
    container.innerHTML += `
      <div class="product-card">
        <div class="product-card-img">
          ${
            product.image_url
              ? `<img src="${product.image_url}" alt="${product.name}" />`
              : `<span style="font-size:2.5rem">${product.icon || ""}</span>`
          }
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="price">$${Number(product.price).toFixed(2)}</p>
        <div class="product-actions">
          <button class="btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
          <button class="btn-update" onclick="updateProduct('${product.id}')">Edit</button>
        </div>
      </div>`;
  });
}

async function addProduct() {
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = document.getElementById("price").value;
  const imageFile = document.getElementById("image").files[0];

  if (!name || !description || !price || !imageFile) {
    alert("Please fill all fields");
    return;
  }

  const fileName = `${Date.now()}-${imageFile.name}`;
  const { error: uploadError } = await client.storage
    .from("product-images")
    .upload(fileName, imageFile);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const { data } = client.storage.from("product-images").getPublicUrl(fileName);
  const image_url = data.publicUrl;

  const { error: insertError } = await client
    .from("products")
    .insert([{ name, description, price, image_url }]);

  if (insertError) {
    alert(insertError.message);
    return;
  }

  // Reset form
  document.getElementById("name").value = "";
  document.getElementById("description").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";

  loadAdminProducts();
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) {
    alert(error.message);
    return;
  }
  loadAdminProducts();
}

async function updateProduct(id) {
  const name = prompt("New name:");
  if (!name) return;
  const description = prompt("New description:");
  if (!description) return;
  const price = prompt("New price:");
  if (!price) return;

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
