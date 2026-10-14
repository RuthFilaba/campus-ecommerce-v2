import { ArrowRight, BookOpen, Check, GraduationCap, Laptop, MapPin, ShieldCheck, Shirt, Sparkles, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { label: "Tech & mobile", value: "tech-mobile", icon: Laptop, tone: "bg-blue-50 text-blue-700" },
  { label: "Academic", value: "academic", icon: BookOpen, tone: "bg-violet-50 text-violet-700" },
  { label: "Fashion", value: "fashion", icon: Shirt, tone: "bg-rose-50 text-rose-700" },
  { label: "Food & drinks", value: "food", icon: Utensils, tone: "bg-orange-50 text-orange-700" },
];

const featured = [
  { id: "sample-laptop", name: "Everyday tech, ready for class", category: "Tech & mobile", price: "Explore tech", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85", query: "tech-mobile" },
  { id: "sample-books", name: "Your next semester starts here", category: "Academic", price: "Find your books", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85", query: "academic" },
  { id: "sample-style", name: "A little something for your style", category: "Fashion", price: "Browse fashion", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", query: "fashion" },
];

const benefits = [
  { icon: GraduationCap, title: "Made for campus life", text: "Find useful things from people in your university community." },
  { icon: MapPin, title: "Meet nearby", text: "Coordinate a convenient campus meetup with your seller." },
  { icon: ShieldCheck, title: "Shop with confidence", text: "See seller and listing details before you make a decision." },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <main>
        <section className="container-custom pb-12 pt-7 sm:pb-16 sm:pt-9 lg:pb-20 lg:pt-11">
          <div className="relative isolate min-h-[540px] overflow-hidden rounded-[28px] bg-slate-950 sm:min-h-[590px] sm:rounded-[34px] lg:min-h-[620px]">
            <img src="/images/hero-bg.png" alt="Students connecting in the campus marketplace" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/10" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/10" />
            <div className="flex min-h-[540px] items-center px-6 py-14 sm:min-h-[590px] sm:px-12 sm:py-16 lg:min-h-[620px] lg:px-[7%]">
              <div className="max-w-[620px]">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.14em] text-white backdrop-blur-md">
                  <Sparkles size={14} className="text-amber-300" /> The marketplace for campus
                </div>
                <h1 className="max-w-[640px] text-[42px] font-semibold leading-[1.05] tracking-[-.055em] text-white sm:text-6xl lg:text-[68px]">
                  Good finds.<br />
                  <span className="text-amber-400">Closer to home.</span>
                </h1>
                <p className="mt-6 max-w-[490px] text-[15px] leading-7 text-white/75 sm:text-[17px] sm:leading-8">
                  Discover useful finds from the Mulungushi University community. Shop nearby, connect with student sellers, and make campus life a little easier.
                </p>
                <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
                  <Link to="/products" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 shadow-[0_10px_28px_rgba(245,158,11,.24)] transition hover:-translate-y-0.5 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40">
                    Explore marketplace <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/register?role=seller" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/15">
                    Start selling
                  </Link>
                </div>
                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-xs font-medium text-white/75 sm:text-[13px]">
                  <span className="inline-flex items-center gap-2"><Check size={15} className="text-amber-300" /> Browse campus listings</span>
                  <span className="inline-flex items-center gap-2"><Check size={15} className="text-amber-300" /> Connect with local sellers</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white shadow-xl backdrop-blur-md md:block lg:bottom-8 lg:right-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950"><MapPin size={19} /></span>
                <span><span className="block text-xs font-semibold text-white/65">Your community</span><span className="mt-0.5 block text-sm font-bold">Mulungushi University</span></span>
              </div>
            </div>
          </div>
        </section>

        <section className="container-custom pb-16 sm:pb-20 lg:pb-24" aria-labelledby="categories-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-600">Find your thing</p>
              <h2 id="categories-title" className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950 sm:text-3xl">Explore by category</h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700">All categories <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {categories.map(({ label, value, icon: Icon, tone }) => (
              <Link key={value} to={`/products?category=${value}`} className="group flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_12px_rgba(15,23,42,.025)] transition duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_12px_28px_rgba(15,23,42,.07)] sm:min-h-[112px] sm:gap-4 sm:p-5">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone} transition-transform group-hover:scale-105 sm:h-12 sm:w-12`}><Icon size={21} strokeWidth={1.8} /></span>
                <span className="text-[13px] font-bold leading-5 text-slate-800 sm:text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-100 bg-[#fafaf9] py-16 sm:py-20 lg:py-24" aria-labelledby="featured-title">
          <div className="container-custom">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-600">Made for your next find</p>
                <h2 id="featured-title" className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950 sm:text-3xl">A marketplace full of possibility</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Browse student listings across the categories that make everyday campus life better.</p>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-amber-700">Browse listings <ArrowRight size={16} /></Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <Link key={item.id} to={`/products?category=${item.query}`} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,.1)]">
                  <div className="relative aspect-[1.65/1] overflow-hidden bg-slate-100">
                    <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                    <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">{item.category}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-5">
                    <span><span className="block text-[15px] font-semibold leading-6 tracking-[-.02em] text-slate-900">{item.name}</span><span className="mt-1 block text-xs font-semibold text-slate-500">{item.price}</span></span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-amber-400 group-hover:text-slate-950"><ArrowRight size={16} /></span>
                  </div>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">Category previews · Live listings will appear here when connected to the marketplace.</p>
          </div>
        </section>

        <section className="container-custom py-16 sm:py-20 lg:py-24" aria-labelledby="why-title">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-600">CampusEcom, closer to you</p>
            <h2 id="why-title" className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950 sm:text-3xl">A more connected way to shop</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">A simple place to discover what your campus community has to offer.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${index === 0 ? "bg-amber-50 text-amber-700" : index === 1 ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}><Icon size={20} strokeWidth={1.8} /></span>
                <h3 className="mt-5 text-base font-bold tracking-[-.02em] text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container-custom pb-16 sm:pb-20 lg:pb-24">
          <div className="relative overflow-hidden rounded-[26px] bg-slate-950 px-6 py-10 sm:rounded-[30px] sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute -right-16 -top-32 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
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
