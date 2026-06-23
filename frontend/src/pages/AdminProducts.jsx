import { useState, useEffect } from "react";
import api from "../api/axios";
import graphqlClient from "../graphql/client";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from "../graphql/products.mutation";
import { useToast } from "../components/Toast";
import Modal from "../components/Modal";
import { TableSkeleton } from "../components/Skeleton";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  sku: ""
};

function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  useEffect(() => {
    fetchProducts();
    const onFocus = () => fetchProducts();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name || !form.price || !form.stock) {
      setFormError("Name, price and stock are required");
      return;
    }

    try {
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description || null,
        sku: form.sku || null,
      };

      const mutation = editingId
        ? { query: UPDATE_PRODUCT, variables: { id: editingId, ...payload } }
        : { query: CREATE_PRODUCT, variables: payload };

      const response = await graphqlClient.post("", mutation);
      const body = response.data;

      if (body.errors) {
        throw new Error(body.errors[0]?.message || "Operation failed");
      }

      toast(
        editingId
          ? "Product updated successfully"
          : "Product created successfully",
        "success"
      );

      setForm(initialForm);
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || "Operation failed");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      sku: product.sku || ""
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await graphqlClient.post("", {
        query: DELETE_PRODUCT,
        variables: { id },
      });
      const body = response.data;
      if (body.errors) {
        throw new Error(body.errors[0]?.message || "Failed to delete");
      }
      toast("Product deleted successfully", "success");
      fetchProducts();
    } catch (error) {
      toast(error.response?.data?.message || error.message || "Failed to delete", "error");
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setFormError("");
  };

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Admin Products</h1>
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Admin Products</h1>
        <div className="empty-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Admin Products</h1>

      <div className="form-section">
        <h2 className="section-title">
          {editingId ? "Edit Product" : "Add Product"}
        </h2>

        {formError && (
          <p style={{ color: "#dc2626", marginBottom: "12px", fontSize: "14px" }}>
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name</label>
            <input
              name="name"
              placeholder="Product name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Optional description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div className="form-row" style={{ flex: 1 }}>
              <label>Price</label>
              <input
                name="price"
                placeholder="0.00"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-row" style={{ flex: 1 }}>
              <label>Stock</label>
              <input
                name="stock"
                placeholder="0"
                type="number"
                value={form.stock}
                onChange={handleChange}
              />
            </div>

            <div className="form-row" style={{ flex: 1 }}>
              <label>SKU</label>
              <input
                name="sku"
                placeholder="SKU"
                value={form.sku}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button type="button" className="btn btn-outline" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="section-title">Products List</h2>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products found</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        visible={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will soft-delete the product.`}
        confirmLabel="Yes, Delete"
        onConfirm={() => {
          const id = deleteTarget.id;
          setDeleteTarget(null);
          handleDelete(id);
        }}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
}

export default AdminProducts;
