function orderCancelledTemplate({ orderId }) {
  return {
    subject: "Order Cancelled",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Order Cancelled</h2>
        <p>Hello,</p>
        <p>Your order #${orderId} has been cancelled.</p>
      </div>
    `
  };
}

module.exports = orderCancelledTemplate;
