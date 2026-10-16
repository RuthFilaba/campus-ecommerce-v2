import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { readPreviewSellerOrders } from "../../services/previewSellerData";
import { submitPreviewSellerDisputeResponse } from "../../services/previewOrders";
import { formatMoney } from "../../services/currency";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const toDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result }); reader.onerror = reject; reader.readAsDataURL(file); });

export default function SellerDisputesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(() => readPreviewSellerOrders(user?.email));
  const [responses, setResponses] = useState({});
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState("");
  const refresh = () => setOrders(readPreviewSellerOrders(user?.email));
  useEffect(() => { window.addEventListener("campusecom:preview-orders-change", refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener("campusecom:preview-orders-change", refresh); window.removeEventListener("storage", refresh); }; }, [user?.email]);
  const cases = orders.filter((order) => ["open", "unresolved"].includes(order.paymentDispute?.status));

  const submit = async (event, order) => {
    event.preventDefault(); setSaving(order.id);
    try {
      const evidence = await Promise.all((files[order.id] || []).map(toDataUrl));
      const result = submitPreviewSellerDisputeResponse(order.id, user?.email, responses[order.id], evidence);
      if (result.error) { toast.error(result.error); return; }
      setResponses((current) => ({ ...current, [order.id]: "" })); refresh(); toast.success("Your response was shared with the buyer and administrator.");
    } catch { toast.error("Could not attach those files. Please use smaller image or PDF files."); }
    finally { setSaving(""); }
  };

  return <div className="min-h-screen bg-[#fafaf9] pb-16"><div className="container-custom max-w-6xl pt-8 sm:pt-10">
    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Seller workspace</p><div className="mt-1 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-[-.05em] text-slate-950">Disputes</h1><p className="mt-2 text-sm text-slate-500">Review buyer reports and provide a clear response with supporting evidence.</p></div><Link to="/seller/orders" className="text-sm font-semibold text-slate-600 hover:text-amber-700">View orders</Link></div>
    {cases.length ? <div className="mt-7 space-y-4">{cases.map((order) => { const dispute = order.paymentDispute; return <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold text-slate-900">{order.id}</p><p className="mt-1 text-xs text-slate-500">{order.buyerName || order.buyerEmail} · {order.paymentPreference} · {formatMoney(order.total ?? order.subtotal)}</p></div><span className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-bold capitalize text-rose-700">{dispute.status}</span></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2"><section className="rounded-xl bg-slate-50 p-4"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><AlertTriangle size={15} className="text-rose-600" /> Buyer report</h2><p className="mt-2 text-xs font-semibold capitalize text-slate-600">{String(dispute.category || "other").replaceAll("_", " ")}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{dispute.reason}</p>{dispute.evidence?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{dispute.evidence.map((file, index) => <a key={index} href={file.data} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800">View {file.name || `evidence ${index + 1}`}</a>)}</div>}</section><section className="rounded-xl border border-slate-100 p-4"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldCheck size={15} className="text-amber-700" /> Your response</h2>{dispute.sellerResponse && <div className="mt-2 rounded-lg bg-emerald-50 p-3"><p className="whitespace-pre-wrap text-sm text-slate-700">{dispute.sellerResponse.message}</p>{dispute.sellerResponse.evidence?.map((file, index) => <a key={index} href={file.data} target="_blank" rel="noreferrer" className="mt-2 mr-2 inline-block text-xs font-semibold text-emerald-800">View {file.name || `file ${index + 1}`}</a>)}</div>}
      <form onSubmit={(event) => submit(event, order)} className="mt-3 space-y-3"><label className="block text-xs font-semibold text-slate-700">Response<textarea required minLength={5} maxLength={1200} rows={3} value={responses[order.id] || ""} onChange={(event) => setResponses((current) => ({ ...current, [order.id]: event.target.value }))} placeholder="Explain your account and any steps taken." className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal outline-none focus:border-amber-400" /></label><input type="file" accept="image/*,application/pdf" multiple onChange={(event) => { const selected = Array.from(event.target.files || []).slice(0, 3); if (selected.some((file) => file.size > MAX_FILE_SIZE)) { toast.error("Each file must be 2 MB or smaller."); event.target.value = ""; return; } setFiles((current) => ({ ...current, [order.id]: selected })); }} className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:font-semibold file:text-amber-800" /><button disabled={saving === order.id} className="h-9 rounded-lg bg-amber-400 px-3 text-xs font-bold text-slate-950 disabled:opacity-60">{saving === order.id ? "Sending…" : "Send response"}</button></form></section></div></article>; })}</div> : <section className="mt-7 rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center"><h2 className="text-lg font-semibold text-slate-950">No open disputes</h2><p className="mt-2 text-sm text-slate-500">Buyer reports for your orders will appear here.</p></section>}
    <p className="mt-4 text-center text-[11px] text-slate-400">Preview reports and evidence are stored on this device.</p>
  </div></div>;
}
