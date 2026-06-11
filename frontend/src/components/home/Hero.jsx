import { ArrowRight, ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.png"
          alt="Students shopping together"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&h=800&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          <span className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold">
            THE STUDENT MARKETPLACE
          </span>

          <h1 className="mt-6 text-white font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Everything you need,
            <span className="text-yellow-400"> right where you are.</span>
          </h1>

          <p className="mt-6 text-base lg:text-lg text-gray-200 max-w-lg">
            The trusted marketplace for the student community. Shop, sell and grow with confidence.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/products" className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 transition">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/register?role=seller" className="bg-white hover:bg-gray-100 text-black px-8 py-3 rounded-full font-bold transition">
              Start Selling
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 mt-10">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck size={18} className="text-yellow-400" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Truck size={18} className="text-yellow-400" />
              <span className="text-sm">Campus Meetup</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <BadgeCheck size={18} className="text-yellow-400" />
              <span className="text-sm">Verified Sellers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
