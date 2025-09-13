// REPLACE the entire content of js_order.js with this:
const ordersListDiv = document.getElementById('orders-list');

function generateOTP() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createOrder() {
    let cart = getCart();
    const isDelivery = localStorage.getItem('deliveryChoice') === 'true';

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    if (!window.currentUser || !window.userProfile) {
        alert("You must be logged in to place an order.");
        return;
    }
    showLoader();
    try {
        const sellerId = cart[0].seller_id;
        const totalAmount = window.paymentAmount;
        const deliveryOTP = generateOTP();
        const orderData = {
            seller_id: sellerId,
            customer_id: window.currentUser.id,
            customer_name: window.userProfile.full_name,
            customer_contact: window.userProfile.mobile_number,
            order_details: { items: cart },
            total_amount: totalAmount,
            status: 'Confirmed',
            delivery_type: isDelivery ? 'Door Delivery' : 'Self Pickup',
            otp: deliveryOTP
        };
        const { data, error } = await supabase.from('orders').insert(orderData).select().single();
        if (error) throw error;
        alert("Order placed successfully! Your Order ID is " + data.id.substring(0, 8));
        saveCart([]);
        localStorage.removeItem('deliveryChoice');
        navigateToPage('main-app-view', 'orders-page-content');
        loadOrders();
    } catch (error) {
        console.error("Error creating order:", error);
        alert(`Failed to place order: ${error.message}`);
    } finally {
        hideLoader();
    }
}

async function loadOrders() {
    if (!window.currentUser) return;
    showLoader();
    try {
        const { data, error } = await supabase.from('orders').select('*').eq('customer_id', window.currentUser.id).order('created_at', { ascending: false });
        if (error) throw error;
        renderOrders(data);
    } catch (error) {
        console.error("Error fetching orders:", error);
        ordersListDiv.innerHTML = '<p>Could not load your orders.</p>';
    } finally {
        hideLoader();
    }
}

function renderOrders(orders) {
    ordersListDiv.innerHTML = '';
    if (!orders || orders.length === 0) {
        ordersListDiv.innerHTML = "<p>You haven't placed any orders yet.</p>";
        return;
    }
    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item-card';
        let itemsHtml = order.order_details.items.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('');
        orderDiv.innerHTML = `
            <div class="order-card-header">
                <p><strong>Order ID:</strong> ${order.id.substring(0, 8)}</p>
                <p class="order-status ${order.status.toLowerCase()}">${order.status}</p>
            </div>
            <div class="order-card-body">
                <p><strong>Total:</strong> ₹${order.total_amount.toFixed(2)}</p>
                <ul class="order-items-list">${itemsHtml}</ul>
                <div class="order-otp-section">
                    <strong>Delivery OTP:</strong>
                    <span class="order-otp">${order.otp}</span>
                </div>
            </div>
            <div class="order-card-footer">
                 <small>Placed on: ${new Date(order.created_at).toLocaleString()}</small>
            </div>
        `;
        ordersListDiv.appendChild(orderDiv);
    });
}
