import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, MapPin, PackageCheck, ShoppingBag, X } from "lucide-react";
import { cancelPreviewOrder, getPreviewBuyerOrderStatus, readPreviewOrders } from "../../services/previewOrders";
import PremiumBreadcrumb from "../../components/common/PremiumBreadcrumb";
import { getProductPrimaryImage } from "../../utils/productImages";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { formatMoney } from "../../services/currency";

const paymentLabels = {
  "meetup-cash": "Cash at meetup",
  "mtn-momo": "MTN Mobile Money",
  "airtel-money": "Airtel Money",
  "bank-transfer": "Bank transfer",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [, setRevision] = useState(0);
  const orders = readPreviewOrders().filter((order) => order.buyerEmail?.toLowerCase() === user?.email?.toLowerCase());
  const cancelOrder = (order) => {
    if (!window.confirm(`Cancel order ${order.id}?`)) return;
    const result = cancelPreviewOrder(order.id, user?.email);
    if (result.error) toast.error(result.error);
    else { toast.success("Order cancelled."); setRevision((revision) => revision + 1); }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom pt-8 sm:pt-10">
        <PremiumBreadcrumb items={[{ label: "Home", to: "/" }, { label: "Order history" }]} />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-amber-700">Your campus purchases</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950">Order history</h1><p className="mt-2 text-sm text-slate-500">Review the order previews saved on this device.</p></div>
          <Link to="/products" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-amber-700">Explore marketplace <ArrowRight size={15} /></Link>
        </div>

        {orders.length === 0 ? (
          <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white px-5 py-14 text-center sm:py-16">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-amber-50 text-amber-700"><ShoppingBag size={25} /></span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">When you place a preview order, it will appear here with its items and meetup details.</p>
            <Link to="/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800">Browse listings <ArrowRight size={15} /></Link>
          </section>
        ) : (
          <ul className="mt-7 space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
                  <div><Link to={`/orders/${order.id}`} className="font-mono text-xs font-bold text-slate-900 transition hover:text-amber-700">{order.id} <span aria-hidden="true">→</span></Link><p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><Clock3 size={12} />{new Date(order.createdAt).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                  <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-800"><PackageCheck size={13} />{getPreviewBuyerOrderStatus(order)}</span>{getPreviewBuyerOrderStatus(order).toLowerCase().includes("pending") && <button type="button" onClick={() => cancelOrder(order)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-50"><X size={12} /> Cancel</button>}</div>
                </div>
                <div className="divide-y divide-slate-100 px-4 sm:px-6">
                  {order.items.map(({ product, quantity }, index) => <div key={`${order.id}-${product.id}-${index}`} className="flex items-center gap-3 py-4"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100"><img src={getProductPrimaryImage(product)} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><Link to={`/products/${product.id}`} className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-amber-700">{product.name}</Link><p className="mt-1 text-xs text-slate-500">{product.seller_name} · Qty {quantity}</p></div><span className="shrink-0 text-sm font-bold text-slate-900">{formatMoney(Number(product.price) * quantity)}</span></div>)}
                </div>
                <div className="grid gap-3 border-t border-slate-100 bg-white px-4 py-4 text-xs sm:grid-cols-2 sm:px-6">
                  <div className="flex items-start gap-2 text-slate-600"><MapPin size={14} className="mt-0.5 shrink-0 text-amber-700" /><span><span className="font-semibold text-slate-800">Meetup</span><br />{order.meetupLocation}{order.meetupNotes ? ` · ${order.meetupNotes}` : ""}</span></div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end"><span className="text-slate-500">{paymentLabels[order.paymentPreference] || "Payment preference saved"}</span><span className="font-bold text-slate-950">Total {formatMoney(order.total ?? order.subtotal)}</span></div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 text-center text-[11px] text-slate-400">Preview order history and seller status updates are stored locally on this device.</p>
      </div>
    </div>
  );
}
