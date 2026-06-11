import { useState } from "react";
import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import CategoryPills from "../components/home/CategoryPills";
import HorizontalProductRow from "../components/home/HorizontalProductRow";
import PremiumTrending from "../components/home/PremiumTrending";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";
import Footer from "../components/home/Footer";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategoryPills 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />
            <HorizontalProductRow category={activeCategory} />
          </div>
        </section>
        
        <PremiumTrending />
        <WhyChooseUs />
        <Testimonials />
        
      </main>
      <Footer />
    </div>
  );
}
