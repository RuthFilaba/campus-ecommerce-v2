import { useEffect, useState } from "react";
import { AlertTriangle, Check, Scale } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { isPreviewAuth } from "../../services/auth";
import { readPreviewOrders, resolvePreviewDispute } from "../../services/previewOrders";
import { recordAdminPreviewAudit } from "../../services/adminPreview";
import { formatMoney } from "../../services/currency";

export default function AdminDisputesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(readPreviewOrders);
  const [forms, setForms] = useState({});
  const refresh = () => setOrders(readPreviewOrders());
  useEffect(() => { window.addEventListener("campusecom:preview-orders-change", refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener("campusecom:preview-orders-change", refresh); window.removeEventListener("storage", refresh); }; }, []);
  const cases = orders.filter((order) => ["open", "unresolved"].includes(order.paymentDispute?.status));
  const setForm = (id, patch) => setForms((current) => ({ ...current, [id]: { outcome: "buyer_upheld", reason: "", partialAmount: "", ...current[id], ...patch } }));
  const decide = (order) => {
    const form = forms[order.id] || {};
    const result = resolvePreviewDispute(order.id, form.outcome || "buyer_upheld", form.reason, user?.email || "Administrator", form.partialAmount);
    if (result.error) { toast.error(result.error); return; }
    recordAdminPreviewAudit(`Dispute ${form.outcome.replaceAll("_", " ")}`, `${order.id}: ${form.reason}`, user?.email);
    toast.success(form.outcome === "unresolved" ? "Case kept open for follow-up." : "Decision recorded.");
    refresh();
  };
  const attachment = (file, index) => <a key={`${file.name}-${index}`} href={file.data} target="_blank" rel="noreferrer" className="inline-flex max-w-full truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50">{file.name || `Evidence ${index + 1}`}</a>;

  if (!isPreviewAuth) return <div className="container-custom max-w-3xl py-16"><h1 className="text-2xl font-semibold">Dispute review is not connected</h1><p className="mt-2 text-sm text-slate-500">The administrator API will provide shared dispute records when the backend is connected.</p></div>;

  return <div className="min-h-screen bg-[#fafaf9] pb-16"><div className="container-custom max-w-7xl pt-8 sm:pt-10"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Administrator workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950">Dispute review</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Review both sides, compare evidence, record a reasoned outcome, and leave unresolved cases open for follow-up.</p>
    {cases.length ? <div className="mt-7 space-y-4">{cases.map((order) => { const dispute = order.paymentDispute; const form = forms[order.id] || { outcome: "buyer_upheld", reason: "", partialAmount: "" }; const sellers = [...new Set((order.items || []).map(({ product }) => product?.owner_email).filter(Boolean))]; return <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5"><div><p className="font-mono text-sm font-bold text-slate-950">{order.id}</p><p className="mt-1 text-xs text-slate-500">Buyer: {order.buyerName || order.buyerEmail} · Seller: {sellers.join(", ") || "Unknown"} · {order.paymentPreference}</p><p className="mt-1 text-xs font-semibold text-slate-700">Order value {formatMoney(order.total ?? order.subtotal)}</p></div><span className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-bold capitalize text-rose-700">{dispute.status}</span></header>
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2"><section className="rounded-xl border border-rose-100 bg-rose-50/50 p-4"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><AlertTriangle size={16} className="text-rose-600" /> Buyer report</h2><p className="mt-2 text-xs font-semibold capitalize text-slate-600">{String(dispute.category || "other").replaceAll("_", " ")}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{dispute.reason}</p><div className="mt-3 flex flex-wrap gap-2">{(dispute.evidence || []).map(attachment)}</div></section>
      <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4"><h2 className="text-sm font-bold text-slate-900">Seller response</h2>{dispute.sellerResponse ? <><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{dispute.sellerResponse.message}</p><div className="mt-3 flex flex-wrap gap-2">{(dispute.sellerResponse.evidence || []).map(attachment)}</div></> : <p className="mt-2 text-sm text-slate-500">No seller response has been submitted.</p>}</section></div>
      <section className="border-t border-slate-100 p-4 sm:p-5"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Scale size={16} className="text-amber-700" /> Record decision</h2><div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.5fr_1fr_auto] md:items-end"><label className="text-xs font-semibold text-slate-700">Outcome<select value={form.outcome} onChange={(event) => setForm(order.id, { outcome: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value="buyer_upheld">Buyer upheld</option><option value="seller_upheld">Seller upheld</option><option value="partial_resolution">Partial resolution</option><option value="unresolved">Keep unresolved</option></select></label>{form.outcome === "partial_resolution" && <label className="text-xs font-semibold text-slate-700">Refund / adjustment amount<input type="number" min="0.01" max={Number(order.total ?? order.subtotal ?? 0)} step="0.01" value={form.partialAmount} onChange={(event) => setForm(order.id, { partialAmount: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" /></label>}<label className="text-xs font-semibold text-slate-700 md:col-span-1">Decision reason<textarea rows={2} maxLength={1000} value={form.reason} onChange={(event) => setForm(order.id, { reason: event.target.value })} placeholder="Explain findings and corrective action" className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal" /></label><button type="button" onClick={() => decide(order)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-xs font-bold text-slate-950 hover:bg-amber-300"><Check size={15} /> Save decision</button></div></section>
    </article>; })}</div> : <section className="mt-7 rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center"><h2 className="text-lg font-semibold text-slate-950">No disputes awaiting review</h2><p className="mt-2 text-sm text-slate-500">Buyer reports will appear here for evidence review and resolution.</p></section>}
    <p className="mt-4 text-center text-[11px] text-slate-400">Preview dispute records and evidence are stored in this browser only.</p>
  </div></div>;
}
