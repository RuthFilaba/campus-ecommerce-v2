import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { clearDirectCheckout } from "../../services/purchaseFlow";
import PremiumBreadcrumb from "../../components/common/PremiumBreadcrumb";
import { getProductPrimaryImage } from "../../utils/productImages";
import { formatMoney } from "../../services/currency";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();
  const saveForLater = async (product) => {
    try {
      await api.post("/wishlist/add/", { product_id: product.id });
      await removeItem(product.id);
      toast.success("Saved to your wishlist");
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not save this item");
    }
  };
  const hasStockIssue = cart.items.some(({ product, quantity }) => Number(product.stock ?? 0) < quantity);

  if (cart.items.length === 0) {
    return (
      <div className="grid min-h-[65vh] place-items-center bg-[#fafaf9] px-5 py-12">
        <div className="max-w-md text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-white text-amber-600 shadow-[0_8px_30px_rgba(15,23,42,.07)]"><ShoppingBag size={25} /></span>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[.15em] text-amber-700">Your campus finds</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950">Your cart is ready for a good find.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Explore the marketplace and add something useful for campus life.</p>
          <Link to="/products" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800">Explore marketplace <ArrowRight size={16} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-28 sm:pb-16">
      <div className="container-custom pt-8 sm:pt-10">
        <PremiumBreadcrumb items={[{ label: "Home", to: "/" }, { label: "Your cart" }]} />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-amber-700">Almost yours</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950">Your cart<span className="ml-2 align-middle text-base font-medium tracking-normal text-slate-400">({cart.count})</span></h1></div>
          <Link to="/products" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-amber-700"><ArrowLeft size={15} /> Continue exploring</Link>
        </div>

        <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-7">
          <section aria-label="Cart items" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="hidden grid-cols-[minmax(0,1fr)_120px_130px_40px] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400 sm:grid"><span>Item</span><span>Price</span><span>Quantity</span><span /></div>
            <ul className="divide-y divide-slate-100">
              {cart.items.map(({ product, quantity }) => (
                <li key={product.id} className="relative grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_120px_130px_40px] sm:items-center sm:gap-4 sm:px-5 sm:py-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <Link to={`/products/${product.id}`} className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-slate-100"><img src={getProductPrimaryImage(product)} alt="" className="h-full w-full object-cover" /></Link>
                    <div className="min-w-0"><Link to={`/products/${product.id}`} className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 transition hover:text-amber-700">{product.name}</Link><p className="mt-1 text-xs text-slate-500">{product.seller_name}</p><p className="mt-1 text-[10px] font-medium text-slate-400">Meetup at {product.campus}</p><button type="button" onClick={() => saveForLater(product)} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600"><Heart size={12} /> Save for later</button></div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 sm:block">{formatMoney(product.price)}</div>
                  <div className="inline-flex h-9 w-fit items-center rounded-lg border border-slate-200 p-0.5">
                    <button type="button" aria-label={`Decrease quantity for ${product.name}`} disabled={quantity <= 1} onClick={() => updateQuantity(product.id, quantity - 1)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-35"><Minus size={13} /></button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800" aria-live="polite">{quantity}</span>
                    <button type="button" aria-label={`Increase quantity for ${product.name}`} disabled={quantity >= product.stock} onClick={() => updateQuantity(product.id, quantity + 1)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-35"><Plus size={13} /></button>
                  </div>
                  <button type="button" aria-label={`Remove ${product.name} from cart`} onClick={() => removeItem(product.id)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 sm:static"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </section>

          <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold tracking-tight text-slate-900">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm"><div className="flex justify-between text-slate-500"><span>Items ({cart.count})</span><span className="font-semibold text-slate-800">{formatMoney(cart.total)}</span></div><div className="flex justify-between text-slate-500"><span>Campus meetup</span><span className="font-semibold text-slate-800">Arrange with seller</span></div></div>
            <div className="my-5 h-px bg-slate-100" />
            <div className="flex items-end justify-between"><span className="text-sm font-semibold text-slate-700">Subtotal</span><span className="text-xl font-bold tracking-tight text-slate-950">{formatMoney(cart.total)}</span></div>
            {hasStockIssue && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-xs leading-5 text-rose-800">Stock changed for one or more items. Adjust quantities before checkout.</p>}
            <Link to="/checkout" onClick={clearDirectCheckout} aria-disabled={hasStockIssue} className={`mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-amber-300 ${hasStockIssue ? "pointer-events-none opacity-50" : ""}`}>Continue to checkout <ArrowRight size={16} /></Link>
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-50/80 p-3 text-[11px] leading-5 text-emerald-800"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-700" /><span>Your cart is saved to your marketplace account.</span></div>
          </aside>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_18px_rgba(15,23,42,.08)] backdrop-blur sm:hidden"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><div><p className="text-[10px] font-medium text-slate-500">Subtotal · {cart.count} items</p><p className="text-base font-bold text-slate-950">{formatMoney(cart.total)}</p></div><Link to="/checkout" onClick={clearDirectCheckout} aria-disabled={hasStockIssue} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-xs font-bold text-slate-950 ${hasStockIssue ? "pointer-events-none opacity-50" : ""}`}>Checkout <ArrowRight size={15} /></Link></div></div>
    </div>
  );
}
