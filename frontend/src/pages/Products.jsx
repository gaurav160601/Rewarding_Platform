import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/Toast";
import { CardSkeleton } from "../components/Skeleton";

function Products() {
  const toast = useToast();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const addToCart = async (productId) => {
    try {
      await api.post("/cart/items", { productId, quantity: 1 });
      toast("Product added to cart", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Failed to add product", "error");
    }
  };

  const buyNow = async (productId) => {
    try {
      await api.post("/cart/items", { productId, quantity: 1 });
      const orderResponse = await api.post("/orders/checkout", {});
      const orderId = orderResponse.data.data.orderId;
      const sessionResponse = await api.post("/payments/create-session", { orderId });
      window.location.href = sessionResponse.data.data.checkoutUrl;
    } catch (error) {
      toast(error.response?.data?.message || "Checkout failed", "error");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/products");
        setProducts(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.key]);

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Products</h1>
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Products</h1>
        <div className="empty-state">
          <div className="icon">📦</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <h1 className="page-title">Products</h1>
        <div className="empty-state">
          <div className="icon">📦</div>
          <p>No products available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Products</h1>

      <div className="card-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card-image">🛍️</div>
            <div className="product-card-body">
              <h3>{product.name}</h3>
              <p className="description">{product.description}</p>
              <p className="price">₹{product.price}</p>
              {product.stock === 0 ? (
                <p className="stock-info out-of-stock">Out of Stock</p>
              ) : (
                <p className="stock-info">Stock: {product.stock}</p>
              )}
              <div className="product-card-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0}
                >
                  Add To Cart
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => buyNow(product.id)}
                  disabled={product.stock === 0}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
