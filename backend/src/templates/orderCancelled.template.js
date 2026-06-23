function orderCancelledTemplate({ orderId, refundAmount, refundStatus, returnedPoints, reversedPoints }) {
  return {
    subject: "Order Cancelled",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Order Cancelled</h2>
        <p>Your order #${orderId} has been cancelled.</p>
        ${refundAmount ? `<p><strong>Refund Amount:</strong> ₹${refundAmount}</p>` : ""}
        ${refundStatus ? `<p><strong>Refund Status:</strong> ${refundStatus}</p>` : ""}
        ${returnedPoints ? `<p><strong>Points Returned:</strong> +${returnedPoints}</p>` : ""}
        ${reversedPoints ? `<p><strong>Points Reversed:</strong> -${reversedPoints}</p>` : ""}
      </div>
    `
  };
}

module.exports = orderCancelledTemplate;
