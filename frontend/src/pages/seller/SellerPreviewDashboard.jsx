import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CircleDollarSign, ClipboardList, Package, Plus, ShieldCheck, Store } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { readPreviewSellerOrders, readPreviewSellerProducts } from "../../services/previewSellerData";
import { getProductPrimaryImage } from "../../utils/productImages";

const formatMoney = (value) => `K${Number(value || 0).toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SellerPreviewDashboard() {
  const { user } = useAuth();
  const products = readPreviewSellerProducts(user?.email);
  const orders = readPreviewSellerOrders(user?.email);
  const activeProducts = products.filter((product) => product.is_active && Number(product.stock) > 0);
  const outOfStock = products.filter((product) => Number(product.stock) === 0).length;
  const pendingOrders = orders.filter((order) => String(order.status).toLowerCase().includes("pending")).length;
  const completedOrders = orders.filter((order) => String(order.status).toLowerCase() === "completed");
  const revenue = completedOrders.reduce((sum, order) => sum + order.sellerSubtotal, 0);
  const stats = [
    { label: "Active listings", value: activeProducts.length, note: `${products.length} total listings`, icon: Package, color: "bg-amber-50 text-amber-700" },
    { label: "Orders to fulfill", value: pendingOrders, note: `${orders.length} total buyer orders`, icon: ClipboardList, color: "bg-blue-50 text-blue-700" },
    { label: "Sales completed", value: completedOrders.length, note: "Based on preview orders", icon: BarChart3, color: "bg-emerald-50 text-emerald-700" },
    { label: "Revenue", value: formatMoney(revenue), note: "Completed preview orders", icon: CircleDollarSign, color: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom max-w-7xl pt-8 sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Seller workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950 sm:text-[36px]">Good to see you, {user?.first_name || "seller"}.</h1><p className="mt-2 text-sm text-slate-500">A clear view of your campus store, listings, and activity.</p></div>
          <Link to="/seller/products/create" className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"><Plus size={16} /> Add a listing</Link>
        </div>

        <section className="mt-7 overflow-hidden rounded-[24px] bg-slate-950 p-6 text-white sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl"><span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-amber-300"><Store size={13} /> Preview store</span><h2 className="mt-4 text-2xl font-semibold tracking-[-.04em] sm:text-[28px]">Your seller workspace is ready.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Create and manage sample listings here. Orders and revenue will appear after the backend is connected.</p></div>
            <div className="flex flex-wrap gap-2"><Link to="/seller/products" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-slate-950 transition hover:bg-slate-100">Manage listings <ArrowRight size={14} /></Link><Link to="/seller/settings" className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-xs font-semibold text-white transition hover:bg-white/10">Store settings</Link></div>
          </div>
          <div className="mt-6 flex items-start gap-2.5 border-t border-white/10 pt-4 text-[11px] leading-5 text-slate-400"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" /><span>This is local preview data saved in this browser. It is visible only to the signed-in preview seller account.</span></div>
        </section>

        <section aria-label="Store summary" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-500">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}><Icon size={17} /></span></div><p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></article>)}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-sm font-bold text-slate-900">Recent listings</h2><p className="mt-1 text-xs text-slate-500">The latest items in your store.</p></div><Link to="/seller/products" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition hover:text-amber-700">View all <ArrowRight size={13} /></Link></div>
            {products.length ? <ul className="divide-y divide-slate-100">{products.slice(0, 4).map((product) => <li key={product.id} className="flex items-center gap-3 px-5 py-4 sm:px-6"><div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-amber-50"><img src={getProductPrimaryImage(product, `https://placehold.co/80x80/fef3c7/92400e?text=${product.name?.charAt(0) || "P"}`)} alt={product.name} className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{product.name}</p><p className="mt-1 text-[11px] text-slate-500">{Number(product.stock)} in stock</p></div><span className="text-sm font-bold text-slate-900">{formatMoney(product.price)}</span></li>)}</ul> : <div className="px-6 py-10 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-slate-400"><Package size={20} /></span><h3 className="mt-4 text-sm font-bold text-slate-900">Your store is ready for its first listing</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">Add a product to start building your storefront for students.</p><Link to="/seller/products/create" className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-amber-400 px-3 text-xs font-bold text-slate-950 transition hover:bg-amber-300"><Plus size={14} /> Create listing</Link></div>}
          </section>

          <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6"><h2 className="text-sm font-bold text-slate-900">Store checklist</h2><p className="mt-1 text-xs leading-5 text-slate-500">A few details help buyers shop with confidence.</p><ul className="mt-5 space-y-4 text-xs"><li className="flex items-start gap-2.5"><span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">✓</span><span><strong className="font-semibold text-slate-800">Create your first listing</strong><span className="mt-0.5 block text-slate-500">Add a clear title, price, and stock.</span></span></li><li className="flex items-start gap-2.5"><span className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full ${user?.phone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{user?.phone ? "✓" : "2"}</span><span><strong className="font-semibold text-slate-800">Complete your contact details</strong><span className="mt-0.5 block text-slate-500">Make it easier to arrange campus meetups.</span></span></li><li className="flex items-start gap-2.5"><span className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full ${outOfStock === 0 && products.length ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{outOfStock === 0 && products.length ? "✓" : "3"}</span><span><strong className="font-semibold text-slate-800">Keep stock up to date</strong><span className="mt-0.5 block text-slate-500">Accurate availability avoids missed sales.</span></span></li></ul><Link to="/seller/settings" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 transition hover:text-amber-950">Review store settings <ArrowRight size={13} /></Link></aside>
        </div>
      </div>
    </div>
  );
}
