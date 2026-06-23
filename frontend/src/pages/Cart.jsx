import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../components/Toast";

function Cart() {
  const toast = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cartRes, balanceRes] = await Promise.all([
        api.get("/cart"),
        api.get("/rewards/balance")
      ]);
      setCart(cartRes.data.data);
      setRewardBalance(balanceRes.data.data?.reward_points || 0);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load cart");
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      toast(error.response?.data?.message || "Failed to update quantity", "error");
    }
  };

  const MIN_PAYMENT = 50;
  const redeemInput = Number(redeemPoints) || 0;
  const maxRedeemable = Math.min(rewardBalance, Math.max(0, (cart?.total || 0) - MIN_PAYMENT));
  const discountAmount = redeemInput > maxRedeemable ? maxRedeemable : redeemInput;
  const finalTotal = (cart?.total || 0) - discountAmount;

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const orderResponse = await api.post("/orders/checkout", {
        redeemPoints: discountAmount
      });
      const { orderId, finalAmount } = orderResponse.data.data;

      if (finalAmount <= 0) {
        window.location.href = "/payment-success";
        return;
      }

      const sessionResponse = await api.post("/payments/create-session", { orderId });
      window.location.href = sessionResponse.data.data.checkoutUrl;
    } catch (error) {
      toast(error.response?.data?.message || "Checkout failed", "error");
      setCheckingOut(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      toast("Item removed from cart", "success");
      fetchCart();
    } catch (error) {
      toast(error.response?.data?.message || "Failed to remove item", "error");
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Cart</h1>
        <div className="cart-layout">
          <div className="cart-items">
            <div className="card">
              {[1, 2].map((i) => (
                <div key={i} className="cart-item">
                  <div className="cart-item-info" style={{ flex: 1 }}>
                    <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 18 }} />
                    <div className="skeleton-line skeleton-shimmer" style={{ width: "30%", height: 14, marginTop: 8 }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div className="skeleton-line skeleton-shimmer" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <div className="skeleton-line skeleton-shimmer" style={{ width: 24, height: 20 }} />
                    <div className="skeleton-line skeleton-shimmer" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <div className="skeleton-line skeleton-shimmer" style={{ width: 70, height: 32, borderRadius: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="cart-sidebar">
            <div className="card">
              <div className="skeleton-line skeleton-shimmer" style={{ width: "50%", height: 16, margin: "0 auto 16px" }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 34, margin: "0 auto 24px" }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: 48, borderRadius: 10 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Cart</h1>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div>
        <h1 className="page-title">Cart</h1>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <p>Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          <div className="card">
            {cart.items.map((item) => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <p>₹{item.price} x {item.quantity} = ₹{item.subtotal}</p>
                </div>

                <div className="cart-item-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    -
                  </button>

                  <span className="cart-qty">{item.quantity}</span>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-sidebar">
          <div className="balance-card">
            <p className="label">Reward Balance</p>
            <p className="amount">{rewardBalance}</p>
            <p className="sub">Points (1 Point = ₹1)</p>
          </div>

          {rewardBalance > 0 && cart.total > 0 && (
            <div className="card mb-16">
              <p style={{ fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>
                Redeem Points
              </p>
              <input
                type="number"
                min="0"
                max={maxRedeemable}
                placeholder={`Available: ${rewardBalance}`}
                value={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.value)}
              />
              <p className="text-muted mt-16" style={{ fontSize: "12px" }}>
                Available: {rewardBalance} points
              </p>
              {maxRedeemable < rewardBalance && (
                <p style={{ fontSize: "11px", color: "#f59e0b", marginTop: "4px" }}>
                  You must pay at least ₹{MIN_PAYMENT} after reward redemption.
                </p>
              )}
            </div>
          )}

          <div className="card">
            <div className="summary-row">
              <span>Order Total</span>
              <span>₹{cart.total}</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-row summary-discount">
                <span>Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="summary-total">
              <span>Final Total</span>
              <span>₹{finalTotal}</span>
            </div>

            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: "12px" }}
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? (
                <span>Processing...</span>
              ) : (
                <span>Checkout</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
