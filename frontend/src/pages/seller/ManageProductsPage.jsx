import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faEye,
  faSpinner,
  faSearch,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faRefresh,
  faBox,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { isPreviewAuth } from "../../services/auth";
import { deletePreviewSellerProduct, readPreviewSellerProducts } from "../../services/previewSellerData";
import { getProductPrimaryImage } from "../../utils/productImages";

const ManageProductsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    if (isPreviewAuth) {
      setProducts(readPreviewSellerProducts(user?.email));
      setLoading(false);
      return;
    }
    try {
      // Use the correct endpoint for seller's products
      const response = await api.get("/products/my-products/");
      let productsData = [];
      if (response.data.results) {
        productsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      }
      console.log("Seller products loaded:", productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load your products");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProducts();
  }, [isAuthenticated, fetchProducts]);

  const handleEdit = (productId) => {
    navigate(`/seller/products/edit/${productId}`);
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Delete "${productName}"? This action cannot be undone.`))
      return;

    setDeletingId(productId);
    if (isPreviewAuth) {
      setProducts(deletePreviewSellerProduct(user?.email, productId));
      toast.success(`"${productName}" has been removed`);
      setDeletingId(null);
      return;
    }
    try {
      await api.delete(`/products/${productId}/`);
      toast.success(`"${productName}" has been deleted`);
      // Remove from local state
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (product) => {
    if (product.approval_status === "rejected") {
      return { text: "Rejected", color: "bg-red-100 text-red-800", icon: faTimesCircle };
    } else if (!product.is_approved && product.is_submitted) {
      return {
        text: "Pending",
        color: "bg-yellow-100 text-yellow-800",
        icon: faClock,
      };
    } else if (product.is_approved && product.is_active) {
      return {
        text: "Active",
        color: "bg-green-100 text-green-800",
        icon: faCheckCircle,
      };
    } else if (product.is_approved === false && product.is_submitted) {
      return {
        text: "Rejected",
        color: "bg-red-100 text-red-800",
        icon: faTimesCircle,
      };
    } else if (product.is_active === false) {
      return {
        text: "Deactivated",
        color: "bg-gray-100 text-gray-800",
        icon: faTimesCircle,
      };
    }
    return { text: "Draft", color: "bg-gray-100 text-gray-800", icon: faClock };
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon
          icon={faSpinner}
          className="animate-spin text-4xl text-amber-500"
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Products</h1>
            <p className="text-gray-500">{products.length} total products</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <FontAwesomeIcon
                icon={faRefresh}
                className={loading ? "animate-spin" : ""}
              />
            </button>
            <Link
              to="/seller/products/create"
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} /> Add Product
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500">
              {searchTerm ? "No matches found" : "No products yet"}
            </p>
            {!searchTerm && (
              <Link
                to="/seller/products/create"
                className="inline-block mt-4 text-amber-500 hover:text-amber-600"
              >
                Add your first product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProducts.map((product) => {
              const status = getStatusBadge(product);
              const isDeleting = deletingId === product.id;
              const isLowStock = product.stock <= 5 && product.stock > 0;
              const isOutOfStock = product.stock === 0;

              const productImage = getProductPrimaryImage(product, `https://placehold.co/64x64/e5e7eb/9ca3af?text=${product.name?.charAt(0) || "P"}`);

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.target.src = `https://placehold.co/64x64/e5e7eb/9ca3af?text=${product.name?.charAt(0) || "P"}`)
                          }
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          K{parseFloat(product.price || 0).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.color}`}
                          >
                            <FontAwesomeIcon
                              icon={status.icon}
                              className="text-xs"
                            />{" "}
                            {status.text}
                          </span>
                          {isLowStock && !isOutOfStock && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              <FontAwesomeIcon
                                icon={faBox}
                                className="text-xs"
                              />{" "}
                              Low stock: {product.stock}
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              <FontAwesomeIcon
                                icon={faBox}
                                className="text-xs"
                              />{" "}
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock Display */}
                    <div className="text-center min-w-[80px]">
                      <p
                        className={`text-sm font-semibold ${
                          isOutOfStock
                            ? "text-red-500"
                            : isLowStock
                              ? "text-orange-500"
                              : "text-green-600"
                        }`}
                      >
                        Stock: {product.stock}
                      </p>
                    </div>

                    {/* Action Buttons - View, Edit, Delete for sellers */}
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Product"
                        target="_blank"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Product"
                      >
                        {isDeleting ? (
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faTrash} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProductsPage;
