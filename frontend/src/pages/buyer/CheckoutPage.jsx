import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Banknote, Check, CheckCircle2, CreditCard, MapPin, Phone, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { createPreviewOrder } from "../../services/previewOrders";
import { toCartSummary } from "../../services/previewCart";
import { clearDirectCheckout, readDirectCheckout } from "../../services/purchaseFlow";
import PremiumBreadcrumb from "../../components/common/PremiumBreadcrumb";
import { getProductPrimaryImage } from "../../utils/productImages";

const meetupLocations = [
  "Campus library main entrance",
  "Student union building",
  "Science block reception",
  "Business school lobby",
  "Hostel reception",
];

const paymentChoices = [
  { id: "meetup-cash", label: "Cash at meetup", detail: "Arrange payment directly when you meet the seller.", icon: Banknote },
  { id: "mtn-momo", label: "MTN Mobile Money", detail: "Mobile Money checkout will be connected later.", icon: Phone },
  { id: "airtel-money", label: "Airtel Money", detail: "Mobile Money checkout will be connected later.", icon: Phone },
  { id: "bank-transfer", label: "Bank transfer", detail: "Bank transfer checkout will be connected later.", icon: CreditCard },
];

const steps = ["Meetup", "Payment", "Confirmation"];

function StepIndicator({ activeStep }) {
  return (
    <ol aria-label="Checkout progress" className="mx-auto flex w-full max-w-[560px] items-center">
      {steps.map((label, index) => {
        const number = index + 1;
        const complete = number < activeStep;
        const active = number === activeStep;
        return <li key={label} className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`} aria-current={active ? "step" : undefined}>
          <div className="flex items-center gap-2.5">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${complete ? "bg-emerald-500 text-white" : active ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-500"}`}>{complete ? <Check size={15} /> : number}</span>
            <span className={`hidden text-xs font-semibold sm:block ${active ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
          </div>
          {index < steps.length - 1 && <span className={`mx-3 h-px flex-1 sm:mx-5 ${complete ? "bg-emerald-300" : "bg-slate-200"}`} />}
        </li>;
      })}
    </ol>
  );
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [directItems] = useState(() => readDirectCheckout());
  const isDirectPurchase = directItems.length > 0;
  const checkoutCart = useMemo(() => isDirectPurchase ? toCartSummary(directItems) : cart, [directItems, isDirectPurchase, cart]);
  const [step, setStep] = useState(1);
  const [meetupLocation, setMeetupLocation] = useState("");
  const [meetupNotes, setMeetupNotes] = useState("");
  const [paymentPreference, setPaymentPreference] = useState("");
  const [order, setOrder] = useState(null);

  const placePreviewOrder = () => {
    const created = createPreviewOrder(checkoutCart, { meetupLocation, meetupNotes: meetupNotes.trim(), paymentPreference });
    setOrder(created);
    if (isDirectPurchase) clearDirectCheckout();
    else clearCart();
    setStep(3);
  };

  if (!checkoutCart.items.length && !order) {
    return <div className="grid min-h-[60vh] place-items-center bg-[#fafaf9] px-5"><div className="max-w-md text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm"><ShoppingBag size={22} /></span><h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Your cart is empty</h1><p className="mt-2 text-sm text-slate-500">Add a listing before heading to checkout.</p><Link to="/products" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">Explore marketplace <ArrowRight size={15} /></Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="container-custom py-7 sm:py-9">
          <PremiumBreadcrumb items={[{ label: "Home", to: "/" }, { label: isDirectPurchase ? "Listing" : "Cart", to: isDirectPurchase ? `/products/${directItems[0].product.id}` : "/cart" }, { label: "Checkout" }]} />
          <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-amber-700">Secure your campus find</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.05em] text-slate-950">Checkout</h1></div><div className="w-full sm:max-w-[440px]"><StepIndicator activeStep={step} /></div></div>
        </div>
      </div>

      <div className="container-custom pt-7 sm:pt-9">
        {step < 3 ? (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
              {step === 1 ? (
                <>
                  <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><MapPin size={18} /></span><div><h2 className="text-base font-bold text-slate-900">Arrange your campus meetup</h2><p className="mt-1 text-xs leading-5 text-slate-500">Choose a convenient public place to meet the seller.</p></div></div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Meetup location <span className="text-rose-500">*</span></span><select required value={meetupLocation} onChange={(event) => setMeetupLocation(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10"><option value="">Choose a campus location</option>{meetupLocations.map((location) => <option key={location} value={location}>{location}</option>)}</select></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Note to seller <span className="font-medium text-slate-400">· optional</span></span><input value={meetupNotes} onChange={(event) => setMeetupNotes(event.target.value)} maxLength={160} placeholder="Suggest a time or add a note" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label>
                  </div>
                  <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-blue-50/80 p-3.5 text-xs leading-5 text-blue-800"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-700" /><span>Choose a public, familiar campus spot. Coordinate the final time with your seller.</span></div>
                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5"><Link to="/cart" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-slate-900"><ArrowLeft size={15} /> Back to cart</Link><button type="button" disabled={!meetupLocation} onClick={() => setStep(2)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Payment preference <ArrowRight size={15} /></button></div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CreditCard size={18} /></span><div><h2 className="text-base font-bold text-slate-900">Choose a payment preference</h2><p className="mt-1 text-xs leading-5 text-slate-500">This records your preferred way to pay. No payment will be processed in preview mode.</p></div></div>
                  <fieldset className="mt-6 grid gap-3 sm:grid-cols-2"><legend className="sr-only">Payment preference</legend>{paymentChoices.map(({ id, label, detail, icon: Icon }) => <label key={id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${paymentPreference === id ? "border-amber-400 bg-amber-50/70 ring-2 ring-amber-400/15" : "border-slate-200 hover:border-slate-300"}`}><input type="radio" name="payment" value={id} checked={paymentPreference === id} onChange={() => setPaymentPreference(id)} className="sr-only" /><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${paymentPreference === id ? "bg-amber-200 text-amber-900" : "bg-slate-100 text-slate-600"}`}><Icon size={17} /></span><span className="min-w-0"><span className="block text-xs font-bold text-slate-900">{label}</span><span className="mt-1 block text-[11px] leading-4 text-slate-500">{detail}</span></span><span className={`ml-auto mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${paymentPreference === id ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300"}`}>{paymentPreference === id && <Check size={11} />}</span></label>)}</fieldset>
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4"><p className="text-xs font-bold text-amber-950">Preview checkout</p><p className="mt-1 text-xs leading-5 text-amber-900/80">Placing this preview order only saves it to your device. No seller notification, transfer, card charge, or payment confirmation will occur.</p></div>
                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5"><button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-slate-900"><ArrowLeft size={15} /> Meetup details</button><button type="button" disabled={!paymentPreference} onClick={placePreviewOrder} className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">Place preview order <ArrowRight size={15} /></button></div>
                </>
              )}
            </section>

            <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-bold text-slate-900">{isDirectPurchase ? "Buy now summary" : "Order summary"} <span className="ml-1 font-medium text-slate-400">({checkoutCart.count})</span></h2>
              <ul className="mt-4 max-h-[280px] space-y-4 overflow-y-auto pr-1">{checkoutCart.items.map(({ product, quantity }) => <li key={product.id} className="flex gap-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100"><img src={getProductPrimaryImage(product)} alt="" className="h-full w-full object-cover" /><span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-slate-900 px-1 text-[9px] font-bold text-white">{quantity}</span></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-semibold leading-4 text-slate-800">{product.name}</p><p className="mt-1 text-[10px] text-slate-400">{product.seller_name}</p></div><span className="shrink-0 text-xs font-bold text-slate-800">K{(Number(product.price) * quantity).toLocaleString("en-ZM")}</span></li>)}</ul>
              <div className="my-4 h-px bg-slate-100" />
              <div className="space-y-2.5 text-xs"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-semibold text-slate-800">K{Number(checkoutCart.total).toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</span></div><div className="flex justify-between text-slate-500"><span>Meetup</span><span className="font-semibold text-slate-800">No delivery fee</span></div></div>
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-4"><span className="text-sm font-bold text-slate-800">Total</span><span className="text-lg font-bold tracking-tight text-slate-950">K{Number(checkoutCart.total).toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</span></div>
            </aside>
          </div>
        ) : (
          <section className="mx-auto max-w-[680px] rounded-2xl border border-slate-200/80 bg-white px-5 py-9 text-center sm:px-10 sm:py-12">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-emerald-50 text-emerald-600"><CheckCircle2 size={31} /></span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.15em] text-emerald-700">Preview order saved</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950">Your order preview is ready.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">This is a local preview only. Nothing was sent to a seller, and no payment was taken.</p>
            <div className="mx-auto mt-6 max-w-sm rounded-xl bg-slate-50 p-4 text-left"><div className="flex justify-between gap-3 text-xs"><span className="text-slate-500">Preview reference</span><span className="font-mono font-bold text-slate-900">{order?.id}</span></div><div className="mt-3 flex justify-between gap-3 text-xs"><span className="text-slate-500">Meetup location</span><span className="text-right font-semibold text-slate-800">{order?.meetupLocation}</span></div><div className="mt-3 flex justify-between gap-3 text-xs"><span className="text-slate-500">Payment preference</span><span className="text-right font-semibold text-slate-800">{paymentChoices.find((item) => item.id === order?.paymentPreference)?.label}</span></div><div className="mt-3 flex justify-between gap-3 border-t border-slate-200 pt-3 text-xs"><span className="font-semibold text-slate-700">Order total</span><span className="font-bold text-slate-950">K{Number(order?.subtotal || 0).toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</span></div></div>
            <div className="mt-7 flex flex-col justify-center gap-3 min-[440px]:flex-row"><Link to="/orders" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800">View order history <ArrowRight size={15} /></Link><Link to="/products" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Continue exploring</Link></div>
          </section>
        )}
        {step < 3 && <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400"><ShieldCheck size={14} /> Preview checkout · Order and payment actions are not sent to the backend.</p>}
      </div>
    </div>
  );
}
