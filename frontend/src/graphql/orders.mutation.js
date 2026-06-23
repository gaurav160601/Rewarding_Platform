const CANCEL_ORDER = `
  mutation CancelOrder($orderId: Int!) {
    cancelOrder(orderId: $orderId) {
      success
      message
    }
  }
`;

export default CANCEL_ORDER;
