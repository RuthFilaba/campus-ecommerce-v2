import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrash, 
  faPlus, 
  faMinus, 
  faShoppingCart, 
  faSpinner,
  faArrowLeft,
  faArrowRight,
  faImage
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const CartPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart/');
      console.log("Cart data:", response.data);
      
      const cartData = response.data;
      const cartItems = cartData.items || [];
      
      // Extract product details from each cart item
      const processedItems = cartItems.map(item => {
        const product = item.product_detail || item.product || {};
        return {
          id: item.id,
          product_id: product.id,
          name: product.name,
          price: parseFloat(product.price) || 0,
          quantity: item.quantity,
          image: product.image_1 || product.image_url,
          stock: product.stock,
          subtotal: parseFloat(item.subtotal) || (parseFloat(product.price) * item.quantity)
        };
      });
      
      setItems(processedItems);
      setSubtotal(parseFloat(cartData.subtotal) || 0);
      setTotalItems(cartData.total_items || 0);
      setCart(cartData);
      
      console.log("Processed items:", processedItems);
      console.log("Subtotal:", cartData.subtotal);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }
    
    setUpdatingId(itemId);
    try {
      await api.put(`/cart/item/${itemId}/`, { quantity: newQuantity });
      await fetchCart(); // Refresh cart
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error(error.response?.data?.error || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (itemId) => {
    setUpdatingId(itemId);
    try {
      await api.delete(`/cart/remove/${itemId}/`);
      await fetchCart(); // Refresh cart
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      await api.delete('/cart/clear/');
      await fetchCart();
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container-custom max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
          </button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faShoppingCart} className="text-amber-500" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to your cart to get started</p>
            <Link to="/products" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2">
              Start Shopping <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/100x100/e5e7eb/9ca3af?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <FontAwesomeIcon icon={faImage} className="text-gray-400 text-2xl" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <Link to={`/products/${item.product_id}`}>
                        <h3 className="font-semibold text-gray-800 dark:text-white hover:text-amber-500 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-amber-600 font-bold mt-1">K{item.price.toFixed(2)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingId === item.id}
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-sm" />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {updatingId === item.id ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingId === item.id || (item.stock && item.quantity >= item.stock)}
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-sm" />
                        </button>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updatingId === item.id}
                          className="ml-4 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="text-lg font-bold text-amber-600">
                        K{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 text-sm flex items-center gap-2 mt-4"
              >
                <FontAwesomeIcon icon={faTrash} /> Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-semibold">K{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-amber-600">K{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg mt-6 transition-colors"
                >
                  Proceed to Checkout
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  Free meetup on campus - No delivery fees!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
