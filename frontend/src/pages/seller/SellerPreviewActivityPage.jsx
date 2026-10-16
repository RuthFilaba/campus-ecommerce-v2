import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Check, ClipboardList, Package, ShieldCheck, Wallet, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { readPreviewSellerOrders, updatePreviewSellerOrderStatus, updatePreviewSellerOrderTracking } from "../../services/previewSellerData";
import { confirmPreviewCodCollection } from "../../services/previewOrders";
import { getProductPrimaryImage } from "../../utils/productImages";
import toast from "react-hot-toast";
import { formatMoney } from "../../services/currency";
import OrderTrackingTimeline from "../../components/order/OrderTrackingTimeline";
import { getOrderStatusTone } from "../../utils/orderStatusTone";

export default function SellerPreviewActivityPage({ kind }) {
  const { user } = useAuth();
  const [sellerOrders, setSellerOrders] = useState(() => readPreviewSellerOrders(user?.email));
  const [trackingNotes, setTrackingNotes] = useState(() => Object.fromEntries(readPreviewSellerOrders(user?.email).map((order) => [order.id, order.tracking?.note || ""])));
  const [collectionAmounts, setCollectionAmounts] = useState(() => Object.fromEntries(readPreviewSellerOrders(user?.email).map((order) => [order.id, String(order.sellerSubtotal || "")])));
  useEffect(() => {
    const refreshOrders = () => {
      const nextOrders = readPreviewSellerOrders(user?.email);
      setSellerOrders(nextOrders);
      setTrackingNotes(Object.fromEntries(nextOrders.map((order) => [order.id, order.tracking?.note || ""])));
      setCollectionAmounts((current) => Object.fromEntries(nextOrders.map((order) => [order.id, current[order.id] ?? String(order.sellerSubtotal || "")])));
    };
    window.addEventListener("campusecom:preview-orders-change", refreshOrders);
    window.addEventListener("storage", refreshOrders);
    return () => {
      window.removeEventListener("campusecom:preview-orders-change", refreshOrders);
      window.removeEventListener("storage", refreshOrders);
    };
  }, [user?.email]);
  const isOrders = kind === "orders";
  const visibleOrders = isOrders ? sellerOrders : sellerOrders.filter((order) => ["completed", "delivered"].includes(String(order.status).toLowerCase()));
  const revenue = visibleOrders.reduce((sum, order) => sum + Number(order.sellerSubtotal || 0), 0);
  const Icon = isOrders ? ClipboardList : BarChart3;
  const title = isOrders ? "Orders" : "Sales";
  const description = isOrders
    ? "Buyer orders that include your listings are collected here for fulfillment."
    : "Completed preview orders appear here after you mark them fulfilled.";

  const setOrderStatus = (order, status) => {
    const result = updatePreviewSellerOrderStatus(user?.email, order.id, status);
    if (!result?.success) {
      toast.error(result?.error || "Could not update this order");
      return;
    }
    setSellerOrders(readPreviewSellerOrders(user?.email));
    toast.success(`Order marked ${status.toLowerCase()}`);
  };

  const nextStatus = (status) => {
    const current = String(status).toLowerCase();
    if (current.includes("pending")) return { value: "Confirmed", label: "Confirm order" };
    if (current.includes("confirm")) return { value: "Processing", label: "Start preparing" };
    if (current.includes("process") || current.includes("prepar")) return { value: "Ready for pickup", label: "Mark ready for pickup" };
    if (current.includes("ready")) return { value: "Delivered", label: "Mark delivered" };
    return null;
  };

  const saveTrackingNote = (order) => {
    const result = updatePreviewSellerOrderTracking(user?.email, order.id, { note: trackingNotes[order.id] || "" });
    if (!result?.success) {
      toast.error(result?.error || "Could not save the buyer update");
      return;
    }
    setSellerOrders(readPreviewSellerOrders(user?.email));
    toast.success("Tracking update shared with the buyer");
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom max-w-6xl pt-8 sm:pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Seller workspace</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-semibold tracking-[-.05em] text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{isOrders ? "Review and manage buyer orders." : "Track completed sales and store performance."}</p></div>
          {!isOrders && <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Preview revenue</p><p className="mt-1 text-lg font-bold text-slate-950">{formatMoney(revenue)}</p></div>}
        </div>

        {visibleOrders.length ? (
          <section className="mt-7 space-y-3">
            {visibleOrders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-mono text-xs font-bold text-slate-900">{order.id}</p><p className="mt-1 text-[11px] text-slate-500">{new Date(order.createdAt).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })} · Preview buyer</p></div>
                  <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getOrderStatusTone(order.status)}`}>{order.status}</span>
                </div>
                <ul className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
                  {order.items.map(({ product, quantity }, index) => (
                    <li key={`${order.id}-${product.id}-${index}`} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-3"><img src={getProductPrimaryImage(product)} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 object-cover" /><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{product.name}</p><p className="mt-1 text-[10px] text-slate-500">Quantity {quantity}</p></div></div>
                      <span className="shrink-0 text-xs font-bold text-slate-900">{formatMoney(Number(product.price) * quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs"><span className="text-slate-500">Meetup: {order.meetupLocation}</span><span className="font-bold text-slate-900">{isOrders ? "Order total" : "Sale total"} {formatMoney(order.sellerSubtotal)}</span></div>
                {isOrders && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"><div className="flex flex-wrap items-center gap-2"><Wallet size={15} className="text-slate-500" /><span className="text-xs font-semibold text-slate-700">Payment</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${order.paymentStatus === "Verified" ? "bg-emerald-50 text-emerald-800" : order.paymentStatus === "Disputed" || order.paymentStatus === "Verification Failed" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>{order.paymentStatus || (order.paymentPreference === "meetup-cash" ? "Awaiting Collection" : "Awaiting Payment")}</span><span className="text-[11px] text-slate-500">{order.paymentPreference === "meetup-cash" ? "Cash on delivery" : order.paymentReference ? `Ref: ${order.paymentReference}` : "Prepaid"}</span></div>{order.paymentPreference === "meetup-cash" && order.status.toLowerCase().includes("deliver") && order.paymentStatus !== "Verified" && !order.codCollections?.[String(user?.email || "").toLowerCase()] && <div className="flex items-end gap-2"><label className="text-[10px] font-semibold text-slate-600">Collected amount<input type="number" min="0" step="0.01" value={collectionAmounts[order.id] || ""} onChange={(event) => setCollectionAmounts((current) => ({ ...current, [order.id]: event.target.value }))} className="mt-1 h-8 w-28 rounded-lg border border-slate-200 px-2 text-xs" /></label><button type="button" onClick={() => { const result = confirmPreviewCodCollection(order.id, user?.email, collectionAmounts[order.id]); if (result.error) toast.error(result.error); else { setSellerOrders(readPreviewSellerOrders(user?.email)); toast.success("COD collection confirmed"); } }} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50"><ShieldCheck size={13} /> Confirm collected</button></div>}</div>}
                {isOrders && <div className="mt-4"><OrderTrackingTimeline status={order.status} events={order.tracking?.events} note={order.tracking?.note} meetupLocation={order.meetupLocation} compact /></div>}
                {isOrders && !["delivered", "completed", "cancelled", "refunded"].includes(order.status.toLowerCase()) && <div className="mt-4 space-y-3 border-t border-slate-100 pt-3"><label className="block text-xs font-semibold text-slate-700">Tracking update for buyer<textarea rows={2} value={trackingNotes[order.id] || ""} onChange={(event) => setTrackingNotes((notes) => ({ ...notes, [order.id]: event.target.value }))} placeholder="Share a preparation or pickup update" className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label><div className="flex flex-wrap justify-end gap-2">{nextStatus(order.status) && <button type="button" onClick={() => setOrderStatus(order, nextStatus(order.status).value)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-400 px-3 text-xs font-semibold text-slate-950 transition hover:bg-amber-300"><Check size={14} /> {nextStatus(order.status).label}</button>}<button type="button" onClick={() => saveTrackingNote(order)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Save buyer update</button>{order.status.toLowerCase().includes("pending") && <button type="button" onClick={() => setOrderStatus(order, "Cancelled")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"><X size={14} /> Cancel</button>}</div></div>}
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white px-5 py-14 text-center sm:py-16"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700"><Icon size={23} /></span><h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{isOrders ? "No orders to manage yet" : "No sales activity yet"}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p><Link to="/seller/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"><Package size={15} /> Review your listings <ArrowRight size={15} /></Link></section>
        )}
        <p className="mt-4 text-center text-[11px] text-slate-400">Preview workspace · no buyer, order, or payment data is sent or generated.</p>
      </div>
    </div>
  );
}
