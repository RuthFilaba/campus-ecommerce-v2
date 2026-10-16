import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Heart, Laptop, Shirt, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { previewProducts, getCategoryLabel, getConditionLabel } from "../data/previewProducts";
import { isPreviewAuth } from "../services/auth";
import { readAllPreviewSellerProducts } from "../services/previewSellerData";
import { readPreviewWishlist, writePreviewWishlist } from "../services/previewWishlist";
import { getProductPrimaryImage } from "../utils/productImages";
import { formatMoney } from "../services/currency";
import toast from "react-hot-toast";

const categories = [
  { label: "Tech & mobile", value: "tech-mobile", icon: Laptop },
  { label: "Academic", value: "academic", icon: BookOpen },
  { label: "Fashion", value: "fashion", icon: Shirt },
  { label: "Food & drinks", value: "food", icon: Utensils },
];

function FeaturedProductCard({ product }) {
  const [saved, setSaved] = useState(() => readPreviewWishlist().includes(product.id));
  const toggleSaved = () => {
    const current = readPreviewWishlist();
    writePreviewWishlist(saved ? current.filter((id) => id !== product.id) : [...current, product.id]);
    setSaved(!saved);
    toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
  };
  return <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-amber-300"><div className="relative aspect-[1.5/1] overflow-hidden bg-slate-100"><Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}><img src={getProductPrimaryImage(product)} alt={product.name} loading="lazy" className="h-full w-full object-cover" /></Link><span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-700">{getConditionLabel(product.condition)}</span><button type="button" onClick={toggleSaved} aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={saved} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-white/95 text-slate-600 hover:text-rose-600"><Heart size={16} fill={saved ? "currentColor" : "none"} /></button></div><div className="p-4"><p className="text-[10px] font-semibold uppercase tracking-[.1em] text-slate-500">{getCategoryLabel(product.category)}</p><Link to={`/products/${product.id}`} className="mt-1.5 block min-h-10 text-sm font-semibold leading-5 text-slate-900 hover:text-amber-700">{product.name}</Link><p className="mt-1 text-[11px] text-slate-500">{product.seller_name || "Campus seller"}</p><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="font-bold text-slate-950">{formatMoney(product.price)}</span><span className={`text-[10px] font-semibold ${Number(product.stock) > 0 ? "text-emerald-700" : "text-rose-700"}`}>{Number(product.stock) > 0 ? "In stock" : "Unavailable"}</span></div></div></article>;
}

export default function LandingPage() {
  const catalogue = useMemo(() => [...previewProducts, ...(isPreviewAuth ? readAllPreviewSellerProducts().filter((product) => product.is_active !== false && product.is_approved === true) : [])].filter((product) => product.is_active !== false && product.is_approved !== false), []);
  const featuredProducts = catalogue.filter((product) => Number(product.stock) > 0).slice(0, 4);
  const recentlyAdded = catalogue.map((product, index) => ({ product, index, createdAt: new Date(product.created_at || product.createdAt || 0).getTime() })).filter(({ product }) => Number(product.stock) > 0).sort((a, b) => (b.createdAt - a.createdAt) || (b.index - a.index)).slice(0, 4).map(({ product }) => product);
  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <main>
        <section className="container-custom pb-8 pt-5 sm:pb-10 sm:pt-7">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
            <img src="/images/campus-marketplace-hero.png" alt="Everything You Need on Campus. Buy and sell quality products within your campus community." fetchPriority="high" className="block h-auto w-full" />
            <Link to="/products" className="absolute left-[5.2%] top-[75.5%] inline-flex min-h-8 items-center justify-center gap-2 rounded-full bg-amber-400 px-3 text-[10px] font-bold text-slate-950 shadow-sm transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:min-h-11 sm:gap-2.5 sm:px-6 sm:text-sm" aria-label="Shop now">Shop now <ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className="container-custom pb-10 sm:pb-12" aria-labelledby="categories-title">
          <div className="flex items-center justify-between">
            <h2 id="categories-title" className="text-xl font-semibold tracking-[-.03em] text-slate-950 sm:text-2xl">Categories</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map(({ label, value, icon: Icon }) => (
              <Link key={value} to={`/products?category=${value}`} className="group flex min-h-[68px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-amber-400 hover:bg-amber-50/50 sm:min-h-[76px]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-slate-900 sm:h-10 sm:w-10"><Icon size={19} strokeWidth={1.8} /></span>
                <span className="text-[13px] font-semibold leading-5 text-slate-800 sm:text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50/70 py-10 sm:py-12" aria-labelledby="featured-title">
          <div className="container-custom">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-600">Made for your next find</p>
                <h2 id="featured-title" className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950 sm:text-3xl">Featured products</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Discover useful finds from your campus community, with clear prices and availability.</p>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-amber-700">Browse listings <ArrowRight size={16} /></Link>
            </div>
            {featuredProducts.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product) => <FeaturedProductCard key={product.id} product={product} />)}</div> : <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No featured products are available right now. Check back soon.</p>}
          </div>
        </section>

        {recentlyAdded.length > 0 && <section className="container-custom py-10 sm:py-12" aria-labelledby="recent-title"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-amber-700">New listings</p><h2 id="recent-title" className="mt-1 text-xl font-semibold tracking-[-.03em] text-slate-950 sm:text-2xl">Recently added</h2></div><Link to="/products?sort=newest" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-amber-700">See all new listings <ArrowRight size={16} /></Link></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{recentlyAdded.map((product) => <FeaturedProductCard key={product.id} product={product} />)}</div></section>}

        <section className="container-custom pb-12 sm:pb-14">
          <div className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-8 sm:px-9 sm:py-9">
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-300">Your next great find is nearby</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-.04em] text-white sm:text-3xl">Make more of campus life.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">Explore the marketplace or share something useful with your community.</p>
              </div>
              <div className="flex flex-col gap-3 min-[420px]:flex-row">
                <Link to="/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-300">Explore listings <ArrowRight size={16} /></Link>
                <Link to="/register?role=seller" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10">Join as a seller</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
