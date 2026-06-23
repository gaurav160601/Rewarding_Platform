function refundProcessedTemplate({ orderId, refundAmount, refundTransactionId }) {
  return {
    subject: "Refund Processed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Refund Processed</h2>
        <p>Your refund for order #${orderId} has been processed.</p>
        <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
        <p><strong>Transaction ID:</strong> ${refundTransactionId}</p>
        <p>Please allow 5-7 business days for the amount to reflect in your account.</p>
      </div>
    `
  };
}

module.exports = refundProcessedTemplate;
