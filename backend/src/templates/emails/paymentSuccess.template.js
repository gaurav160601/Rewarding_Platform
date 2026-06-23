function paymentSuccessTemplate({ orderId, amount, earnedPoints }) {
  return {
    subject: "Payment Successful",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Payment Successful</h2>
        <p>Your payment for order #${orderId} was successful.</p>
        <p><strong>Amount Paid:</strong> ₹${amount}</p>
        ${earnedPoints > 0 ? `<p><strong>Points Earned:</strong> ${earnedPoints}</p>` : ""}
        <p>Thank you for your purchase.</p>
      </div>
    `
  };
}

module.exports = paymentSuccessTemplate;
