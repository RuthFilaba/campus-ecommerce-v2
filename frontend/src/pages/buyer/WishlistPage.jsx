import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { getCategoryLabel, getConditionLabel } from "../../data/previewProducts";
import api from "../../services/api";
import PremiumBreadcrumb from "../../components/common/PremiumBreadcrumb";
import { getProductPrimaryImage } from "../../utils/productImages";
import { formatMoney } from "../../services/currency";

export default function WishlistPage() {
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWishlist = async () => {
    try {
      const response = await api.get("/wishlist/");
      setSavedProducts((response.data.items || []).map((item) => item.product_details));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWishlist(); }, []);

  const removeSaved = async (id) => {
    try {
      await api.delete("/wishlist/remove/", { data: { product_id: id } });
      setSavedProducts((current) => current.filter((product) => product.id !== id));
    } catch {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom pt-8 sm:pt-10">
        <PremiumBreadcrumb items={[{ label: "Home", to: "/" }, { label: "Saved items" }]} />
        <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-amber-700">Keep the good ones close</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950">Your wishlist<span className="ml-2 align-middle text-base font-medium tracking-normal text-slate-400">({savedProducts.length})</span></h1></div><Heart size={23} className="mb-1 text-rose-500" /></div>

        {loading ? <p className="mt-8 text-center text-sm text-slate-500">Loading saved items…</p> : error ? <p role="alert" className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-5 text-center text-sm text-rose-800">Your wishlist could not be loaded. Please try again.</p> : savedProducts.length ? (
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {savedProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,.08)]">
                <Link to={`/products/${product.id}`} className="block"><div className="relative aspect-[1.12/1] overflow-hidden bg-slate-100"><img src={getProductPrimaryImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700">{getConditionLabel(product.condition)}</span></div></Link>
                <div className="p-4"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">{getCategoryLabel(product.category)}</p><Link to={`/products/${product.id}`} className="mt-1.5 block min-h-10 text-sm font-semibold leading-5 text-slate-900 hover:text-amber-700">{product.name}</Link><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-base font-bold text-slate-950">{formatMoney(product.price)}</span><button type="button" onClick={() => removeSaved(product.id)} aria-label={`Remove ${product.name} from wishlist`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></div></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-500"><Heart size={20} /></span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">No saved items yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Save interesting finds from a listing page and they’ll be collected here.</p>
            <Link to="/products" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800">Explore listings <ArrowRight size={14} /></Link>
          </div>
        )}
      </div>
    </div>
  );
}
