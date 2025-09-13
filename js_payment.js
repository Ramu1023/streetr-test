// Corrected portion of js_payment.js
async function createCashfreeOrder(totalAmount) {
    const customer = getCustomerInfo();
    try {
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
        // Continue with the rest of your code to initialize Cashfree checkout...
        // ...
    } catch (err) {
        console.error("Cashfree Order Error:", err);
        alert("Payment initialization failed.");
    }
}
