import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Clock3, ShieldCheck, XCircle } from "lucide-react";

export default function SellerApplicationPage() {
  const { user } = useAuth();
  const status = user?.seller_status || "pending";
  const rejected = status === "rejected" || status === "suspended";
  const Icon = rejected ? XCircle : status === "approved" ? ShieldCheck : Clock3;
  const heading = rejected ? "Seller application needs attention" : "Seller application under review";
  const description = rejected
    ? user?.seller_status_reason || "Your seller access is not active. Contact CampusEcom support for the next steps."
    : "An administrator must approve your seller account before you can list products or manage orders.";
  return <div className="grid min-h-[65vh] place-items-center bg-[#fafaf9] px-5"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm"><span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${rejected ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}><Icon size={24} /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">Seller application</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{heading}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><span className={`mt-5 inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${rejected ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>{status}</span><div className="mt-6 border-t border-slate-100 pt-5"><Link to="/" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Return to marketplace</Link></div></section></div>;
}
