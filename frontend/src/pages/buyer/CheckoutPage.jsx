import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Banknote, Check, CheckCircle2, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { toCartSummary } from "../../services/previewCart";
import { clearDirectCheckout, readDirectCheckout } from "../../services/purchaseFlow";
import api from "../../services/api";
import PremiumBreadcrumb from "../../components/common/PremiumBreadcrumb";
import { getProductPrimaryImage } from "../../utils/productImages";
import { formatMoney } from "../../services/currency";

const meetupLocations = [
  "Campus library main entrance",
  "Student union building",
  "Science block reception",
  "Business school lobby",
  "Hostel reception",
];

const paymentChoices = [
  { id: "cash", label: "Cash on meetup", detail: "Pay the seller at the arranged campus meetup.", icon: Banknote },
];

const steps = ["Delivery", "Payment", "Review"];

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
  const { user } = useAuth();
  const [directItems] = useState(() => readDirectCheckout());
  const isDirectPurchase = directItems.length > 0;
  const checkoutCart = useMemo(() => isDirectPurchase ? toCartSummary(directItems) : cart, [directItems, isDirectPurchase, cart]);
  const [step, setStep] = useState(1);
  const [meetupLocation, setMeetupLocation] = useState("");
  const [meetupNotes, setMeetupNotes] = useState("");
  const [recipientName, setRecipientName] = useState(`${user?.first_name || ""} ${user?.last_name || ""}`.trim());
  const [contactNumber, setContactNumber] = useState(user?.phone || "");
  const [paymentPreference, setPaymentPreference] = useState("");
  const [orders, setOrders] = useState([]);
  const [checkoutError, setCheckoutError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const checkoutTotal = Number(checkoutCart.total);
  const hasUnavailableItem = checkoutCart.items.some(({ product, quantity }) => Number(product.stock ?? 0) < Number(quantity));

  const placeOrder = async () => {
    if (hasUnavailableItem || placingOrder) return;
    setPlacingOrder(true);
    setCheckoutError("");
    try {
      const createdOrders = [];
      for (const { product, quantity } of checkoutCart.items) {
        const orderResponse = await api.post("/orders/create/", {
          product_id: product.id,
          quantity,
          meetup_location: meetupLocation,
          meetup_notes: [meetupNotes.trim(), `Recipient: ${recipientName.trim()}`, `Contact: ${contactNumber.trim()}`].filter(Boolean).join(" · "),
        });
        const order = orderResponse.data;
        const paymentResponse = await api.post("/payments/create/", {
          order_id: order.id,
          payment_method: paymentPreference,
          phone_number: contactNumber.trim(),
        });
        createdOrders.push({ ...order, payment: paymentResponse.data });
      }
      setOrders(createdOrders);
      if (isDirectPurchase) clearDirectCheckout();
      else await clearCart();
      setStep(4);
    } catch (error) {
      setCheckoutError(error.response?.data?.error || error.response?.data?.detail || "Could not place your order. Check your items and try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!checkoutCart.items.length && !orders.length) {
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
        {step < 4 ? (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
              {step === 1 ? (
                <>
                  {hasUnavailableItem && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">One or more items no longer have enough stock. Return to the cart and update your quantities.</div>}
                  <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><MapPin size={18} /></span><div><h2 className="text-base font-bold text-slate-900">Delivery and meetup details</h2><p className="mt-1 text-xs leading-5 text-slate-500">Add a way for the seller to coordinate a safe campus handoff.</p></div></div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Recipient name <span className="text-rose-500">*</span></span><input required value={recipientName} onChange={(event) => setRecipientName(event.target.value)} maxLength={100} autoComplete="name" placeholder="Full name" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Contact number <span className="text-rose-500">*</span></span><input required type="tel" value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} maxLength={30} autoComplete="tel" placeholder="Phone number" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Meetup location <span className="text-rose-500">*</span></span><select required value={meetupLocation} onChange={(event) => setMeetupLocation(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10"><option value="">Choose a campus location</option>{meetupLocations.map((location) => <option key={location} value={location}>{location}</option>)}</select></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Note to seller <span className="font-medium text-slate-400">· optional</span></span><input value={meetupNotes} onChange={(event) => setMeetupNotes(event.target.value)} maxLength={160} placeholder="Suggest a time or add a note" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" /></label>
                  </div>
                  <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-blue-50/80 p-3.5 text-xs leading-5 text-blue-800"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-700" /><span>Choose a public, familiar campus spot. Coordinate the final time with your seller.</span></div>
                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5"><Link to="/cart" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-slate-900"><ArrowLeft size={15} /> Back to cart</Link><button type="button" disabled={!recipientName.trim() || !contactNumber.trim() || !meetupLocation} onClick={() => setStep(2)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Payment preference <ArrowRight size={15} /></button></div>
                </>
              ) : step === 2 ? (
                <>
                  <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CreditCard size={18} /></span><div><h2 className="text-base font-bold text-slate-900">Choose a payment method</h2><p className="mt-1 text-xs leading-5 text-slate-500">A payment record and payment instructions will be created with your order.</p></div></div>
                  <fieldset className="mt-6 grid gap-3 sm:grid-cols-2"><legend className="sr-only">Payment preference</legend>{paymentChoices.map(({ id, label, detail, icon: Icon }) => <label key={id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${paymentPreference === id ? "border-amber-400 bg-amber-50/70 ring-2 ring-amber-400/15" : "border-slate-200 hover:border-slate-300"}`}><input type="radio" name="payment" value={id} checked={paymentPreference === id} onChange={() => setPaymentPreference(id)} className="sr-only" /><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${paymentPreference === id ? "bg-amber-200 text-amber-900" : "bg-slate-100 text-slate-600"}`}><Icon size={17} /></span><span className="min-w-0"><span className="block text-xs font-bold text-slate-900">{label}</span><span className="mt-1 block text-[11px] leading-4 text-slate-500">{detail}</span></span><span className={`ml-auto mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${paymentPreference === id ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300"}`}>{paymentPreference === id && <Check size={11} />}</span></label>)}</fieldset>
                  {hasUnavailableItem && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">One or more items no longer have enough stock. Return to the cart and update your quantities.</div>}
                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5"><button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-slate-900"><ArrowLeft size={15} /> Meetup details</button><button type="button" disabled={!paymentPreference || hasUnavailableItem} onClick={() => setStep(3)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">Review order <ArrowRight size={15} /></button></div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShoppingBag size={18} /></span><div><h2 className="text-base font-bold text-slate-900">Review your order</h2><p className="mt-1 text-xs leading-5 text-slate-500">Check your contact, meetup, payment preference, and total before placing.</p></div></div>
                  <dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4"><div className="flex justify-between gap-4 py-3 text-xs"><dt className="text-slate-500">Recipient</dt><dd className="text-right font-semibold text-slate-900">{recipientName}</dd></div><div className="flex justify-between gap-4 py-3 text-xs"><dt className="text-slate-500">Contact</dt><dd className="text-right font-semibold text-slate-900">{contactNumber}</dd></div><div className="flex justify-between gap-4 py-3 text-xs"><dt className="text-slate-500">Campus meetup</dt><dd className="text-right font-semibold text-slate-900">{meetupLocation}</dd></div><div className="flex justify-between gap-4 py-3 text-xs"><dt className="text-slate-500">Payment preference</dt><dd className="text-right font-semibold text-slate-900">{paymentChoices.find((item) => item.id === paymentPreference)?.label}</dd></div><div className="flex justify-between gap-4 py-3 text-xs"><dt className="text-slate-500">Order total</dt><dd className="text-right font-bold text-slate-950">{formatMoney(checkoutTotal)}</dd></div></dl>
                  {hasUnavailableItem && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">One or more items no longer have enough stock. Return to the cart and update your quantities.</div>}
                  {checkoutError && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{checkoutError}</p>}
                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5"><button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-slate-900"><ArrowLeft size={15} /> Payment method</button><button type="button" disabled={hasUnavailableItem || placingOrder} onClick={placeOrder} className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">{placingOrder ? "Placing order…" : "Place order"} <ArrowRight size={15} /></button></div>
                </>
              )}
            </section>

            <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-bold text-slate-900">{isDirectPurchase ? "Buy now summary" : "Order summary"} <span className="ml-1 font-medium text-slate-400">({checkoutCart.count})</span></h2>
              <ul className="mt-4 max-h-[280px] space-y-4 overflow-y-auto pr-1">{checkoutCart.items.map(({ product, quantity }) => <li key={product.id} className="flex gap-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100"><img src={getProductPrimaryImage(product)} alt="" className="h-full w-full object-cover" /><span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-slate-900 px-1 text-[9px] font-bold text-white">{quantity}</span></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-semibold leading-4 text-slate-800">{product.name}</p><p className="mt-1 text-[10px] text-slate-400">{product.seller_name}</p></div><span className="shrink-0 text-xs font-bold text-slate-800">{formatMoney(Number(product.price) * quantity)}</span></li>)}</ul>
              <div className="my-4 h-px bg-slate-100" />
              <div className="mt-4 space-y-2.5 text-xs"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-semibold text-slate-800">{formatMoney(checkoutCart.total)}</span></div><div className="flex justify-between text-slate-500"><span>Meetup</span><span className="font-semibold text-slate-800">No delivery fee</span></div></div>
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-4"><span className="text-sm font-bold text-slate-800">Total</span><span className="text-lg font-bold tracking-tight text-slate-950">{formatMoney(checkoutTotal)}</span></div>
            </aside>
          </div>
        ) : (
          <section className="mx-auto max-w-[680px] rounded-2xl border border-slate-200/80 bg-white px-5 py-9 text-center sm:px-10 sm:py-12">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-emerald-50 text-emerald-600"><CheckCircle2 size={31} /></span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.15em] text-emerald-700">Order submitted</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950">Your order is with the seller.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">The backend recorded your order and created its payment instructions.</p>
            <ul className="mx-auto mt-6 max-w-sm divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 px-4 text-left">{orders.map((order) => <li key={order.id} className="py-3"><div className="flex justify-between gap-3 text-xs"><span className="text-slate-500">Order #{order.id}</span><span className="font-semibold text-slate-900">{formatMoney(order.total_price)}</span></div><p className="mt-1 text-[11px] text-slate-500">Payment {order.payment.status}: {order.payment.transaction_reference}</p></li>)}</ul>
            <div className="mt-7 flex flex-col justify-center gap-3 min-[440px]:flex-row"><Link to="/orders" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800">View order history <ArrowRight size={15} /></Link><Link to="/products" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Continue exploring</Link></div>
          </section>
        )}
        {step < 4 && <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400"><ShieldCheck size={14} /> Orders and payment records are submitted securely to the marketplace.</p>}
      </div>
    </div>
  );
}
