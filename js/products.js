// Get all products from database
async function getProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return data;
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}

async function displayProducts() {
    const products = await getProducts();
    const container = document.getElementById('products-container');
    
    container.innerHTML = ''; // Clear existing content

    products.forEach(product => {
        const productCard = `
            
                
                ${product.name}
                ${product.description}
                ₦${product.price.toFixed(2)}
                
                    Add to Cart
                
            
        `;
        container.innerHTML += productCard;
    });
}

// Call this when page loads
displayProducts();


async function addProduct(name, description, price, imageUrl, category, stock) {
    const { data, error } = await supabase
        .from('products')
        .insert([
            {
                name: name,
                description: description,
                price: price,
                image_url: imageUrl,
                category: category,
                stock_quantity: stock
            }
        ]);

    if (error) {
        console.error('Error adding product:', error);
    } else {
        console.log('Product added successfully!');
    }
}