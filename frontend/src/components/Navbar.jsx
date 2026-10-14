import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight, BarChart3, ClipboardList, Heart, LayoutDashboard, LogOut, Menu, MessageCircle,
  Package, Plus, Search, Settings, ShoppingBag, ShoppingCart, Store, Tag, UserRound, Users, X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { isPreviewAuth } from "../services/auth";
import { readPreviewSellerOrders } from "../services/previewSellerData";

function Brand({ to }) {
  return (
    <Link to={to} aria-label="CampusEcom home" className="group inline-flex shrink-0 items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-amber-500 text-xl font-extrabold text-white shadow-[0_7px_18px_rgba(245,158,11,.24)] transition-transform group-hover:-rotate-3">C</span>
      <span className="text-[19px] font-extrabold tracking-[-.06em] text-slate-900">Campus<span className="text-amber-500">Ecom</span></span>
    </Link>
  );
}

const sellerLinks = [
  { to: "/seller/dashboard", label: "Overview" },
  { to: "/seller/products", label: "Listings" },
  { to: "/seller/orders", label: "Orders" },
  { to: "/seller/sales", label: "Sales" },
  { to: "/seller/settings", label: "Store settings" },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRootRef = useRef(null);
  const [search, setSearch] = useState("");
  const isSeller = user?.role === "seller";
  const isAdmin = user?.role === "admin";
  const isMarketplace = !isSeller && !isAdmin;
  const cartCount = (cart?.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const sellerOrderCount = isSeller && isPreviewAuth
    ? readPreviewSellerOrders(user?.email).filter((order) => !["completed", "cancelled"].includes(String(order.status).toLowerCase())).length
    : 0;
  const closeMobile = () => setMobileOpen(false);
  const active = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!menuRootRef.current?.contains(event.target)) closeMobile();
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMobile();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (query) navigate(`/products?search=${encodeURIComponent(query)}`);
    closeMobile();
  };

  const navLinkClass = (path) => `whitespace-nowrap text-[13px] font-semibold transition-colors ${active(path) ? "text-amber-700" : "text-slate-600 hover:text-slate-950"}`;
  const mobileLinkClass = (path) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active(path) ? "bg-amber-50 text-amber-800" : "text-slate-700 hover:bg-slate-50"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_2px_18px_rgba(15,23,42,.035)] backdrop-blur-xl">
      <div className="bg-slate-950 text-center text-[11px] font-medium tracking-wide text-slate-200">
        <div className="container-custom flex min-h-8 items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          {isAdmin ? "Administrator workspace · Manage the marketplace" : isSeller ? "Seller workspace · Manage your campus store" : "Your campus marketplace · Buy and sell with confidence"}
        </div>
      </div>
      <div ref={menuRootRef} className="container-custom relative">
        <div className="flex min-h-[76px] items-center gap-6">
          <Brand to={isAdmin ? "/admin/dashboard" : isSeller ? "/seller/dashboard" : "/"} />

          {isMarketplace && <form onSubmit={submitSearch} role="search" className="hidden min-w-0 flex-1 md:block">
            <label className="relative mx-auto block max-w-[540px]">
              <Search aria-hidden="true" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, categories, and more" aria-label="Search products" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/10" />
            </label>
          </form>}

          {isSeller ? (
            <nav aria-label="Seller workspace" className="ml-auto hidden items-center gap-4 lg:flex xl:gap-5">
              {sellerLinks.map(({ to, label }) => <Link key={to} to={to} aria-current={active(to) ? "page" : undefined} className={navLinkClass(to)}>{label}{to === "/seller/orders" && sellerOrderCount > 0 && <span className="ml-1.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-800">{sellerOrderCount > 9 ? "9+" : sellerOrderCount}</span>}</Link>)}
            </nav>
          ) : null}
          {isAdmin && <nav aria-label="Administrator workspace" className="ml-auto hidden items-center gap-3 lg:flex xl:gap-4">
            {adminLinks.map(({ to, label }) => <Link key={to} to={to} aria-current={active(to) ? "page" : undefined} className={navLinkClass(to)}>{label}</Link>)}
          </nav>}
          {isMarketplace && (
            <nav aria-label="Marketplace navigation" className="hidden items-center gap-7 lg:flex">
              <Link to="/products" aria-current={active("/products") ? "page" : undefined} className={navLinkClass("/products")}>Explore</Link>
              {!isAuthenticated && <Link to="/register?role=seller" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-slate-950"><Store size={15} /> Sell on CampusEcom</Link>}
            </nav>
          )}

          <div className={`${isSeller || isAdmin ? "ml-auto lg:ml-0" : "ml-auto"} flex shrink-0 items-center gap-1 sm:gap-2`}>
            {isSeller && <Link to="/seller/products/create" aria-label="Add a product listing" title="Add a listing" className="hidden h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white transition hover:bg-slate-800 lg:inline-flex"><Plus size={16} /><span className="hidden xl:inline">Add listing</span></Link>}
            {isAuthenticated && isMarketplace && user?.role === "buyer" && <Link to="/wishlist" aria-label="Wishlist" className="hidden h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600 sm:grid"><Heart size={19} strokeWidth={1.8} /></Link>}
            {isAuthenticated && isMarketplace && user?.role === "buyer" && <Link to="/cart" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`} className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"><ShoppingCart size={19} strokeWidth={1.8} />{cartCount > 0 && <span className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white">{cartCount > 99 ? "99+" : cartCount}</span>}</Link>}
            {isAuthenticated ? (
              <div className="hidden items-center gap-1 sm:flex">
                {isSeller && <Link to="/messages" aria-label="Messages" className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"><MessageCircle size={18} /></Link>}
                {!isSeller && !isAdmin && <Link to="/orders" aria-label="Order history" className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"><ClipboardList size={18} /></Link>}
                {!isSeller && !isAdmin && <Link to="/messages" aria-label="Messages" className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"><MessageCircle size={18} /></Link>}
                <Link to="/profile" className="ml-1 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><UserRound size={16} /><span className="max-w-24 truncate">{user?.first_name || "Account"}</span></Link>
                <button type="button" onClick={() => { logout(); navigate("/"); }} aria-label="Log out" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><LogOut size={17} /></button>
              </div>
            ) : <div className="hidden items-center gap-2 sm:flex"><Link to="/login" className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Log in</Link><Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800">Join now <ArrowRight size={15} /></Link></div>}

            <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden">{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </div>

        {mobileOpen && <div id="mobile-navigation" className="absolute right-0 top-full z-50 max-h-[calc(100dvh-9rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,.18)] ring-1 ring-slate-950/5 lg:hidden sm:p-4">
          {isMarketplace && <form onSubmit={submitSearch} role="search" className="relative mb-3 md:hidden"><Search aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the marketplace" aria-label="Search products" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></form>}
          <nav aria-label={isAdmin ? "Administrator mobile navigation" : isSeller ? "Seller workspace mobile navigation" : "Marketplace mobile navigation"} className="grid gap-1">
            {isSeller ? <>
              <div className="grid grid-cols-2 gap-1">
                <Link to="/seller/dashboard" onClick={closeMobile} aria-current={active("/seller/dashboard") ? "page" : undefined} className={mobileLinkClass("/seller/dashboard")}><Store size={17} /> Overview</Link>
                <Link to="/seller/products" onClick={closeMobile} aria-current={active("/seller/products") ? "page" : undefined} className={mobileLinkClass("/seller/products")}><Package size={17} /> Listings</Link>
                <Link to="/seller/orders" onClick={closeMobile} aria-current={active("/seller/orders") ? "page" : undefined} className={mobileLinkClass("/seller/orders")}><ClipboardList size={17} /> Orders{sellerOrderCount > 0 && <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">{sellerOrderCount}</span>}</Link>
                <Link to="/seller/sales" onClick={closeMobile} aria-current={active("/seller/sales") ? "page" : undefined} className={mobileLinkClass("/seller/sales")}><BarChart3 size={17} /> Sales</Link>
              </div>
              <div className="mt-2 border-t border-slate-100 pt-2">
                <Link to="/seller/settings" onClick={closeMobile} aria-current={active("/seller/settings") ? "page" : undefined} className={mobileLinkClass("/seller/settings")}><Settings size={17} /> Store settings</Link>
                <Link to="/messages" onClick={closeMobile} aria-current={active("/messages") ? "page" : undefined} className={mobileLinkClass("/messages")}><MessageCircle size={17} /> Messages</Link>
              </div>
            </> : isAdmin ? <>
              {adminLinks.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={closeMobile} aria-current={active(to) ? "page" : undefined} className={mobileLinkClass(to)}><Icon size={17} /> {label}</Link>)}
            </> : <>
              <Link to="/products" onClick={closeMobile} aria-current={active("/products") ? "page" : undefined} className={mobileLinkClass("/products")}><ShoppingBag size={17} /> Explore products</Link>
              <Link to="/wishlist" onClick={closeMobile} aria-current={active("/wishlist") ? "page" : undefined} className={mobileLinkClass("/wishlist")}><Heart size={17} /> Wishlist</Link>
              {isAuthenticated && user?.role === "buyer" && <><Link to="/cart" onClick={closeMobile} aria-current={active("/cart") ? "page" : undefined} className={mobileLinkClass("/cart")}><ShoppingCart size={17} /> Cart {cartCount > 0 && `(${cartCount})`}</Link><Link to="/orders" onClick={closeMobile} aria-current={active("/orders") ? "page" : undefined} className={mobileLinkClass("/orders")}><ClipboardList size={17} /> Order history</Link><Link to="/messages" onClick={closeMobile} aria-current={active("/messages") ? "page" : undefined} className={mobileLinkClass("/messages")}><MessageCircle size={17} /> Messages</Link></>}
              {!isAuthenticated && <Link to="/register?role=seller" onClick={closeMobile} className={mobileLinkClass("/register")}><Store size={17} /> Sell on CampusEcom</Link>}
            </>}
            {isAuthenticated ? <><Link to="/profile" onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><UserRound size={17} /> My account</Link><button type="button" onClick={() => { logout(); closeMobile(); navigate("/"); }} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut size={17} /> Log out</button></> : <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4"><Link to="/login" onClick={closeMobile} className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700">Log in</Link><Link to="/register" onClick={closeMobile} className="rounded-xl bg-slate-950 py-3 text-center text-sm font-semibold text-white">Create account</Link></div>}
          </nav>
        </div>}
      </div>
    </header>
  );
}
