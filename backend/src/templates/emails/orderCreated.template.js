function orderCreatedTemplate({ orderId, totalAmount, redeemedPoints, finalAmount }) {
  return {
    subject: "Order Confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Order Confirmed</h2>
        <p>Your order #${orderId} has been placed successfully.</p>
        <p><strong>Order Total:</strong> ₹${totalAmount}</p>
        ${redeemedPoints > 0 ? `<p><strong>Points Redeemed:</strong> ${redeemedPoints}</p>` : ""}
        <p><strong>Final Amount:</strong> ₹${finalAmount}</p>
        <p>Thank you for shopping with us.</p>
      </div>
    `
  };
}

module.exports = orderCreatedTemplate;
