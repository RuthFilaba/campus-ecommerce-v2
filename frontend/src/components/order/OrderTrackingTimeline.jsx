import { Check, Circle, MapPin, PackageCheck } from "lucide-react";
import { getTrackingStepIndex, previewTrackingSteps } from "../../services/orderTracking";

export default function OrderTrackingTimeline({ status, events = [], note = "", meetupLocation = "", compact = false }) {
  const currentIndex = getTrackingStepIndex(status);
  const isCancelled = currentIndex < 0;
  const latestEvent = [...events].reverse().find((event) => event.note || event.at);

  if (isCancelled) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">This order was cancelled.</div>;
  }

  return (
    <section aria-label={`Order tracking: ${status}`} className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2"><PackageCheck size={16} className="text-amber-700" /><h3 className="text-sm font-bold text-slate-900">Order tracking</h3></div>
      <ol className={`mt-4 ${compact ? "grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5" : "space-y-3"}`}>
        {previewTrackingSteps.map((step, index) => {
          const done = index < currentIndex || (currentIndex === 4 && index === 4);
          const current = index === currentIndex;
          const event = [...events].reverse().find((item) => getTrackingStepIndex(item.status) === index);
          return (
            <li key={step.key} className="flex min-w-0 items-start gap-2">
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${done ? "bg-emerald-100 text-emerald-700" : current ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-400"}`}>
                {done ? <Check size={12} /> : <Circle size={8} fill="currentColor" />}
              </span>
              <span className="min-w-0"><span className={`block text-xs font-semibold ${done || current ? "text-slate-900" : "text-slate-400"}`}>{step.label}</span>{!compact && event?.at && <time className="mt-0.5 block text-[10px] text-slate-400">{new Date(event.at).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })}</time>}</span>
            </li>
          );
        })}
      </ol>
      {(note || meetupLocation || latestEvent?.at) && <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        {note && <p className="text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">Seller update:</span> {note}</p>}
        {meetupLocation && <p className="flex items-start gap-1.5 text-xs text-slate-600"><MapPin size={13} className="mt-0.5 shrink-0 text-amber-700" /><span><span className="font-semibold text-slate-800">Meetup:</span> {meetupLocation}</span></p>}
        {latestEvent?.at && <p className="text-[10px] text-slate-400">Last updated {new Date(latestEvent.at).toLocaleString("en-ZM", { dateStyle: "medium", timeStyle: "short" })}</p>}
      </div>}
    </section>
  );
}
