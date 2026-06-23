const gql =
  require("graphql-tag");

const OrderType = gql`
  type OrderItem {
    id: Int
    order_id: Int
    product_id: Int
    product_name: String
    product_price: Float
    quantity: Int
    subtotal: Float
  }

  type Order {
    id: Int
    user_id: Int
    total_amount: Float
    status: String
    points_redeemed: Int
    discount_amount: Float
    payment_expires_at: String
    paid_at: String
    processed_at: String
    shipped_at: String
    delivered_at: String
    cancelled_at: String
    created_at: String
    updated_at: String
    items: [OrderItem]
  }
`;

module.exports = OrderType;
