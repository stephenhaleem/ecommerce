async function displayOrders() {
    const user = await checkAuth();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                products (name, image_url)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }

    const container = document.getElementById('orders-container');
    
    if (orders.length === 0) {
        container.innerHTML = 'No orders yet';
        return;
    }

    let html = '';
    orders.forEach(order => {
        html += `
            
                Order #${order.id.substring(0, 8)}
                Date: ${new Date(order.created_at).toLocaleDateString()}
                Status: ${order.status}
                Total: ₦${order.total_amount.toFixed(2)}
                
                    ${order.order_items.map(item => `
                        
                            
                            ${item.products.name}
                            Qty: ${item.quantity}
                            ₦${item.price.toFixed(2)}
                        
                    `).join('')}
                
            
        `;
    });

    container.innerHTML = html;
}