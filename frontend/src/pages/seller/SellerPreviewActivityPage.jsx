import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Check, ClipboardList, Package, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { readPreviewSellerOrders, updatePreviewSellerOrderStatus } from "../../services/previewSellerData";
import { getProductPrimaryImage } from "../../utils/productImages";
import toast from "react-hot-toast";

export default function SellerPreviewActivityPage({ kind }) {
  const { user } = useAuth();
  const [sellerOrders, setSellerOrders] = useState(() => readPreviewSellerOrders(user?.email));
  const isOrders = kind === "orders";
  const visibleOrders = isOrders ? sellerOrders : sellerOrders.filter((order) => String(order.status).toLowerCase() === "completed");
  const revenue = visibleOrders.reduce((sum, order) => sum + Number(order.sellerSubtotal || 0), 0);
  const Icon = isOrders ? ClipboardList : BarChart3;
  const title = isOrders ? "Orders" : "Sales";
  const description = isOrders
    ? "Buyer orders that include your listings are collected here for fulfillment."
    : "Completed preview orders appear here after you mark them fulfilled.";

  const setOrderStatus = (order, status) => {
    if (!updatePreviewSellerOrderStatus(user?.email, order.id, status)) {
      toast.error("Could not update this order");
      return;
    }
    setSellerOrders(readPreviewSellerOrders(user?.email));
    toast.success(`Order marked ${status.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom max-w-6xl pt-8 sm:pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Seller workspace</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-semibold tracking-[-.05em] text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{isOrders ? "Review and manage buyer orders." : "Track completed sales and store performance."}</p></div>
          {!isOrders && <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Preview revenue</p><p className="mt-1 text-lg font-bold text-slate-950">K{revenue.toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</p></div>}
        </div>

        {visibleOrders.length ? (
          <section className="mt-7 space-y-3">
            {visibleOrders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-mono text-xs font-bold text-slate-900">{order.id}</p><p className="mt-1 text-[11px] text-slate-500">{new Date(order.createdAt).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })} · Preview buyer</p></div>
                  <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${order.status === "Completed" ? "bg-emerald-50 text-emerald-800" : order.status === "Cancelled" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>{order.status}</span>
                </div>
                <ul className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
                  {order.items.map(({ product, quantity }, index) => (
                    <li key={`${order.id}-${product.id}-${index}`} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-3"><img src={getProductPrimaryImage(product)} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 object-cover" /><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{product.name}</p><p className="mt-1 text-[10px] text-slate-500">Quantity {quantity}</p></div></div>
                      <span className="shrink-0 text-xs font-bold text-slate-900">K{(Number(product.price) * quantity).toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs"><span className="text-slate-500">Meetup: {order.meetupLocation}</span><span className="font-bold text-slate-900">{isOrders ? "Order total" : "Sale total"} K{Number(order.sellerSubtotal).toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</span></div>
                {isOrders && order.status !== "Completed" && order.status !== "Cancelled" && <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">{order.status.toLowerCase().includes("pending") && <button type="button" onClick={() => setOrderStatus(order, "Confirmed")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"><Check size={14} /> Confirm order</button>}<button type="button" onClick={() => setOrderStatus(order, "Completed")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"><Check size={14} /> Mark completed</button><button type="button" onClick={() => setOrderStatus(order, "Cancelled")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"><X size={14} /> Cancel</button></div>}
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
