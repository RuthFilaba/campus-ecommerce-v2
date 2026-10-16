import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Save, ShieldCheck, Store } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { readPreviewSellerSettings, writePreviewSellerSettings } from "../../services/previewSellerData";

const campuses = ["Great North Road Campus", "Cabinet Office Campus"];

export default function SellerPreviewSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => readPreviewSellerSettings(user?.email || "", user?.first_name || ""));

  const updateField = (event) => setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));
  const saveSettings = (event) => {
    event.preventDefault();
    writePreviewSellerSettings(user.email, settings);
    toast.success("Store details saved on this device");
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom max-w-5xl pt-8 sm:pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Seller workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950">Store settings</h1>
        <p className="mt-2 text-sm text-slate-500">Set the details students will see when they visit your store.</p>

        <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={saveSettings} className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Store size={18} /></span><div><h2 className="text-sm font-bold text-slate-900">Store profile</h2><p className="mt-1 text-xs text-slate-500">Keep your store name and meetup campus up to date.</p></div></div>
            <div className="mt-5 space-y-5">
              <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Store name</span><input name="store_name" value={settings.store_name} onChange={updateField} maxLength={60} required className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label>
              <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Primary campus</span><span className="relative block"><MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select name="campus" value={settings.campus} onChange={updateField} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10">{campuses.map((campus) => <option key={campus}>{campus}</option>)}</select></span></label>
              <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">About your store <span className="font-medium text-slate-400">· optional</span></span><textarea name="description" value={settings.description} onChange={updateField} rows={4} maxLength={300} placeholder="What do you sell? Add a short introduction for campus buyers." className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /><span className="mt-1 block text-right text-[10px] text-slate-400">{settings.description.length}/300</span></label>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><Link to="/seller/dashboard" className="text-xs font-semibold text-slate-500 transition hover:text-slate-900">Cancel</Link><button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"><Save size={15} /> Save store details</button></div>
          </form>

          <aside className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-emerald-700"><ShieldCheck size={17} /></span><h2 className="mt-4 text-sm font-bold text-slate-900">Preview store profile</h2><p className="mt-1 text-xs leading-5 text-slate-600">These details are stored locally in your browser. They will move to your database profile when backend integration is ready.</p><Link to="/seller/products" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 transition hover:text-emerald-950">Go to listings <ArrowRight size={13} /></Link></aside>
        </div>
      </div>
    </div>
  );
}
