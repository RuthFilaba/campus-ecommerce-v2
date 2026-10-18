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
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const PublicProfilePage = lazy(() => import("../pages/PublicProfilePage"));
const HelpCenterPage = lazy(() => import("../pages/HelpCenterPage"));
const PolicyPage = lazy(() => import("../pages/PolicyPage"));

// Protected Pages
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const CartPage = lazy(() => import("../pages/buyer/CartPage"));
const CheckoutPage = lazy(() => import("../pages/buyer/CheckoutPage"));
const OrdersPage = lazy(() => import("../pages/buyer/OrdersPage"));
const OrderDetailPage = lazy(() => import("../pages/buyer/OrderDetailPage"));
const WishlistPage = lazy(() => import("../pages/buyer/WishlistPage"));
const MessagesPage = lazy(() => import("../pages/MessagesPage"));

// Seller Pages
const SellerDashboardPage = lazy(() => import("../pages/seller/SellerDashboardRoute"));
const ManageProductsPage = lazy(() => import("../pages/seller/ManageProductsPage"));
const CreateProductPage = lazy(() => import("../pages/seller/CreateProductPage"));
const EditProductPage = lazy(() => import("../pages/seller/SellerEditProductRoute"));
const StoreSettingsPage = lazy(() => import("../pages/seller/SellerSettingsRoute"));
const MySalesPage = lazy(() => import("../pages/seller/SellerSalesRoute"));
const SellerOrderDetailPage = lazy(() => import("../pages/seller/SellerOrderDetailPage"));
const SellerActiveOrdersPage = lazy(() => import("../pages/seller/SellerOrdersRoute"));
const SellerPaymentsPage = lazy(() => import("../pages/seller/SellerPaymentsPage"));
const SellerApplicationPage = lazy(() => import("../pages/seller/SellerApplicationPage"));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const isSeller = user?.role === "seller";
  const isAdmin = user?.role === "admin";
  const isBuyer = isAuthenticated && user?.role === "buyer";
  const buyerRedirect = isSeller ? "/seller/dashboard" : isAdmin ? "/admin/dashboard" : "/login";

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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/terms" element={<PolicyPage />} />
            <Route path="/privacy" element={<PolicyPage />} />

            <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/cart" element={isBuyer ? <CartPage /> : <Navigate to={buyerRedirect} state={{ from: { pathname: "/cart" } }} replace />} />
            <Route path="/checkout" element={isBuyer ? <CheckoutPage /> : <Navigate to={buyerRedirect} state={{ from: { pathname: "/checkout" } }} replace />} />
            <Route path="/wishlist" element={isBuyer ? <WishlistPage /> : <Navigate to={buyerRedirect} replace />} />
            <Route path="/messages" element={isAuthenticated ? <MessagesPage /> : <Navigate to="/login" />} />
            
            <Route path="/orders" element={isBuyer ? <OrdersPage /> : <Navigate to={buyerRedirect} replace />} />
            <Route path="/orders/:id" element={isBuyer ? <OrderDetailPage /> : <Navigate to={buyerRedirect} replace />} />
            <Route path="/orders/:id/report" element={isBuyer ? <Navigate to="/orders" replace /> : <Navigate to={buyerRedirect} replace />} />

            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/sellers" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/products" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/orders" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/disputes" element={isAuthenticated && isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/customers" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/coupons" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/reports" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/activity" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            <Route path="/admin/settings" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={isAuthenticated ? "/" : "/login"} replace />} />

            <Route path="/seller/dashboard" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <SellerDashboardPage />) : <Navigate to="/" />} />
            <Route path="/seller/products" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <ManageProductsPage />) : <Navigate to="/" />} />
            <Route path="/seller/products/create" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <CreateProductPage />) : <Navigate to="/" />} />
            <Route path="/seller/products/edit/:id" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <EditProductPage />) : <Navigate to="/" />} />
            <Route path="/seller/orders" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <SellerActiveOrdersPage />) : <Navigate to="/" />} />
            <Route path="/seller/payments" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <SellerPaymentsPage />) : <Navigate to="/" />} />
            <Route path="/seller/settings" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <StoreSettingsPage />) : <Navigate to="/" />} />
            <Route path="/seller/sales" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <MySalesPage />) : <Navigate to="/" />} />
            <Route path="/seller/disputes" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <Navigate to="/seller/dashboard" replace />) : <Navigate to="/" />} />
            <Route path="/seller/orders/:id" element={isAuthenticated && isSeller ? (!user.is_verified ? <SellerApplicationPage /> : <SellerOrderDetailPage />) : <Navigate to="/" />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Suspense>
  );
};

export default AppRoutes;

