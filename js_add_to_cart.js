// REPLACE the entire content of js_add_to_cart.js with this:
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSummaryDiv = document.getElementById('cart-summary');
const cartEmptyView = document.getElementById('cart-empty-view');
const doorDeliverySwitch = document.getElementById('door-delivery-switch');
const cartSubtotalSpan = document.getElementById('cart-subtotal');
const cartPlatformChargeSpan = document.getElementById('cart-platform-charge');
const cartGstSpan = document.getElementById('cart-gst');
const cartDeliveryFeeSpan = document.getElementById('cart-delivery-fee');
const cartGrandTotalSpan = document.getElementById('cart-grand-total');
const gstRow = document.getElementById('gst-row');
const deliveryFeeRow = document.getElementById('delivery-fee-row');
const placeOrderButton = document.getElementById('place-order-button');
const disclaimerPopup = document.getElementById('disclaimer-popup');
const disclaimerOkButton = document.getElementById('disclaimer-ok-button');

function getCart() {
    return JSON.parse(localStorage.getItem('streetrCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('streetrCart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function addToCart(item) {
    let cart = getCart();
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    saveCart(cart);
    alert(`${item.name} added to cart!`);
    displayCartItems();
}

function updateCartQuantity(itemId, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(cartItem => cartItem.id === itemId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    saveCart(cart);
    displayCartItems();
}

function calculateDeliveryFee(subtotal) {
    if (subtotal <= 100) return 10;
    if (subtotal <= 200) return 15;
    if (subtotal <= 500) return 20;
    if (subtotal <= 1000) return 25;
    return 30;
}

function updateBillDetails() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const platformCharge = subtotal * 0.05; // 5% platform charge
    let grandTotal = 0;

    cartSubtotalSpan.textContent = `₹${subtotal.toFixed(2)}`;
    cartPlatformChargeSpan.textContent = `₹${platformCharge.toFixed(2)}`;

    if (doorDeliverySwitch.checked) {
        const gst = subtotal * 0.10;
        const deliveryFee = calculateDeliveryFee(subtotal);
        grandTotal = subtotal + platformCharge + gst + deliveryFee;
        cartGstSpan.textContent = `₹${gst.toFixed(2)}`;
        cartDeliveryFeeSpan.textContent = `₹${deliveryFee.toFixed(2)}`;
        gstRow.classList.remove('hidden');
        deliveryFeeRow.classList.remove('hidden');
    } else {
        grandTotal = subtotal + platformCharge;
        gstRow.classList.add('hidden');
        deliveryFeeRow.classList.add('hidden');
    }
    cartGrandTotalSpan.textContent = `₹${grandTotal.toFixed(2)}`;
    window.paymentAmount = grandTotal;
}

function displayCartItems() {
    const cart = getCart();
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartSummaryDiv.classList.add('hidden');
        cartEmptyView.classList.remove('hidden');
        placeOrderButton.classList.add('hidden');
        return;
    }

    cartSummaryDiv.classList.remove('hidden');
    cartEmptyView.classList.add('hidden');
    placeOrderButton.classList.remove('hidden');

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item-card';
        itemElement.innerHTML = `
            <img src="${item.image_url || 'assets/placeholder-food.png'}" alt="${item.name}">
            <div class="cart-item-details">
                <h5>${item.name}</h5>
                <p>Price: ₹${item.price.toFixed(2)}</p>
                <div class="cart-item-footer">
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <span class="cart-item-subtotal">₹${itemSubtotal.toFixed(2)}</span>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    updateBillDetails();

    cartItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.id;
            const change = parseInt(btn.dataset.change);
            updateCartQuantity(itemId, change);
        });
    });
}

doorDeliverySwitch?.addEventListener('change', updateBillDetails);
placeOrderButton?.addEventListener('click', () => {
    disclaimerPopup.classList.remove('hidden');
});
disclaimerOkButton?.addEventListener('click', () => {
    disclaimerPopup.classList.add('hidden');
    localStorage.setItem('deliveryChoice', doorDeliverySwitch.checked);
    navigateToPage('payment-page');
});
