const PAYSTACK_PUBLIC_KEY = 'pk_test_your_public_key_here';

async function initiatePaystackPayment() {
    // Check if user is logged in
    const user = await checkAuth();
    if (!user) {
        alert('Please login to continue');
        window.location.href = 'login.html';
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const totalAmount = calculateTotal();
    
    // Paystack amount is in kobo (multiply by 100)
    const amountInKobo = totalAmount * 100;

    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: amountInKobo,
        currency: 'NGN',
        ref: 'ORD_' + Math.floor((Math.random() * 1000000000) + 1), // Generate unique reference
        
        callback: function(response) {
            // Payment successful
            console.log('Payment successful! Reference: ' + response.reference);
            saveOrder(response.reference, totalAmount, 'paid');
        },
        
        onClose: function() {
            alert('Payment window closed.');
        }
    });

    handler.openIframe();
}


async function saveOrder(paymentReference, totalAmount, status) {
    const user = await checkAuth();
    const cart = getCart();

    try {
        // 1. Create order record
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: user.id,
                total_amount: totalAmount,
                status: status,
                payment_reference: paymentReference
            }])
            .select();

        if (orderError) {
            console.error('Error creating order:', orderError);
            return;
        }

        const orderId = orderData[0].id;

        // 2. Create order items
        const orderItems = cart.map(item => ({
            order_id: orderId,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error saving order items:', itemsError);
            return;
        }

        // 3. Clear cart
        localStorage.removeItem('cart');
        updateCartCount();

        // 4. Redirect to success page
        alert('Order placed successfully!');
        window.location.href = 'orders.html';

    } catch (err) {
        console.error('Error saving order:', err);
        alert('There was an error processing your order');
    }
}