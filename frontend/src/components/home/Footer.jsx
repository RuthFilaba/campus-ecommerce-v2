import { Link } from "react-router-dom";
import { ArrowUpRight, GraduationCap, MapPin } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Footer() {
  const { user, isAuthenticated } = useAuth();
  const isSeller = user?.role === "seller" || user?.role === "admin";

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="container-custom py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link to={isSeller ? "/seller/dashboard" : "/"} aria-label="CampusEcom home" className="inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-lg font-extrabold text-white">C</span>
              <span className="text-lg font-extrabold tracking-[-.06em]">Campus<span className="text-amber-400">Ecom</span></span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-400">{isSeller ? "Tools to manage your store and grow your campus business." : "A marketplace for the Mulungushi University community."}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400"><MapPin size={14} className="text-amber-400" /> Mulungushi University, Zambia</div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[.14em] text-slate-300">{isSeller ? "Seller workspace" : "Marketplace"}</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {isSeller ? <>
                <li><Link to="/seller/dashboard" className="transition hover:text-white">Overview</Link></li>
                <li><Link to="/seller/products" className="transition hover:text-white">Manage listings</Link></li>
                <li><Link to="/seller/orders" className="transition hover:text-white">Orders</Link></li>
                <li><Link to="/seller/sales" className="transition hover:text-white">Sales</Link></li>
              </> : <>
                <li><Link to="/products" className="transition hover:text-white">Explore products</Link></li>
                <li><Link to="/products?category=academic" className="transition hover:text-white">Academic</Link></li>
                <li><Link to="/products?category=tech-mobile" className="transition hover:text-white">Tech & mobile</Link></li>
                {!isAuthenticated && <li><Link to="/register?role=seller" className="inline-flex items-center gap-1 transition hover:text-white">Start selling <ArrowUpRight size={13} /></Link></li>}
              </>}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[.14em] text-slate-300">{isSeller ? "Store account" : "Your account"}</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {isAuthenticated ? <>
                <li><Link to="/profile" className="transition hover:text-white">Profile</Link></li>
                {isSeller ? <li><Link to="/seller/settings" className="transition hover:text-white">Store settings</Link></li> : <><li><Link to="/orders" className="transition hover:text-white">Your orders</Link></li><li><Link to="/wishlist" className="transition hover:text-white">Your wishlist</Link></li></>}
                <li><Link to="/messages" className="transition hover:text-white">Messages</Link></li>
              </> : <><li><Link to="/login" className="transition hover:text-white">Log in</Link></li><li><Link to="/register" className="transition hover:text-white">Create an account</Link></li><li><Link to="/orders" className="transition hover:text-white">Your orders</Link></li><li><Link to="/wishlist" className="transition hover:text-white">Your wishlist</Link></li></>}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[.14em] text-slate-300">Community</h2>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300"><GraduationCap size={19} /></span>
              <p className="text-xs leading-5 text-slate-400">{isSeller ? "Build trust with clear listings, timely updates, and convenient campus meetups." : "Discover useful finds and connect with fellow students around campus."}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CampusEcom · Mulungushi University</span>
          <span>Built for campus life.</span>
        </div>
      </div>
    </footer>
  );
}
