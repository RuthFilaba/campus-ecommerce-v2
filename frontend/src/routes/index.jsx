import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/home/Footer";

// Public Pages
const HomePage = lazy(() => import("../pages/HomePage"));
const ProductsPage = lazy(() => import("../pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const PublicProfilePage = lazy(() => import("../pages/PublicProfilePage"));

// Protected Pages
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const CartPage = lazy(() => import("../pages/buyer/CartPage"));
const CheckoutPage = lazy(() => import("../pages/buyer/CheckoutPage"));
const OrdersPage = lazy(() => import("../pages/buyer/OrdersPage"));
const OrderDetailPage = lazy(() => import("../pages/buyer/OrderDetailPage"));
const WishlistPage = lazy(() => import("../pages/buyer/WishlistPage"));
const MessagesPage = lazy(() => import("../pages/MessagesPage"));

// Seller Pages
const SellerDashboardPage = lazy(() => import("../pages/seller/SellerDashboardPage"));
const ManageProductsPage = lazy(() => import("../pages/seller/ManageProductsPage"));
const CreateProductPage = lazy(() => import("../pages/seller/CreateProductPage"));
const EditProductPage = lazy(() => import("../pages/seller/EditProductPage"));
const StoreSettingsPage = lazy(() => import("../pages/seller/StoreSettingsPage"));
const MySalesPage = lazy(() => import("../pages/seller/MySalesPage"));
const SellerOrderDetailPage = lazy(() => import("../pages/seller/SellerOrderDetailPage"));

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const isSeller = user?.role === "seller" || user?.role === "admin";

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/profile/:userId" element={<PublicProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/cart" element={isAuthenticated ? <CartPage /> : <Navigate to="/login" state={{ from: { pathname: "/cart" } }} replace />} />
            <Route path="/checkout" element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/messages" element={isAuthenticated ? <MessagesPage /> : <Navigate to="/login" />} />
            
            <Route path="/orders" element={isAuthenticated ? <OrdersPage /> : <Navigate to="/login" />} />
            <Route path="/orders/:id" element={isAuthenticated ? <OrderDetailPage /> : <Navigate to="/login" />} />

            <Route path="/seller/dashboard" element={isAuthenticated && isSeller ? <SellerDashboardPage /> : <Navigate to="/" />} />
            <Route path="/seller/products" element={isAuthenticated && isSeller ? <ManageProductsPage /> : <Navigate to="/" />} />
            <Route path="/seller/products/create" element={isAuthenticated && isSeller ? <CreateProductPage /> : <Navigate to="/" />} />
            <Route path="/seller/products/edit/:id" element={isAuthenticated && isSeller ? <EditProductPage /> : <Navigate to="/" />} />
            <Route path="/seller/settings" element={isAuthenticated && isSeller ? <StoreSettingsPage /> : <Navigate to="/" />} />
            <Route path="/seller/sales" element={isAuthenticated && isSeller ? <MySalesPage /> : <Navigate to="/" />} />
            <Route path="/seller/orders/:id" element={isAuthenticated && isSeller ? <SellerOrderDetailPage /> : <Navigate to="/" />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Suspense>
  );
};

export default AppRoutes;

