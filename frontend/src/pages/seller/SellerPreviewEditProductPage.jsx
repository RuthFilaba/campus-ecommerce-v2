import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { readPreviewSellerProducts, updatePreviewSellerProduct } from "../../services/previewSellerData";

export default function SellerPreviewEditProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product] = useState(() => readPreviewSellerProducts(user?.email).find((item) => String(item.id) === String(id)) || null);
  const [form, setForm] = useState(() => product ? { name: product.name, description: product.description, price: product.price, stock: product.stock } : null);

  if (!product || !form) return <div className="grid min-h-[60vh] place-items-center bg-[#fafaf9] px-5"><div className="text-center"><h1 className="text-xl font-semibold text-slate-900">Listing not found</h1><Link to="/seller/products" className="mt-4 inline-flex text-sm font-semibold text-amber-700">Back to listings</Link></div></div>;

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = (event) => {
    event.preventDefault();
    updatePreviewSellerProduct(user.email, product.id, { ...form, price: Number(form.price), stock: Number(form.stock) });
    toast.success("Listing updated on this device");
    navigate("/seller/products");
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom max-w-3xl pt-8 sm:pt-10">
        <Link to="/seller/products" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"><ArrowLeft size={14} /> Back to listings</Link>
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-amber-700">Seller workspace</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Edit listing</h1><p className="mt-1 text-sm text-slate-500">Update the details students see in your listing.</p>
          <form onSubmit={save} className="mt-6 space-y-5">
            <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Listing name</span><input name="name" value={form.name} onChange={updateField} maxLength={100} required className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label>
            <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Description</span><textarea name="description" value={form.description} onChange={updateField} rows={4} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Price (ZMW)</span><input name="price" type="number" min="1" step="0.01" value={form.price} onChange={updateField} required className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label><label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Available stock</span><input name="stock" type="number" min="0" step="1" value={form.stock} onChange={updateField} required className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label></div>
            <div className="flex justify-end border-t border-slate-100 pt-5"><button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"><Save size={15} /> Save changes</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
