// js_payment.js
document.addEventListener('DOMContentLoaded', () => {
    const cashfreeButton = document.getElementById('cashfree-button');
    const paymentQrCodeContainer = document.getElementById('payment-qr-code');
    const paymentAmountDisplay = document.getElementById('payment-amount-display');
    const backToCartButton = document.getElementById('back-to-cart-button');

    function setupPaymentPage() {
        const amountToPay = window.paymentAmount || 0;
        if (amountToPay <= 0) {
            alert('Invalid amount. Returning to cart.');
            navigateToPage('main-app-view', 'cart-page-content');
            return;
        }
        paymentAmountDisplay.textContent = `₹${amountToPay.toFixed(2)}`;
        const upiData = `upi://pay?pa=your-upi-id@oksbi&pn=StreetR&am=${amountToPay.toFixed(2)}&cu=INR`;
        paymentQrCodeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiData)}" alt="Scan to Pay">`;
    }

    cashfreeButton?.addEventListener('click', async () => {
        const amountToPay = window.paymentAmount;
        if (!amountToPay || amountToPay <= 0) {
            alert('Invalid amount.');
            return;
        }

        try {
            // Step 1: Create Order Token via your backend
            const response = await fetch('/create-cashfree-order', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amountToPay })
            });

            const data = await response.json();
            if (!data || !data.orderToken) {
                alert("Failed to initiate payment.");
                return;
            }

            // Step 2: Configure Cashfree Checkout
            const checkoutOptions = {
                orderToken: data.orderToken,
                onSuccess: async function (event) {
                    console.log("Cashfree Payment Success:", event);
                    alert(`Payment Successful! Order ID: ${event.order.orderId}`);
                    await createOrder();
                },
                onFailure: function (event) {
                    console.error("Cashfree Payment Failed:", event);
                    alert("Payment Failed: " + event.message);
                },
                style: {
                    backgroundColor: "#ffffff",
                    color: "#FF7518",
                    fontFamily: "Arial"
                }
            };

            // Step 3: Open Cashfree Checkout
            if (window.Cashfree && window.Cashfree.checkout) {
                window.Cashfree.checkout(checkoutOptions);
            } else {
                alert("Cashfree SDK not loaded.");
            }

        } catch (err) {
            console.error("Cashfree Error:", err);
            alert("Payment failed. Please try again.");
        }
    });

    backToCartButton?.addEventListener('click', () => {
        navigateToPage('main-app-view', 'cart-page-content');
    });

    window.addEventListener('pageChanged', (e) => {
        if (e.detail.pageId === 'payment-page') {
            setupPaymentPage();
        }
    });
});
