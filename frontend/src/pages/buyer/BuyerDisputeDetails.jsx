import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { appendPreviewDisputeEvidence } from "../../services/previewOrders";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const toDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result }); reader.onerror = reject; reader.readAsDataURL(file); });
const label = (value) => String(value || "other").replaceAll("_", " ");

export default function BuyerDisputeDetails({ order, buyerEmail }) {
  const dispute = order.paymentDispute;
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  if (!dispute) return null;

  const submitUpdate = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const evidence = await Promise.all(files.map(toDataUrl));
      const result = appendPreviewDisputeEvidence(order.id, buyerEmail, message, evidence);
      if (result.error) { toast.error(result.error); return; }
      setMessage(""); setFiles([]); toast.success("Additional details sent for review.");
    } catch { toast.error("Could not attach those files. Please use smaller images or PDFs."); }
    finally { setSaving(false); }
  };
  const attachments = (list = []) => list.map((file, index) => <a key={`${file.name}-${index}`} href={file.data} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-800"><FileText size={13} />{file.name || `Evidence ${index + 1}`}</a>);

  return <section className="mt-5 rounded-2xl border border-amber-200/80 bg-white p-4 sm:p-5" aria-labelledby="buyer-dispute-title">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-amber-700">Dispute case</p><h2 id="buyer-dispute-title" className="mt-1 font-mono text-sm font-bold text-slate-950">{dispute.id || `CE-D-${String(order.id).slice(-7)}`}</h2><p className="mt-1 text-xs capitalize text-slate-500">{label(dispute.category)} · Submitted {new Date(dispute.createdAt).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold capitalize ${dispute.status === "resolved" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{dispute.status === "resolved" ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{dispute.status === "open" ? "Awaiting review" : label(dispute.status)}</span></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Your report</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{dispute.reason}</p><div className="mt-2 flex flex-wrap gap-2">{attachments(dispute.evidence)}</div></div><div className="rounded-xl bg-slate-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Seller response</p>{dispute.sellerResponse ? <><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{dispute.sellerResponse.message}</p><div className="mt-2 flex flex-wrap gap-2">{attachments(dispute.sellerResponse.evidence)}</div><p className="mt-2 text-[10px] text-slate-400">Responded {new Date(dispute.sellerResponse.submittedAt).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })}</p></> : <p className="mt-1 text-sm text-slate-500">The seller has not responded yet.</p>}</div></div>
    {(dispute.updates || []).map((update, index) => <div key={`${dispute.id}-update-${index}`} className="mt-3 rounded-xl border border-slate-100 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Additional information · {new Date(update.submittedAt).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })}</p>{update.message && <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{update.message}</p>}<div className="mt-2 flex flex-wrap gap-2">{attachments(update.evidence)}</div></div>)}
    {dispute.decision && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"><div className="flex items-center gap-2"><AlertCircle size={15} className="text-emerald-700" /><p className="text-xs font-bold capitalize text-emerald-900">{label(dispute.decision)} · {dispute.status === "unresolved" ? "Awaiting follow-up" : "Decision"}</p></div><p className="mt-2 text-sm leading-6 text-slate-700">{dispute.decisionReason}</p>{dispute.resolutionAmount != null && <p className="mt-2 text-xs font-semibold text-slate-800">Agreed adjustment: K{Number(dispute.resolutionAmount).toFixed(2)}</p>}<p className="mt-2 text-[11px] text-slate-500">Payment/refund status: {order.paymentStatus || "Awaiting review"}</p></div>}
    {["open", "unresolved"].includes(dispute.status) && <form onSubmit={submitUpdate} className="mt-4 border-t border-slate-100 pt-4"><label className="block text-xs font-semibold text-slate-700">Add information or evidence<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} rows={2} placeholder="Reply to a request or provide more details" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal outline-none focus:border-amber-400" /></label><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><input type="file" accept="image/*,application/pdf" multiple onChange={(event) => { const selected = Array.from(event.target.files || []).slice(0, 3); if (selected.some((file) => file.size > MAX_FILE_SIZE)) { toast.error("Each file must be 2 MB or smaller."); event.target.value = ""; return; } setFiles(selected); }} className="max-w-full text-[11px] text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:font-semibold file:text-amber-800" /><button disabled={saving || (!message.trim() && !files.length)} className="h-9 rounded-lg bg-amber-400 px-3.5 text-xs font-bold text-slate-950 disabled:opacity-50">{saving ? "Sending…" : "Send update"}</button></div></form>}
    {order.paymentStatus?.toLowerCase().includes("refund") && <p className="mt-3 text-xs text-blue-800">Refund progress: {order.paymentStatus}</p>}
  </section>;
}
