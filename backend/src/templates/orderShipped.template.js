function orderShippedTemplate({ orderId }) {
  return {
    subject: "Your Order Has Been Shipped",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Your Order Has Been Shipped</h2>
        <p>Hello,</p>
        <p>Your order #${orderId} has been shipped.</p>
        <p><strong>Status:</strong> SHIPPED</p>
        <p>Thank you for shopping with us.</p>
      </div>
    `
  };
}

module.exports = orderShippedTemplate;
