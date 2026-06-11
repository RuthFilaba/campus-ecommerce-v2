import { Link } from "react-router-dom";

export default function FeaturedBanner() {
  return (
    <section className="py-16 lg:py-20 px-4 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[32px] overflow-hidden">
          <div className="grid lg:grid-cols-2 items-center">
            <div className="p-8 lg:p-16">
              <span className="font-bold text-black/70">SPECIAL OFFER</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-4">Up To 50% Off</h2>
              <p className="mt-6 text-base lg:text-lg text-black/80">
                Save big on selected electronics, accessories and fashion items.
              </p>
              <Link to="/products" className="inline-block mt-6 lg:mt-8 bg-black text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold hover:bg-gray-800 transition">
                Shop Deals
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
              alt="Deals"
              className="h-64 lg:h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
