function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(productId, productName, price) {
    const cart = getCart();
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    alert('Product added to cart!');
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    displayCart(); // Refresh display
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = parseInt(newQuantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart(cart);
            displayCart();
        }
    }
}

// Calculate total price
function calculateTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart count in navigation
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Display cart on cart.html page
function displayCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        container.innerHTML = 'Your cart is empty';
        return;
    }
    
    let html = '';
    cart.forEach(item => {
        html += `
            
                ${item.name}
                Price: ₦${item.price.toFixed(2)}
                
                Subtotal: ₦${(item.price * item.quantity).toFixed(2)}
                Remove
            
        `;
    });
    
    html += `
        
            Total: ₦${calculateTotal().toFixed(2)}
            
                Proceed to Checkout
            
        
    `;
    
    container.innerHTML = html;
}

// Initialize
updateCartCount();