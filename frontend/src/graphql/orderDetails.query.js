const ORDER_DETAILS_QUERY = `
  query Order($id: Int!) {
    order(id: $id) {
      id
      status
      total_amount
      points_redeemed
      discount_amount
      created_at
      paid_at
      processed_at
      shipped_at
      delivered_at
      cancelled_at
      items {
        id
        product_name
        quantity
        product_price
        subtotal
      }
    }
  }
`;

export default ORDER_DETAILS_QUERY;
