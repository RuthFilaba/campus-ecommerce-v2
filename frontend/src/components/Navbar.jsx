import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight, Heart, LogOut, Menu, MessageCircle, Search, ShoppingBag,
  ShoppingCart, Store, UserRound, X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

function Brand() {
  return (
    <Link to="/" aria-label="CampusEcom home" className="group inline-flex shrink-0 items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-amber-500 text-xl font-extrabold text-white shadow-[0_7px_18px_rgba(245,158,11,.24)] transition-transform group-hover:-rotate-3">
        C
      </span>
      <span className="text-[19px] font-extrabold tracking-[-0.06em] text-slate-900">
        Campus<span className="text-amber-500">Ecom</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isSeller = user?.role === "seller" || user?.role === "admin";
  const cartCount = (cart?.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (query) navigate(`/products?search=${encodeURIComponent(query)}`);
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);
  const active = (path) => location.pathname === path ? "text-slate-950" : "text-slate-500 hover:text-slate-950";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_2px_18px_rgba(15,23,42,.035)] backdrop-blur-xl">
      <div className="bg-slate-950 text-center text-[11px] font-medium tracking-wide text-slate-200">
        <div className="container-custom flex min-h-8 items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Your campus marketplace · Buy and sell with confidence
        </div>
      </div>
      <div className="container-custom">
        <div className="flex min-h-[76px] items-center gap-6">
          <Brand />

          <form onSubmit={submitSearch} role="search" className="hidden min-w-0 flex-1 md:block">
            <label className="relative mx-auto block max-w-[540px]">
              <Search aria-hidden="true" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, categories, and more"
                aria-label="Search products"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/10"
              />
            </label>
          </form>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
            <Link to="/products" className={`text-[13px] font-semibold transition ${active("/products")}`}>Explore</Link>
            <Link to="/register?role=seller" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-slate-950">
              <Store size={15} /> Sell on CampusEcom
            </Link>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Link to="/wishlist" aria-label="Wishlist" className="hidden h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600 sm:grid">
              <Heart size={19} strokeWidth={1.8} />
            </Link>
            <Link to="/cart" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`} className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600">
              <ShoppingCart size={19} strokeWidth={1.8} />
              {cartCount > 0 && <span className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white">{cartCount > 99 ? "99+" : cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="hidden items-center gap-1 sm:flex">
                {isSeller && <Link to="/seller/dashboard" aria-label="Seller dashboard" className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"><Store size={18} /></Link>}
                <Link to="/messages" aria-label="Messages" className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"><MessageCircle size={18} /></Link>
                <Link to="/profile" className="ml-1 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  <UserRound size={16} />
                  <span className="max-w-24 truncate">{user?.first_name || "Account"}</span>
                </Link>
                <button type="button" onClick={() => { logout(); navigate("/"); }} aria-label="Log out" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><LogOut size={17} /></button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Log in</Link>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/30">
                  Join now <ArrowRight size={15} />
                </Link>
              </div>
            )}

            <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden">
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 pb-5 pt-4 lg:hidden">
            <form onSubmit={submitSearch} role="search" className="relative mb-4 md:hidden">
              <Search aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the marketplace" aria-label="Search products" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" />
            </form>
            <nav aria-label="Mobile navigation" className="grid gap-1">
              <Link to="/products" onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ShoppingBag size={17} /> Explore products</Link>
              <Link to="/wishlist" onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Heart size={17} /> Wishlist</Link>
              <Link to="/register?role=seller" onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Store size={17} /> Sell on CampusEcom</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><UserRound size={17} /> My account</Link>
                  <button type="button" onClick={() => { logout(); closeMobile(); navigate("/"); }} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut size={17} /> Log out</button>
                </>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                  <Link to="/login" onClick={closeMobile} className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700">Log in</Link>
                  <Link to="/register" onClick={closeMobile} className="rounded-xl bg-slate-950 py-3 text-center text-sm font-semibold text-white">Create account</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
