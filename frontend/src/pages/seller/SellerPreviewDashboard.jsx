import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Package,
  Plus,
  Settings2,
  ShoppingBag,
  Store,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { readPreviewSellerOrders, readPreviewSellerProducts, readPreviewSellerSettings } from "../../services/previewSellerData";
import { getProductPrimaryImage } from "../../utils/productImages";
import { formatMoney } from "../../services/currency";

export default function SellerPreviewDashboard() {
  const { user } = useAuth();
  const products = readPreviewSellerProducts(user?.email);
  const orders = readPreviewSellerOrders(user?.email);
  const settings = readPreviewSellerSettings(user?.email || "", user?.first_name || "");
  const activeProducts = products.filter((product) => product.is_active && Number(product.stock) > 0);
  const outOfStock = products.filter((product) => Number(product.stock) === 0).length;
  const lowStock = products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 5).length;
  const ordersToFulfill = orders.filter((order) => !["completed", "delivered", "cancelled", "refunded"].includes(String(order.status).toLowerCase()));
  const completedOrders = orders.filter((order) => ["completed", "delivered"].includes(String(order.status).toLowerCase()));
  const revenue = orders.filter((order) => order.paymentStatus === "Verified").reduce((sum, order) => sum + Number(order.sellerSubtotal || 0), 0);
  const paymentsToReview = orders.filter((order) => ["Awaiting Verification", "Disputed"].includes(order.paymentStatus)).length;
  const stats = [
    { label: "Active listings", value: activeProducts.length, detail: `${products.length} total`, icon: Package, href: "/seller/products", tone: "amber" },
    { label: "Orders to fulfill", value: ordersToFulfill.length, detail: "Needs your attention", icon: ClipboardList, href: "/seller/orders", tone: "blue" },
    { label: "Completed sales", value: completedOrders.length, detail: "Preview orders", icon: BarChart3, href: "/seller/sales", tone: "green" },
    { label: "Revenue", value: formatMoney(revenue), detail: "Verified payments", icon: CircleDollarSign, href: "/seller/sales", tone: "violet" },
    { label: "Payment reviews", value: paymentsToReview, detail: "Awaiting admin review", icon: Wallet, href: "/seller/payments", tone: "amber" },
  ];
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom max-w-7xl pt-8 sm:pt-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Seller workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950 sm:text-[36px]">Welcome, {user?.first_name || "seller"}</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your listings, fulfill orders, and keep your store up to date.</p>
          </div>
          <Link to="/seller/products/create" className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"><Plus size={16} /> Add a listing</Link>
        </header>

        <section aria-label="Store performance" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(({ label, value, detail, icon: Icon, href, tone }) => (
            <Link key={label} to={href} className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/30">
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-500">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClasses[tone]}`}><Icon size={17} /></span></div>
              <p className="mt-4 truncate text-2xl font-bold tracking-tight text-slate-950">{value}</p>
              <div className="mt-1 flex items-center justify-between gap-2"><p className="text-[11px] text-slate-400">{detail}</p><ArrowRight size={13} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-700" /></div>
            </Link>
          ))}
        </section>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div><h2 className="text-sm font-bold text-slate-900">Your listings</h2><p className="mt-1 text-xs text-slate-500">Review stock and update product details.</p></div>
              <Link to="/seller/products" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition hover:text-amber-700">All listings <ArrowRight size={13} /></Link>
            </div>
            {products.length ? (
              <ul className="divide-y divide-slate-100">
                {products.slice(0, 5).map((product) => (
                  <li key={product.id}>
                    <Link to={`/seller/products/edit/${product.id}`} className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100"><img src={getProductPrimaryImage(product, `https://placehold.co/96x96/fef3c7/92400e?text=${product.name?.charAt(0) || "P"}`)} alt={product.name} className="h-full w-full object-cover" /></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{product.name}</p><p className="mt-1 text-[11px] text-slate-500">{Number(product.stock)} in stock <span className="px-1 text-slate-300">·</span> {formatMoney(product.price)}</p></div>
                      {Number(product.stock) === 0 ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700">Out of stock</span> : Number(product.stock) <= 5 ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">Low stock</span> : <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 sm:inline-flex">Active</span>}
                      <ArrowRight size={15} className="shrink-0 text-slate-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700"><Package size={20} /></span><h3 className="mt-4 text-sm font-bold text-slate-900">Start with your first listing</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">Add a product with a clear photo, price, and stock so campus buyers can find it.</p><Link to="/seller/products/create" className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-amber-400 px-3 text-xs font-bold text-slate-950 transition hover:bg-amber-300"><Plus size={14} /> Create listing</Link></div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.13em] text-slate-400">Store profile</p><h2 className="mt-1 text-base font-bold text-slate-900">{settings.store_name}</h2><p className="mt-1 text-xs text-slate-500">{settings.campus}</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><Store size={18} /></span></div>
              <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">Your seller preview data is saved in this browser until the backend is connected.</p>
              <Link to="/seller/settings" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950">Edit store profile <ArrowRight size={13} /></Link>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2"><Settings2 size={16} className="text-slate-500" /><h2 className="text-sm font-bold text-slate-900">Quick actions</h2></div>
              <div className="mt-4 grid gap-2">
                <Link to="/seller/products/create" className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50/60"><span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><Plus size={15} /></span>Add a product listing<ArrowRight size={14} className="ml-auto text-slate-300" /></Link>
                <Link to="/seller/orders" className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-700"><ClipboardList size={15} /></span>Review buyer orders<ArrowRight size={14} className="ml-auto text-slate-300" /></Link>
                <Link to="/seller/sales" className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/50"><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><BarChart3 size={15} /></span>View sales activity<ArrowRight size={14} className="ml-auto text-slate-300" /></Link>
              </div>
            </section>

            <section className={`rounded-2xl border p-5 ${ordersToFulfill.length || outOfStock || lowStock ? "border-amber-200 bg-amber-50/70" : "border-emerald-200 bg-emerald-50/70"}`}>
              <div className="flex items-start gap-3">{ordersToFulfill.length || outOfStock || lowStock ? <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-700" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-700" />}<div><h2 className="text-xs font-bold text-slate-900">Store attention</h2><p className="mt-1 text-[11px] leading-5 text-slate-600">{ordersToFulfill.length ? `${ordersToFulfill.length} order${ordersToFulfill.length === 1 ? " needs" : "s need"} your attention.` : "No orders are waiting for action."} {outOfStock ? `${outOfStock} listing${outOfStock === 1 ? " is" : "s are"} out of stock.` : lowStock ? `${lowStock} listing${lowStock === 1 ? " has" : "s have"} low stock.` : products.length ? "Inventory looks healthy." : "Add your first product to open your store."}</p></div></div>
              {(ordersToFulfill.length > 0 || outOfStock > 0 || lowStock > 0) && <Link to={ordersToFulfill.length ? "/seller/orders" : "/seller/products"} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-800">Take a look <ArrowRight size={13} /></Link>}
            </section>

            <p className="flex items-center gap-2 px-1 text-[10px] leading-5 text-slate-400"><ShoppingBag size={13} /> Preview workspace · data stays on this device.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
