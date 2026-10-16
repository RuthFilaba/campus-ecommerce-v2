import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { readPreviewSellerOrders } from "../../services/previewSellerData";
import { isPreviewAuth } from "../../services/auth";
import { formatMoney } from "../../services/currency";
import { Wallet } from "lucide-react";

const paymentStatus = (order) => order.paymentStatus || order.payment?.status || (order.paymentPreference === "meetup-cash" ? "Awaiting Collection" : "Awaiting Payment");

export default function SellerPaymentsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(() => isPreviewAuth ? readPreviewSellerOrders(user?.email) : []);
  const [loading, setLoading] = useState(!isPreviewAuth);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPreviewAuth) {
      const refresh = () => setOrders(readPreviewSellerOrders(user?.email));
      window.addEventListener("campusecom:preview-orders-change", refresh);
      window.addEventListener("storage", refresh);
      return () => {
        window.removeEventListener("campusecom:preview-orders-change", refresh);
        window.removeEventListener("storage", refresh);
      };
    }
    api.get("/orders/my-sales/")
      .then(({ data }) => setOrders(data.results || data || []))
      .catch(() => setError("Payments will appear here when the seller payment endpoint is connected."))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const pending = orders.filter((order) => ["Awaiting Payment", "Awaiting Verification", "Awaiting Collection", "Disputed", "Verification Failed"].includes(paymentStatus(order)));
  return <div className="min-h-[65vh] bg-[#fafaf9] pb-16"><div className="container-custom max-w-6xl pt-8 sm:pt-10">
    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Seller workspace</p>
    <div className="mt-1 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-[-.05em] text-slate-950">Payments</h1><p className="mt-2 text-sm text-slate-500">View payment progress for orders containing your listings.</p></div><div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Needs follow-up</p><p className="mt-1 text-lg font-bold text-slate-950">{pending.length}</p></div></div>
    <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs leading-5 text-blue-900"><Wallet size={15} className="mt-0.5 shrink-0" /><p>Prepaid transactions are verified by an administrator. A transaction reference alone does not authorize dispatch. For cash on delivery, confirm collection only after receiving the money.</p></div>
    {loading ? <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading payment records…</p> : error ? <p role="status" className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">{error}</p> : orders.length ? <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Order</th><th className="px-5 py-3">Payment method</th><th className="px-5 py-3">Your order value</th><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Payment status</th></tr></thead><tbody className="divide-y divide-slate-100">{orders.map((order) => { const status = paymentStatus(order); return <tr key={order.id}><td className="px-5 py-4"><span className="font-mono text-xs font-bold text-slate-900">{order.id}</span><span className="mt-1 block text-[11px] text-slate-500">{new Date(order.createdAt || order.created_at).toLocaleDateString()}</span></td><td className="px-5 py-4 text-xs text-slate-700">{order.paymentPreference === "meetup-cash" ? "Cash on delivery" : order.paymentPreference || order.payment?.payment_method || "Not specified"}</td><td className="px-5 py-4 font-semibold text-slate-900">{formatMoney(order.sellerSubtotal ?? order.total_price ?? order.total ?? order.subtotal ?? 0)}</td><td className="px-5 py-4 font-mono text-xs text-slate-600">{order.paymentReference || order.payment?.transaction_reference || "—"}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${status === "Verified" || status === "completed" ? "bg-emerald-50 text-emerald-800" : status === "Disputed" || status === "Verification Failed" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>{status}</span></td></tr>; })}</tbody></table></div></div> : <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white px-5 py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-600"><Wallet size={23} /></span><h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">No payment activity yet</h2><p className="mt-2 text-sm text-slate-500">Payment records for your buyer orders will appear here.</p></section>}
    {isPreviewAuth && <p className="mt-4 text-center text-[11px] text-slate-400">Preview workspace · changes stay in this browser.</p>}
  </div></div>;
}
