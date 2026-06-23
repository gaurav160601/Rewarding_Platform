import { Link } from "react-router-dom";

function PaymentSuccess() {
  return (
    <div className="payment-status">
      <div className="card">
        <div className="icon-wrap success">✓</div>
        <h1 className="page-title">Payment Successful</h1>
        <p>Your payment has been completed successfully.</p>
        <p>Your order has been placed and rewards will be credited automatically.</p>
        <div className="actions">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
