import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Heart, MapPin, Minus, Plus, ShieldCheck, ShoppingBag, Star, Store } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { getCategoryLabel, getConditionLabel, previewProducts } from "../data/previewProducts";
import { readPreviewWishlist, writePreviewWishlist } from "../services/previewWishlist";
import { saveDirectCheckout, savePendingPurchase } from "../services/purchaseFlow";
import PremiumBreadcrumb from "../components/common/PremiumBreadcrumb";
import { isPreviewAuth } from "../services/auth";
import { readAllPreviewSellerProducts } from "../services/previewSellerData";
import { getProductImages } from "../utils/productImages";
import { canReviewPreviewProduct, createPreviewReview, readPreviewReviews } from "../services/previewReviews";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isSeller = user?.role === "seller";
  const isAdmin = user?.role === "admin";
  const catalogue = useMemo(() => [
    ...previewProducts,
    ...(isPreviewAuth ? readAllPreviewSellerProducts().filter((item) => item.is_active !== false) : []),
  ], []);
  const product = catalogue.find((item) => String(item.id) === String(id));
  const productId = product?.id;
  const [selectedImage, setSelectedImage] = useState("");
  const productImages = getProductImages(product);
  const activeImage = productImages.includes(selectedImage) ? selectedImage : productImages[0];
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(() => product ? readPreviewWishlist().includes(product.id) : false);
  const [reviews, setReviews] = useState(() => product ? readPreviewReviews(product.id) : []);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    setReviews(productId ? readPreviewReviews(productId) : []);
    setSaved(productId ? readPreviewWishlist().includes(productId) : false);
    setReviewRating(5);
    setReviewComment("");
  }, [productId]);

  const related = useMemo(() => catalogue.filter((item) => item.category === product?.category && item.id !== product?.id).slice(0, 3), [catalogue, product]);

  if (!product) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#fafaf9] px-5">
        <div className="max-w-md text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm"><ShoppingBag size={22} /></span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">This preview listing isn’t available</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">It may have been removed from the sample catalogue.</p>
          <Link to="/products" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"><ArrowLeft size={16} /> Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const toggleSaved = () => {
    const current = readPreviewWishlist();
    const next = saved ? current.filter((item) => item !== product.id) : [...current, product.id];
    writePreviewWishlist(next);
    setSaved(!saved);
    toast.success(saved ? "Removed from saved items" : "Saved to your wishlist");
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      savePendingPurchase({ type: "add-to-cart", product, quantity });
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    addItem(product, quantity);
    toast.success(`${quantity} ${quantity === 1 ? "item" : "items"} added to your cart`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      savePendingPurchase({ type: "buy-now", product, quantity });
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    saveDirectCheckout(product, quantity);
    navigate("/checkout");
  };

  const submitReview = (event) => {
    event.preventDefault();
    if (!user?.email || !reviewComment.trim()) return;
    const result = createPreviewReview({
      productId: product.id,
      buyerEmail: user.email,
      buyerName: user.first_name || "Campus buyer",
      rating: reviewRating,
      comment: reviewComment,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setReviews(readPreviewReviews(product.id));
    setReviewComment("");
    toast.success("Your review has been saved to this preview.");
  };

  const buyerCanReview = user?.role === "buyer" && canReviewPreviewProduct(product.id, user.email);
  const alreadyReviewed = reviews.some((review) => review.buyerEmail === user?.email?.toLowerCase());
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length : Number(product.rating || 0);

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="container-custom pt-6 sm:pt-8">
        <PremiumBreadcrumb items={[{ label: "Home", to: "/" }, { label: "Marketplace", to: "/products" }, { label: getCategoryLabel(product.category), to: `/products?category=${product.category}` }, { label: product.name }]} />

        <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(400px,.95fr)] lg:gap-12">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-2.5 sm:rounded-[28px] sm:p-3">
            <div className="relative aspect-[1.08/1] overflow-hidden rounded-[18px] bg-slate-100 sm:rounded-[22px]">
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
              <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">{getConditionLabel(product.condition)}</span>
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"><MapPin size={12} /> {product.campus}</span>
            </div>
            {productImages.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto px-1">{productImages.map((image, index) => <button key={`${product.id}-image-${index}`} type="button" onClick={() => setSelectedImage(image)} aria-label={`Show product image ${index + 1}`} aria-pressed={activeImage === image} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${activeImage === image ? "border-amber-400" : "border-transparent opacity-70 hover:opacity-100"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>}
            <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3 text-xs text-slate-500 sm:px-3">
              <span>Marketplace preview listing</span>
              {!isSeller && !isAdmin && <button type="button" onClick={toggleSaved} aria-pressed={saved} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold transition ${saved ? "text-rose-600" : "text-slate-600 hover:bg-slate-100"}`}><Heart size={14} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save item"}</button>}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-amber-700"><span className="rounded-full bg-amber-50 px-2.5 py-1">{getCategoryLabel(product.category)}</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{product.stock > 0 ? "Available" : "Sold"}</span></div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.05em] text-slate-950 sm:text-[38px]">{product.name}</h1>
            <p className="mt-4 text-[28px] font-bold tracking-[-.045em] text-slate-950">K{Number(product.price).toLocaleString("en-ZM")}</p>
            <div className="mt-5 h-px bg-slate-200" />

            <div className="mt-5">
              <h2 className="text-sm font-bold text-slate-900">About this item</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{product.description}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5"><span className="block text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">Condition</span><span className="mt-1 block text-sm font-semibold text-slate-800">{getConditionLabel(product.condition)}</span></div>
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5"><span className="block text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">Availability</span><span className="mt-1 block text-sm font-semibold text-slate-800">{product.stock} {product.stock === 1 ? "item" : "items"} available</span></div>
            </div>

            {!isSeller && !isAdmin ? <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white p-1">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><Minus size={15} /></button>
                <span className="w-8 text-center text-sm font-bold text-slate-900" aria-live="polite">{quantity}</span>
                <button type="button" aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} /></button>
              </div>
              <button type="button" onClick={handleAddToCart} disabled={!product.stock} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-50"><ShoppingBag size={17} /> Add to cart</button>
              <button type="button" onClick={handleBuyNow} disabled={!product.stock} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/30 disabled:cursor-not-allowed disabled:opacity-50"><ArrowRight size={16} /> Buy now</button>
              <Link to="/cart" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">View cart <ArrowRight size={15} /></Link>
            </div> : <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-slate-900">{isAdmin ? "Administrator view" : "Seller view"}</p><p className="mt-1 text-xs leading-5 text-slate-600">Shopping actions are reserved for buyer accounts.</p></div><Link to={isAdmin ? "/admin/dashboard" : "/seller/dashboard"} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800">Open {isAdmin ? "admin" : "seller"} workspace <ArrowRight size={14} /></Link></div>}

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><Store size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-slate-900">{product.seller_name}</h2><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><Check size={11} /> Campus seller</span></div>
                  <p className="mt-1 text-xs text-slate-500">{product.campus}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="shrink-0 text-emerald-600" /> Arrange a convenient campus meetup and check the item before purchase.</div>
            </div>
            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">Preview mode · Sample item and seller information. Cart changes are stored on this device.</p>
          </div>
        </div>

        <section className="mt-12 border-t border-slate-200 pt-9" aria-labelledby="reviews-title">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-amber-700">Buyer feedback</p><h2 id="reviews-title" className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">Reviews</h2></div><div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Star size={16} className="fill-amber-400 text-amber-500" />{averageRating ? averageRating.toFixed(1) : "New"}<span className="font-normal text-slate-400">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span></div></div>
          {buyerCanReview && !alreadyReviewed ? <form onSubmit={submitReview} className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><p className="text-sm font-semibold text-slate-900">You bought this item. How was it?</p><div className="mt-3 flex items-center gap-1" role="group" aria-label="Choose a rating from one to five stars">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setReviewRating(value)} aria-label={`${value} ${value === 1 ? "star" : "stars"}`} aria-pressed={reviewRating === value} className="rounded p-1 text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><Star size={19} className={value <= reviewRating ? "fill-amber-400" : "text-slate-300"} /></button>)}</div><label htmlFor="product-review" className="mt-3 block text-xs font-semibold text-slate-700">Your review<textarea id="product-review" required maxLength={800} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={3} placeholder="Share helpful details about the product and meetup…" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label><button type="submit" className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800">Post review</button></form> : alreadyReviewed ? <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">You have reviewed this product.</p> : <p className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-500">Only buyers with a delivered order can leave a review.</p>}
          {reviews.length > 0 ? <ul className="mt-4 grid gap-3 sm:grid-cols-2">{reviews.map((review) => <li key={review.id} className="rounded-2xl border border-slate-200/80 bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">{review.buyerName}</p><time className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</time></div><div className="mt-2 flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={13} className={value <= review.rating ? "fill-amber-400 text-amber-500" : "text-slate-200"} />)}</div><p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p></li>)}</ul> : <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No reviews yet. Be the first eligible buyer to share feedback.</p>}
        </section>

        {related.length > 0 && (
          <section className="mt-14 border-t border-slate-200 pt-9" aria-labelledby="related-title">
            <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-amber-700">Keep exploring</p><h2 id="related-title" className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">More in {getCategoryLabel(product.category)}</h2></div><Link to={`/products?category=${product.category}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-amber-700">See all <ArrowRight size={14} /></Link></div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {related.map((item) => <Link key={item.id} to={`/products/${item.id}`} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"><div className="aspect-[1.5/1] overflow-hidden bg-slate-100"><img src={getProductImages(item)[0]} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-3.5"><p className="line-clamp-1 text-xs font-semibold text-slate-800">{item.name}</p><p className="mt-1.5 text-sm font-bold text-slate-950">K{Number(item.price).toLocaleString("en-ZM")}</p></div></Link>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
