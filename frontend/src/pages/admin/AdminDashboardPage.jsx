import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, AlertTriangle, ArrowDownToLine, BadgePercent, Boxes, CircleOff, Package, Plus, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import { categories, previewProducts } from "../../data/previewProducts";
import { readAllPreviewSellerProducts, updatePreviewSellerProduct } from "../../services/previewSellerData";
import { readPreviewOrders, updatePreviewOrderStatus } from "../../services/previewOrders";
import { addAdminPreviewCategory, addAdminPreviewCoupon, readAdminPreviewCategories, readAdminPreviewCoupons, readAdminPreviewUsers, removeAdminPreviewCoupon, setAdminPreviewUserActive, toggleAdminPreviewCategory, toggleAdminPreviewCoupon } from "../../services/adminPreview";
import { isPreviewAuth } from "../../services/auth";

const sections = {
  "/admin/dashboard": { title: "Marketplace overview", description: "A clear view of listings, orders, stock, and customers." },
  "/admin/products": { title: "Products & inventory", description: "Review marketplace listings and identify stock that needs attention." },
  "/admin/orders": { title: "Order management", description: "Review orders and update their fulfillment status." },
  "/admin/customers": { title: "Customer accounts", description: "Review registered preview accounts and account access." },
  "/admin/coupons": { title: "Coupons & offers", description: "Create and manage promotional codes for the marketplace." },
  "/admin/reports": { title: "Sales & inventory reports", description: "Review marketplace performance and export operational data." },
};
const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];
const normalizedOrderStatus = (status) => {
  const value = String(status || "Pending").toLowerCase();
  if (value.includes("cancel")) return "Cancelled";
  if (value.includes("refund")) return "Refunded";
  if (value.includes("deliver") || value.includes("complete")) return "Delivered";
  if (value.includes("ship")) return "Shipped";
  if (value.includes("process") || value.includes("confirm")) return "Processing";
  return "Pending";
};
const pageClass = "container-custom max-w-7xl py-8 sm:py-10";
const panelClass = "rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,.035)]";
const fieldClass = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10";

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MetricCard({ label, value, detail, icon: Icon, tone = "amber" }) {
  const tones = { amber: "bg-amber-50 text-amber-700", blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", rose: "bg-rose-50 text-rose-700" };
  return <article className={`${panelClass} p-5`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span></div></article>;
}

export default function AdminDashboardPage() {
  const location = useLocation();
  const section = sections[location.pathname] ? location.pathname : "/admin/dashboard";
  const heading = sections[section];
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [couponForm, setCouponForm] = useState({ code: "", discount_type: "percentage", discount_value: "10" });
  const [notice, setNotice] = useState("");
  const [stockThreshold, setStockThreshold] = useState(() => Number(window.localStorage.getItem("campusecom.adminLowStockThreshold.v1")) || 5);

  const products = useMemo(() => [
    ...readAllPreviewSellerProducts().map((product) => ({ ...product, is_sample: false })),
    ...previewProducts.map((product) => ({ ...product, is_active: true, is_approved: true, is_sample: true })),
  ], [revision]);
  const orders = useMemo(() => readPreviewOrders(), [revision]);
  const users = useMemo(() => readAdminPreviewUsers(), [revision]);
  const coupons = useMemo(() => readAdminPreviewCoupons(), [revision]);
  const adminCategories = useMemo(() => readAdminPreviewCategories(categories), [revision]);

  const lowStockProducts = products.filter((product) => Number(product.stock) <= stockThreshold);
  const reportableOrders = orders.filter((order) => !["cancelled", "refunded"].includes(normalizedOrderStatus(order.status).toLowerCase()));
  const totalOrderValue = reportableOrders.reduce((sum, order) => sum + Number(order.total ?? order.subtotal ?? 0), 0);
  const averageOrderValue = reportableOrders.length ? totalOrderValue / reportableOrders.length : 0;
  const topProducts = orders.flatMap((order) => order.items || []).reduce((summary, { product, quantity }) => {
    if (!product) return summary;
    const key = String(product.id || product.name);
    const current = summary.get(key) || { name: product.name || "Product", quantity: 0, value: 0 };
    current.quantity += Number(quantity) || 0;
    current.value += (Number(product.price) || 0) * (Number(quantity) || 0);
    summary.set(key, current);
    return summary;
  }, new Map());
  const filteredProducts = products.filter((product) => `${product.name} ${product.seller_name}`.toLowerCase().includes(search.toLowerCase()));

  const refresh = () => { setRevision((value) => value + 1); setNotice(""); };
  const updateProduct = (product, updates) => {
    if (!product.owner_email || product.is_sample) return;
    updatePreviewSellerProduct(product.owner_email, product.id, updates);
    refresh();
  };
  const updateOrder = (orderId, status) => {
    updatePreviewOrderStatus(orderId, status);
    refresh();
  };
  const handleCouponCreate = (event) => {
    event.preventDefault();
    const value = Number(couponForm.discount_value);
    if (!couponForm.code.trim() || !Number.isFinite(value) || value <= 0 || (couponForm.discount_type === "percentage" && value > 100)) {
      setNotice("Enter a valid code and discount amount.");
      return;
    }
    const result = addAdminPreviewCoupon(couponForm);
    if (result.error) setNotice(result.error);
    else { setCouponForm({ code: "", discount_type: "percentage", discount_value: "10" }); setNotice("Coupon added to this browser preview."); refresh(); }
  };
  const handleCategoryCreate = (event) => {
    event.preventDefault();
    const result = addAdminPreviewCategory(categoryLabel);
    if (result.error) setNotice(result.error);
    else { setCategoryLabel(""); setNotice("Category added to this browser preview."); refresh(); }
  };

  if (!isPreviewAuth) {
    return <div className="grid min-h-[65vh] place-items-center bg-[#fafaf9] px-5"><section className={`${panelClass} max-w-lg p-7 text-center`}><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700"><ShieldCheck size={22} /></span><h1 className="mt-4 text-xl font-semibold text-slate-900">{heading.title}</h1><p className="mt-2 text-sm leading-6 text-slate-600">The administrator interface is ready, but its management data endpoints have not been connected. Switch to preview sign-in to explore the local demo workspace.</p></section></div>;
  }

  return (
    <div className="min-h-[70vh] bg-[#fafaf9]">
      <div className={pageClass}>
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Administrator workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950">{heading.title}</h1><p className="mt-2 text-sm text-slate-500">{heading.description}</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><ShieldCheck size={14} /> Admin access</span>
        </div>

        {isPreviewAuth && <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><p>Preview workspace. Changes are saved in this browser only; production access control and shared data will come from the connected API.</p></div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{notice}</div>}

        {section === "/admin/dashboard" && <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Marketplace listings" value={products.length} detail={`${products.filter((product) => product.is_active !== false).length} active`} icon={Package} />
            <MetricCard label="Orders" value={orders.length} detail={`${orders.filter((order) => !["Delivered", "Completed", "Cancelled", "Refunded"].includes(order.status)).length} need attention`} icon={ShoppingBag} tone="blue" />
            <MetricCard label="Low stock" value={lowStockProducts.length} detail={`${stockThreshold} or fewer available`} icon={Boxes} tone="rose" />
            <MetricCard label="Preview order value" value={`K${totalOrderValue.toLocaleString("en-ZM")}`} detail="From local preview orders" icon={Activity} tone="green" />
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <section className={`${panelClass} p-5 sm:p-6`}><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Stock requiring attention</h2><p className="mt-1 text-xs text-slate-500">Listings at or below the preview threshold.</p></div><Link to="/admin/products" className="text-xs font-semibold text-amber-800 hover:text-amber-900">Manage inventory</Link></div>
              {lowStockProducts.length ? <ul className="mt-4 divide-y divide-slate-100">{lowStockProducts.slice(0, 5).map((product) => <li key={product.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{product.name}</p><p className="mt-0.5 text-xs text-slate-500">{product.seller_name}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${Number(product.stock) === 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>{Number(product.stock) === 0 ? "Out of stock" : `${product.stock} left`}</span></li>)}</ul> : <p className="mt-5 text-sm text-slate-500">No low-stock listings in this preview.</p>}
            </section>
            <section className={`${panelClass} p-5 sm:p-6`}><h2 className="font-semibold text-slate-900">Administration</h2><p className="mt-1 text-xs text-slate-500">Open a workspace to manage marketplace activity.</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">{[["Products & inventory", "/admin/products", Package], ["Order management", "/admin/orders", ShoppingBag], ["Customer accounts", "/admin/customers", Users], ["Coupons & offers", "/admin/coupons", BadgePercent], ["Reports", "/admin/reports", ArrowDownToLine]].map(([label, to, Icon]) => <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50/50"><Icon size={17} className="text-slate-500" />{label}</Link>)}</div></section>
          </div>
        </>}

        {section === "/admin/products" && <div className="space-y-5">
          <section className={`${panelClass} p-5 sm:p-6`}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-900">Product catalogue & stock</h2><p className="mt-1 text-xs text-slate-500">Sample products are view-only. Seller preview listings can be paused and have stock corrected.</p></div><div className="grid gap-2 sm:grid-cols-[minmax(190px,1fr)_145px]"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or seller" aria-label="Search products" className={fieldClass} /><label className="text-[10px] font-semibold text-slate-500">Low-stock threshold<input aria-label="Low-stock threshold" type="number" min="1" value={stockThreshold} onChange={(event) => { const value = Number(event.target.value); if (Number.isInteger(value) && value > 0) { setStockThreshold(value); window.localStorage.setItem("campusecom.adminLowStockThreshold.v1", String(value)); } }} className={`${fieldClass} mt-1`} /></label></div></div>
            <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[690px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="pb-3 pr-4">Product</th><th className="pb-3 pr-4">Seller</th><th className="pb-3 pr-4">Price</th><th className="pb-3 pr-4">Stock</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredProducts.map((product) => <tr key={product.id}><td className="py-3 pr-4"><div className="flex items-center gap-3"><img src={product.image_url || product.images?.[0]} alt="" className="h-11 w-11 rounded-lg object-cover" /><span className="max-w-56 truncate font-semibold text-slate-800">{product.name}</span></div></td><td className="py-3 pr-4 text-slate-600">{product.seller_name || "CampusEcom sample"}</td><td className="py-3 pr-4 font-semibold text-slate-800">K{Number(product.price).toLocaleString("en-ZM")}</td><td className="py-3 pr-4"><label className="sr-only" htmlFor={`stock-${product.id}`}>Stock for {product.name}</label><input id={`stock-${product.id}`} type="number" min="0" defaultValue={product.stock} disabled={product.is_sample} onBlur={(event) => { const stock = Number(event.currentTarget.value); if (Number.isInteger(stock) && stock >= 0 && stock !== Number(product.stock)) updateProduct(product, { stock }); }} className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-sm disabled:bg-slate-50 disabled:text-slate-500" /></td><td className="py-3 pr-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.is_active === false ? "bg-slate-100 text-slate-600" : Number(product.stock) === 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{product.is_active === false ? "Paused" : Number(product.stock) === 0 ? "Out of stock" : "Active"}</span></td><td className="py-3">{!product.is_sample && <button type="button" onClick={() => updateProduct(product, { is_active: product.is_active === false })} className="text-xs font-semibold text-amber-800 hover:text-amber-950">{product.is_active === false ? "Reactivate" : "Pause listing"}</button>}</td></tr>)}</tbody></table></div>
          </section>
          <section className={`${panelClass} p-5 sm:p-6`}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="font-semibold text-slate-900">Categories</h2><p className="mt-1 text-xs text-slate-500">Add or pause catalogue categories in this local preview.</p></div><form onSubmit={handleCategoryCreate} className="flex w-full gap-2 sm:max-w-md"><input value={categoryLabel} onChange={(event) => setCategoryLabel(event.target.value)} required placeholder="New category" className={fieldClass} /><button type="submit" className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white"><Plus size={15} /> Add</button></form></div><div className="mt-4 flex flex-wrap gap-2">{adminCategories.map((category) => <button key={category.id} type="button" onClick={() => { toggleAdminPreviewCategory(category.id); refresh(); }} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${category.is_active === false ? "border-slate-200 bg-slate-50 text-slate-400 line-through" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{category.label}{category.is_active === false ? " · Paused" : " · Active"}</button>)}</div></section>
        </div>}

        {section === "/admin/orders" && <section className={`${panelClass} p-5 sm:p-6`}><div className="flex items-center gap-2"><ShoppingBag size={18} className="text-amber-700" /><div><h2 className="font-semibold text-slate-900">All marketplace orders</h2><p className="mt-1 text-xs text-slate-500">Status changes are saved to this browser preview.</p></div></div>{orders.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[660px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="pb-3 pr-4">Order</th><th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Items</th><th className="pb-3 pr-4">Total</th><th className="pb-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{orders.map((order) => <tr key={order.id}><td className="py-3 pr-4 font-mono text-xs font-semibold text-slate-800">{order.id}</td><td className="py-3 pr-4 text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td><td className="py-3 pr-4 text-slate-600">{order.itemCount || order.items?.length || 0}</td><td className="py-3 pr-4 font-semibold">K{Number(order.total ?? order.subtotal ?? 0).toFixed(2)}</td><td className="py-3"><label className="sr-only" htmlFor={`status-${order.id}`}>Status for order {order.id}</label><select id={`status-${order.id}`} value={normalizedOrderStatus(order.status)} onChange={(event) => updateOrder(order.id, event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold">{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div> : <p className="mt-5 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No preview orders yet. Completed buyer checkouts will appear here.</p>}</section>}

        {section === "/admin/customers" && <section className={`${panelClass} p-5 sm:p-6`}><div><h2 className="font-semibold text-slate-900">Registered accounts</h2><p className="mt-1 text-xs text-slate-500">Preview demo accounts are listed for role review; registered local accounts can be paused.</p></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">Role</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}><td className="py-3 pr-4 font-semibold text-slate-800">{user.first_name} {user.last_name}</td><td className="py-3 pr-4 text-slate-600">{user.email}</td><td className="py-3 pr-4 capitalize text-slate-600">{user.role}</td><td className="py-3 pr-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.is_active === false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{user.is_active === false ? "Paused" : "Active"}</span></td><td className="py-3">{String(user.id).startsWith("preview-") && <button type="button" onClick={() => { setAdminPreviewUserActive(user.id, user.is_active === false); refresh(); }} className="text-xs font-semibold text-amber-800">{user.is_active === false ? "Restore" : "Pause account"}</button>}</td></tr>)}</tbody></table></div></section>}

        {section === "/admin/coupons" && <div className="grid items-start gap-5 lg:grid-cols-[.85fr_1.15fr]"><section className={`${panelClass} p-5 sm:p-6`}><h2 className="font-semibold text-slate-900">Create a coupon</h2><p className="mt-1 text-xs text-slate-500">Preview codes are stored locally; backend rules will validate real use later.</p><form onSubmit={handleCouponCreate} className="mt-5 space-y-3"><label className="block text-xs font-semibold text-slate-700">Coupon code<input required value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value })} placeholder="CAMPUS10" className={`${fieldClass} mt-1.5 uppercase`} /></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-slate-700">Discount type<select value={couponForm.discount_type} onChange={(event) => setCouponForm({ ...couponForm, discount_type: event.target.value })} className={`${fieldClass} mt-1.5`}><option value="percentage">Percent</option><option value="fixed">Fixed amount</option></select></label><label className="block text-xs font-semibold text-slate-700">Value<input type="number" min="1" max={couponForm.discount_type === "percentage" ? 100 : undefined} required value={couponForm.discount_value} onChange={(event) => setCouponForm({ ...couponForm, discount_value: event.target.value })} className={`${fieldClass} mt-1.5`} /></label></div><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white"><Plus size={16} /> Create coupon</button></form></section><section className={`${panelClass} p-5 sm:p-6`}><h2 className="font-semibold text-slate-900">Coupon codes</h2><ul className="mt-4 divide-y divide-slate-100">{coupons.map((coupon) => <li key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-mono text-sm font-bold text-slate-900">{coupon.code}</p><p className="mt-1 text-xs text-slate-500">{coupon.discount_type === "percentage" ? `${coupon.discount_value}% off` : `K${coupon.discount_value} off`}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => { toggleAdminPreviewCoupon(coupon.id); refresh(); }} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${coupon.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{coupon.is_active ? "Active" : "Paused"}</button><button type="button" onClick={() => { removeAdminPreviewCoupon(coupon.id); refresh(); }} aria-label={`Delete ${coupon.code}`} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50">Delete</button></div></li>)}</ul></section></div>}

        {section === "/admin/reports" && <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Preview order value" value={`K${totalOrderValue.toLocaleString("en-ZM")}`} detail="Excludes cancelled/refunded orders" icon={Activity} tone="green" /><MetricCard label="Orders placed" value={orders.length} detail="All preview orders" icon={ShoppingBag} tone="blue" /><MetricCard label="Average order value" value={`K${averageOrderValue.toLocaleString("en-ZM", { maximumFractionDigits: 2 })}`} detail="Based on non-cancelled orders" icon={Activity} /><MetricCard label="Stock alerts" value={lowStockProducts.length} detail={`At or below ${stockThreshold} units`} icon={AlertTriangle} tone="rose" /></div><section className={`${panelClass} p-5 sm:p-6`}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-900">Export reports</h2><p className="mt-1 text-xs text-slate-500">Download CSV reports, or print and choose Save as PDF. Live reports depend on the connected backend.</p></div><span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><CircleOff size={14} /> Preview data</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><button type="button" onClick={() => downloadCsv("campusecom-sales-report.csv", [["Order ID", "Date", "Status", "Items", "Total (ZMW)"], ...orders.map((order) => [order.id, order.createdAt, order.status, order.itemCount || order.items?.length || 0, order.total ?? order.subtotal])])} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/40"><span><span className="block text-sm font-semibold text-slate-800">Sales summary</span><span className="mt-1 block text-xs text-slate-500">Order value, counts, and status</span></span><ArrowDownToLine size={17} className="text-slate-500" /></button><button type="button" onClick={() => downloadCsv("campusecom-inventory-report.csv", [["Product", "Seller", "Category", "Stock", "Status"], ...products.map((product) => [product.name, product.seller_name || "CampusEcom sample", product.category, product.stock, Number(product.stock) === 0 ? "Out of stock" : Number(product.stock) <= stockThreshold ? "Low stock" : "In stock"])])} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/40"><span><span className="block text-sm font-semibold text-slate-800">Inventory status</span><span className="mt-1 block text-xs text-slate-500">Stock levels and low-stock items</span></span><ArrowDownToLine size={17} className="text-slate-500" /></button><button type="button" onClick={() => downloadCsv("campusecom-top-products.csv", [["Product", "Units sold", "Order value (ZMW)"], ...[...topProducts.values()].sort((a, b) => b.quantity - a.quantity).map((product) => [product.name, product.quantity, product.value])])} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/40"><span><span className="block text-sm font-semibold text-slate-800">Top products</span><span className="mt-1 block text-xs text-slate-500">Units and order value per product</span></span><ArrowDownToLine size={17} className="text-slate-500" /></button><button type="button" onClick={() => window.print()} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/40"><span><span className="block text-sm font-semibold text-slate-800">Print / Save as PDF</span><span className="mt-1 block text-xs text-slate-500">Use your browser’s PDF destination</span></span><ArrowDownToLine size={17} className="text-slate-500" /></button></div></section></div>}
        {section === "/admin/reports" && <section id="admin-report-print" className="hidden print:block"><p className="text-xs font-bold uppercase tracking-[.14em]">CampusEcom · Administrator report</p><h1 className="mt-2 text-2xl font-bold">Sales & inventory report</h1><p className="mt-1 text-sm">Generated {new Date().toLocaleString()}</p><div className="mt-6 grid grid-cols-3 gap-4"><div><strong>Order value</strong><p>K{totalOrderValue.toFixed(2)}</p></div><div><strong>Orders</strong><p>{orders.length}</p></div><div><strong>Average order value</strong><p>K{averageOrderValue.toFixed(2)}</p></div></div><h2 className="mt-8 text-lg font-bold">Sales summary</h2><table className="mt-3 w-full border-collapse text-left text-xs"><thead><tr><th className="border p-2">Order</th><th className="border p-2">Date</th><th className="border p-2">Status</th><th className="border p-2">Items</th><th className="border p-2">Total (ZMW)</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td className="border p-2">{order.id}</td><td className="border p-2">{new Date(order.createdAt).toLocaleDateString()}</td><td className="border p-2">{normalizedOrderStatus(order.status)}</td><td className="border p-2">{order.itemCount || order.items?.length || 0}</td><td className="border p-2">{Number(order.total ?? order.subtotal ?? 0).toFixed(2)}</td></tr>)}</tbody></table><h2 className="mt-8 text-lg font-bold">Inventory status</h2><table className="mt-3 w-full border-collapse text-left text-xs"><thead><tr><th className="border p-2">Product</th><th className="border p-2">Seller</th><th className="border p-2">Stock</th><th className="border p-2">Status</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td className="border p-2">{product.name}</td><td className="border p-2">{product.seller_name || "CampusEcom sample"}</td><td className="border p-2">{product.stock}</td><td className="border p-2">{Number(product.stock) === 0 ? "Out of stock" : Number(product.stock) <= stockThreshold ? "Low stock" : "In stock"}</td></tr>)}</tbody></table></section>}
      </div>
    </div>
  );
}
