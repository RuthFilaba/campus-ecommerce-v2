import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowDownUp, ArrowRight, ChevronDown, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { categories, getCategoryLabel, getConditionLabel, previewProducts } from "../data/previewProducts";
import PremiumBreadcrumb from "../components/common/PremiumBreadcrumb";

const conditions = [
  { id: "new", label: "New" },
  { id: "like_new", label: "Like new" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
];

const sortOptions = [
  { id: "recommended", label: "Recommended" },
  { id: "newest", label: "Recently added" },
  { id: "price-low", label: "Price: low to high" },
  { id: "price-high", label: "Price: high to low" },
  { id: "name", label: "Name: A to Z" },
];

function PreviewProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const condition = getConditionLabel(product.condition);

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_42px_rgba(15,23,42,.09)]">
      <Link to={`/products/${product.id}`} className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-amber-400/50" aria-label={`View ${product.name}`}>
        <div className="relative aspect-[1.12/1] overflow-hidden bg-slate-100">
          {imageFailed ? (
            <div className="grid h-full place-items-center bg-gradient-to-br from-amber-50 via-orange-50 to-slate-100 text-5xl font-bold text-amber-300">{product.name.charAt(0)}</div>
          ) : (
            <img src={product.image_url} alt={product.name} loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]" />
          )}
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur">{condition}</span>
          {product.stock === 1 && <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">One available</span>}
          <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm transition group-hover:bg-amber-400 group-hover:text-slate-950"><ArrowRight size={15} /></span>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.13em] text-slate-400">{getCategoryLabel(product.category)}</p>
          <h2 className="mt-1.5 min-h-11 text-sm font-semibold leading-5 tracking-[-.015em] text-slate-900 sm:text-[15px]">{product.name}</h2>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3.5">
            <span className="text-lg font-bold tracking-[-.035em] text-slate-950">K{Number(product.price).toLocaleString("en-ZM")}</span>
            <span className="max-w-[48%] truncate text-right text-[11px] font-medium text-slate-500">{product.seller_name}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [minimumInput, setMinimumInput] = useState(searchParams.get("min_price") || "");
  const [maximumInput, setMaximumInput] = useState(searchParams.get("max_price") || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get("category") || "";
  const condition = searchParams.get("condition") || "";
  const query = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "recommended";
  const minimum = Number(searchParams.get("min_price")) || 0;
  const maximum = Number(searchParams.get("max_price")) || Infinity;

  useEffect(() => {
    setSearchInput(query);
    setMinimumInput(searchParams.get("min_price") || "");
    setMaximumInput(searchParams.get("max_price") || "");
  }, [query, searchParams]);

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next, { replace: true });
  };

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = previewProducts.filter((product) => {
      const matchesQuery = !normalizedQuery || `${product.name} ${product.description} ${product.seller_name} ${getCategoryLabel(product.category)}`.toLowerCase().includes(normalizedQuery);
      return matchesQuery
        && (!category || product.category === category)
        && (!condition || product.condition === condition)
        && product.price >= minimum
        && product.price <= maximum;
    });

    if (sort === "price-low") return filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-high") return filtered.sort((a, b) => b.price - a.price);
    if (sort === "name") return filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "newest") return filtered.reverse();
    return filtered;
  }, [category, condition, maximum, minimum, query, sort]);

  const activeFilterCount = [category, condition, searchParams.get("min_price"), searchParams.get("max_price")].filter(Boolean).length;
  const clearFilters = () => {
    setSearchInput("");
    setMinimumInput("");
    setMaximumInput("");
    setSearchParams({}, { replace: true });
  };

  const submitSearch = (event) => {
    event.preventDefault();
    updateParams({ search: searchInput.trim() });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-16">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="container-custom py-8 sm:py-10">
          <PremiumBreadcrumb items={[{ label: "Home", to: "/" }, { label: "Marketplace" }]} />
          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-amber-700"><Sparkles size={12} /> Marketplace preview</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-.055em] text-slate-950 sm:text-[40px]">Find your next good thing.</h1>
              <p className="mt-2 text-sm text-slate-500">Explore sample listings from around the Mulungushi University community.</p>
            </div>
            <form onSubmit={submitSearch} role="search" className="relative w-full lg:max-w-[390px]">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search the marketplace" aria-label="Search the marketplace" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" />
              {searchInput && <button type="button" onClick={() => { setSearchInput(""); updateParams({ search: "" }); }} aria-label="Clear search" className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={15} /></button>}
            </form>
          </div>
        </div>
      </div>

      <div className="container-custom pt-7 sm:pt-9">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Product categories">
          <button type="button" onClick={() => updateParams({ category: "" })} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${!category ? "bg-slate-950 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}>All items</button>
          {categories.map((item) => <button key={item.id} type="button" onClick={() => updateParams({ category: category === item.id ? "" : item.id })} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === item.id ? "bg-slate-950 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}>{item.label}</button>)}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition ${filtersOpen || activeFilterCount ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
              <SlidersHorizontal size={15} /> Filters {activeFilterCount > 0 && <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${filtersOpen || activeFilterCount ? "bg-white/15" : "bg-amber-100 text-amber-800"}`}>{activeFilterCount}</span>}
            </button>
            <span className="text-xs text-slate-500"><strong className="font-bold text-slate-800">{products.length}</strong> {products.length === 1 ? "listing" : "listings"}</span>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-500">
            <ArrowDownUp size={14} />
            <span className="hidden sm:inline">Sort</span>
            <select value={sort} onChange={(event) => updateParams({ sort: event.target.value === "recommended" ? "" : event.target.value })} aria-label="Sort listings" className="max-w-[150px] cursor-pointer bg-transparent font-semibold text-slate-700 outline-none">
              {sortOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none -ml-1" />
          </label>
        </div>

        {filtersOpen && (
          <section aria-label="Filter listings" className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
              <fieldset>
                <legend className="mb-2 text-xs font-bold text-slate-700">Condition</legend>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((item) => <button key={item.id} type="button" onClick={() => updateParams({ condition: condition === item.id ? "" : item.id })} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${condition === item.id ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{item.label}</button>)}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-xs font-bold text-slate-700">Price range · ZMW</legend>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor="price-min">Minimum price</label><input id="price-min" inputMode="numeric" type="number" min="0" value={minimumInput} onChange={(event) => setMinimumInput(event.target.value)} placeholder="Min" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" />
                  <span className="text-slate-300">—</span>
                  <label className="sr-only" htmlFor="price-max">Maximum price</label><input id="price-max" inputMode="numeric" type="number" min="0" value={maximumInput} onChange={(event) => setMaximumInput(event.target.value)} placeholder="Max" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10" />
                </div>
              </fieldset>
              <div className="flex gap-2">
                <button type="button" onClick={() => updateParams({ min_price: minimumInput, max_price: maximumInput })} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-xs font-bold text-slate-950 transition hover:bg-amber-300"><Filter size={14} /> Apply</button>
                <button type="button" onClick={clearFilters} className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Reset</button>
              </div>
            </div>
          </section>
        )}

        {products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <PreviewProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Search size={20} /></span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">No listings match those filters</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Try another search or clear the filters to explore all preview listings.</p>
            <button type="button" onClick={clearFilters} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800">Clear filters <ArrowRight size={14} /></button>
          </div>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400"><Filter size={13} /> Preview catalog · Listings and seller details are sample content until backend connection.</p>
      </div>
    </div>
  );
}
