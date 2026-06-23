const ORDERS_QUERY = `
  query Orders {
    orders {
      id
      status
      total_amount
      points_redeemed
      discount_amount
      created_at
    }
  }
`;

export default ORDERS_QUERY;
