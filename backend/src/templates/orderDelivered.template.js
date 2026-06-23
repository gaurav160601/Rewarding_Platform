function orderDeliveredTemplate({ orderId }) {
  return {
    subject: "Order Delivered Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Order Delivered Successfully</h2>
        <p>Hello,</p>
        <p>Your order #${orderId} has been delivered.</p>
        <p>We hope you enjoy your purchase.</p>
      </div>
    `
  };
}

module.exports = orderDeliveredTemplate;
