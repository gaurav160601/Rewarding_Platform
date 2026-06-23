import { Link } from "react-router-dom";

function PaymentCancel() {
  return (
    <div className="payment-status">
      <div className="card">
        <div className="icon-wrap fail">✕</div>
        <h1 className="page-title">Payment Cancelled</h1>
        <p>Payment was cancelled.</p>
        <p>You can return to your cart and try again.</p>
        <div className="actions">
          <Link to="/cart" className="btn btn-primary">
            Return to Cart
          </Link>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
