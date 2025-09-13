// Corrected and complete js_payment.js file

document.addEventListener('DOMContentLoaded', () => {
    const paymentQrCodeContainer = document.getElementById('payment-qr-code');
    const paymentAmountDisplay = document.getElementById('payment-amount-display');
    const backToCartButton = document.getElementById('back-to-cart-button');

    // Function to get logged-in customer info dynamically
    function getCustomerInfo() {
        const user = JSON.parse(localStorage.getItem('streetrUser'));
        return user || {
            id: "CUST001",
            email: "customer@example.com",
            phone: "9999999999"
        };
    }

    // Setup payment page (UPI QR code fallback)
    function setupPaymentPage() {
        const amountToPay = window.paymentAmount || 0;
        if (amountToPay <= 0) {
            alert('Invalid amount. Returning to cart.');
            navigateToPage('main-app-view', 'cart-page-content');
            return;
        }
        paymentAmountDisplay.textContent = `₹${amountToPay.toFixed(2)}`;

        // UPI QR code fallback
        const upiId = getCustomerInfo().upiId || "your-upi-id@oksbi";
        const upiData = `upi://pay?pa=${upiId}&pn=StreetR&am=${amountToPay.toFixed(2)}&cu=INR`;
        paymentQrCodeContainer.innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiData)}"
                 alt="Scan to Pay">
        `;
    }

    // Create Cashfree order via Supabase Edge Function
    async function createCashfreeOrder(totalAmount) {
        const customer = getCustomerInfo();
        try {
            // ✅ Corrected URL to call the 'create-order-token' function
            const response = await fetch(
                "https://rnjvqxdrvplgilqzwnpl.supabase.co/functions/v1/quick-task",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cart: window.cartItems || [],
                        totalAmount: totalAmount,
                        customer: {
                            id: customer.id,
                            email: customer.email,
                            phone: customer.phone
                        }
                    })
                }
            );
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            console.log("Cashfree Order Created:", data);
            // Initialize Cashfree checkout
            if (window.Cashfree && window.Cashfree.checkout) {
                window.Cashfree.checkout({
                    paymentSessionId: data.payment_session_id,
                    redirectTarget: "_self",
                    onSuccess: async (event) => {
                        console.log("Payment Success:", event);
                        alert(`Payment Successful! Order ID: ${event.order.orderId}`);
                        await createOrder(); // finalize order in app
                    },
                    onFailure: (event) => {
                        console.error("Payment Failed:", event);
                        alert(`Payment Failed: ${event.message}`);
                    }
                });
            } else {
                alert("Cashfree SDK not loaded. Please refresh.");
            }
        } catch (err) {
            console.error("Cashfree Order Error:", err);
            alert("Payment initialization failed.");
        }
    }

    // Back button to return to cart page
    backToCartButton?.addEventListener('click', () => {
        navigateToPage('main-app-view', 'cart-page-content');
    });

    // Listen for page changes to setup payment page
    window.addEventListener('pageChanged', (e) => {
        if (e.detail.pageId === 'payment-page') {
            setupPaymentPage();
            // ✅ Attach the click listener to the button now that the page is loaded
            const cashfreeButton = document.getElementById('cashfree-button');
            cashfreeButton?.addEventListener('click', () => {
                const amountToPay = window.paymentAmount || 0;
                if (amountToPay <= 0) {
                    alert("Invalid amount.");
                    return;
                }
                createCashfreeOrder(amountToPay);
            });
        }
    });
});
