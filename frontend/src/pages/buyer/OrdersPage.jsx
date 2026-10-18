import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, MapPin, PackageCheck, ShoppingBag, X } from "lucide-react";
import { cancelPreviewOrder, getPreviewBuyerOrderStatus, readPreviewOrders } from "../../services/previewOrders";
import PremiumBreadcrumb from "../../components/common/PremiumBreadcrumb";
import { getProductPrimaryImage } from "../../utils/productImages";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { formatMoney } from "../../services/currency";
import api from "../../services/api";
import { isPreviewAuth } from "../../services/auth";
import { getOrderStatusTone } from "../../utils/orderStatusTone";

const paymentLabels = {
  "meetup-cash": "Cash at meetup",
  "mtn-momo": "MTN Mobile Money",
  "airtel-money": "Airtel Money",
  "bank-transfer": "Bank transfer",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);
  const [apiOrders, setApiOrders] = useState([]);
  const [loading, setLoading] = useState(!isPreviewAuth);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  useEffect(() => {
    const refreshOrders = () => setRevision((value) => value + 1);
    window.addEventListener("campusecom:preview-orders-change", refreshOrders);
    window.addEventListener("storage", refreshOrders);
    return () => {
      window.removeEventListener("campusecom:preview-orders-change", refreshOrders);
      window.removeEventListener("storage", refreshOrders);
    };
  }, []);
  useEffect(() => {
    if (isPreviewAuth) return undefined;
    let active = true;
    api.get("/orders/my-orders/").then((response) => {
      const data = response.data.results || response.data;
      if (!active) return;
      setApiOrders((Array.isArray(data) ? data : []).map((order) => ({
        ...order,
        status: order.status_display || order.status,
        createdAt: order.created_at,
        meetupLocation: order.meetup_location,
        meetupNotes: order.meetup_notes,
        total: order.total_price,
        subtotal: order.total_price,
        paymentPreference: order.payment?.payment_method || "",
        paymentStatus: order.payment?.status_display || order.payment?.status || "",
        items: [{
          product: { id: order.product, name: order.product_name, image_url: order.product_image, seller_name: order.seller_name, price: order.unit_price },
          quantity: order.quantity,
        }],
      })));
    }).catch(() => toast.error("Could not load your order history")).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const orders = useMemo(() => isPreviewAuth
    ? readPreviewOrders().filter((order) => order.buyerEmail?.toLowerCase() === user?.email?.toLowerCase())
    : apiOrders, [user?.email, revision, apiOrders]);
  const visibleOrders = useMemo(() => orders.filter((order) => {
    const status = String(isPreviewAuth ? getPreviewBuyerOrderStatus(order) : order.status || "").toLowerCase();
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "active" && !["completed", "cancelled", "refunded"].some((value) => status.includes(value)))
      || (statusFilter === "completed" && (status.includes("completed") || status.includes("delivered")))
      || (statusFilter === "cancelled" && (status.includes("cancelled") || status.includes("refunded")));
    const query = orderSearch.trim().toLowerCase();
    const matchesQuery = !query || `${order.id} ${(order.items || []).map(({ product }) => product?.name).join(" ")}`.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  }), [orders, orderSearch, statusFilter]);
  const cancelOrder = (order) => {
    if (!window.confirm(`Cancel order ${order.id}?`)) return;
    if (!isPreviewAuth) {
      api.post(`/orders/${order.id}/cancel/`, { reason: "Cancelled by buyer" }).then(() => {
        toast.success("Order cancelled.");
        setApiOrders((current) => current.map((item) => String(item.id) === String(order.id) ? { ...item, status: "Cancelled", can_cancel: false } : item));
      }).catch(() => toast.error("Could not cancel this order"));
      return;
    }
    const result = cancelPreviewOrder(order.id, user?.email);
    if (result.error) toast.error(result.error);
    else { toast.success("Order cancelled."); setRevision((revision) => revision + 1); }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom pt-8 sm:pt-10">
        <PremiumBreadcrumb items={[{ label: "Home", to: "/" }, { label: "Order history" }]} />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-amber-700">Your campus purchases</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950">Order history</h1><p className="mt-2 text-sm text-slate-500">{isPreviewAuth ? "Review the order previews saved on this device." : "Review your purchases and follow their pickup status."}</p></div>
          <Link to="/products" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-amber-700">Explore marketplace <ArrowRight size={15} /></Link>
        </div>

        {!loading && orders.length > 0 && <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-4"><label className="relative"><span className="sr-only">Search orders</span><input type="search" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search order number or product" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-amber-400 focus:bg-white" /></label><label className="sr-only" htmlFor="order-status-filter">Filter orders by status</label><select id="order-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"><option value="all">All orders</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>}

        {loading ? <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading your orders...</section> : orders.length === 0 ? (
          <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white px-5 py-14 text-center sm:py-16">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-amber-50 text-amber-700"><ShoppingBag size={25} /></span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">When you place an order, it will appear here with its items and meetup details.</p>
            <Link to="/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800">Browse listings <ArrowRight size={15} /></Link>
          </section>
        ) : visibleOrders.length === 0 ? <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><h2 className="font-semibold text-slate-900">No orders match</h2><p className="mt-2 text-sm text-slate-500">Try another search or choose a different status.</p><button type="button" onClick={() => { setOrderSearch(""); setStatusFilter("all"); }} className="mt-4 text-sm font-semibold text-amber-800">Clear search and filters</button></section> : (
          <ul className="mt-7 space-y-4">
            {visibleOrders.map((order) => (
              <li key={order.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
                  <div><Link to={`/orders/${order.id}`} className="font-mono text-xs font-bold text-slate-900 transition hover:text-amber-700">{order.id} <span aria-hidden="true">→</span></Link><p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><Clock3 size={12} />{new Date(order.createdAt).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                  <div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${getOrderStatusTone(isPreviewAuth ? getPreviewBuyerOrderStatus(order) : order.status)}`}><PackageCheck size={13} />{isPreviewAuth ? getPreviewBuyerOrderStatus(order) : order.status}</span>{(isPreviewAuth ? getPreviewBuyerOrderStatus(order).toLowerCase().includes("pending") : order.can_cancel) && <button type="button" onClick={() => cancelOrder(order)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-50"><X size={12} /> Cancel</button>}</div>
                </div>
                <div className="divide-y divide-slate-100 px-4 sm:px-6">
                  {order.items.map(({ product, quantity }, index) => <div key={`${order.id}-${product.id}-${index}`} className="flex items-center gap-3 py-4"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100"><img src={getProductPrimaryImage(product)} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><Link to={`/products/${product.id}`} className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-amber-700">{product.name}</Link><p className="mt-1 text-xs text-slate-500">{product.seller_name} · Qty {quantity}</p></div><span className="shrink-0 text-sm font-bold text-slate-900">{formatMoney(Number(product.price) * quantity)}</span></div>)}
                </div>
                <div className="grid gap-3 border-t border-slate-100 bg-white px-4 py-4 text-xs sm:grid-cols-2 sm:px-6">
                  <div className="flex items-start gap-2 text-slate-600"><MapPin size={14} className="mt-0.5 shrink-0 text-amber-700" /><span><span className="font-semibold text-slate-800">Meetup</span><br />{order.meetupLocation}{order.meetupNotes ? ` · ${order.meetupNotes}` : ""}</span></div>
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end"><span className="text-slate-500">{paymentLabels[order.paymentPreference] || "Payment preference saved"}{(order.paymentStatus || order.paymentDispute) && <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">{order.paymentStatus || `Dispute ${order.paymentDispute.status}`}</span>}</span><span className="font-bold text-slate-950">Total {formatMoney(order.total ?? order.subtotal)}</span><Link to={`/orders/${order.id}`} className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-950 transition hover:bg-amber-200">Track order <ArrowRight size={13} /></Link></div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 text-center text-[11px] text-slate-400">{isPreviewAuth ? "Preview order history and seller status updates are stored locally on this device." : "Order tracking is updated by the buyer and seller as the exchange progresses."}</p>
      </div>
    </div>
  );
}
