import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { readPreviewOrders, raisePreviewPaymentDispute } from "../../services/previewOrders";
import { formatMoney } from "../../services/currency";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const toDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function BuyerReportProblemPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const order = useMemo(() => readPreviewOrders().find((entry) => String(entry.id) === String(id) && entry.buyerEmail?.toLowerCase() === user?.email?.toLowerCase()), [id, user?.email]);
  const [category, setCategory] = useState("payment_not_received");
  const [details, setDetails] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!order) return;
    setSaving(true);
    try {
      const evidence = await Promise.all(files.map(toDataUrl));
      const result = raisePreviewPaymentDispute(order.id, user?.email, details, { category, evidence });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Your report and evidence were sent for administrator review.");
      navigate(`/orders/${order.id}`);
    } catch {
      toast.error("Could not attach those files. Please try smaller image or PDF files.");
    } finally { setSaving(false); }
  };

  if (!order) return <div className="container-custom max-w-3xl py-16"><h1 className="text-2xl font-semibold">Order not found</h1><Link className="mt-4 inline-block text-amber-700" to="/orders">Back to orders</Link></div>;

  return <div className="min-h-screen bg-[#fafaf9] pb-16"><div className="container-custom max-w-3xl pt-8 sm:pt-10">
    <Link to={`/orders/${order.id}`} className="text-sm font-semibold text-slate-600 hover:text-amber-700">← Back to order</Link>
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Buyer support</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Report a problem</h1>
      <p className="mt-2 text-sm text-slate-500">Order <span className="font-mono font-semibold text-slate-700">{order.id}</span> · {formatMoney(order.total ?? order.subtotal)}</p>
      <p className="mt-3 text-xs leading-5 text-slate-500">Describe what happened and attach relevant payment, delivery, or item evidence. The seller can respond and an administrator will record a decision.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-slate-800">Problem type<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"><option value="payment_not_received">Payment not received</option><option value="payment_amount_mismatch">Payment amount incorrect</option><option value="duplicate_payment">Duplicate payment</option><option value="cod_payment_disagreement">COD payment disagreement</option><option value="product_not_received">Product not delivered</option><option value="product_differs">Product differs from listing</option><option value="item_damaged">Item damaged</option><option value="seller_unresponsive">Seller has not responded</option><option value="other">Other order or payment problem</option></select></label>
        <label className="block text-sm font-semibold text-slate-800">What happened?<textarea required value={details} onChange={(event) => setDetails(event.target.value)} minLength={8} maxLength={1200} rows={5} placeholder="Include dates, amounts, and any steps already taken." className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-amber-400" /></label>
        <label className="block text-sm font-semibold text-slate-800">Evidence <span className="font-normal text-slate-500">(up to 3 images or PDFs, 2 MB each)</span><input type="file" accept="image/*,application/pdf" multiple onChange={(event) => { const selected = Array.from(event.target.files || []).slice(0, 3); if (selected.some((file) => file.size > MAX_FILE_SIZE)) { toast.error("Each file must be 2 MB or smaller."); event.target.value = ""; return; } setFiles(selected); }} className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:font-semibold file:text-amber-800" /></label>
        {files.length > 0 && <p className="text-xs text-slate-500">{files.map((file) => file.name).join(" · ")}</p>}
        <button disabled={saving} className="h-11 rounded-lg bg-amber-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60">{saving ? "Sending report…" : "Send report for review"}</button>
      </form>
    </section>
    <p className="mt-4 text-center text-[11px] text-slate-400">Preview mode stores reports and attached files in this browser only.</p>
  </div></div>;
}
