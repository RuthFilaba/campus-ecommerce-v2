import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 28 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 lg:py-20 px-4 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-[32px] p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div>
              <div className="flex items-center gap-3">
                <Clock className="text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Limited Time Offer</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold mt-4">Flash Sale</h2>
              <p className="text-gray-300 mt-4">Get exclusive discounts before they expire.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white text-black p-4 lg:p-5 rounded-2xl text-center min-w-[80px]">
                <h3 className="text-2xl lg:text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</h3>
                <p className="text-sm">Hours</p>
              </div>
              <div className="bg-white text-black p-4 lg:p-5 rounded-2xl text-center min-w-[80px]">
                <h3 className="text-2xl lg:text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</h3>
                <p className="text-sm">Mins</p>
              </div>
              <div className="bg-white text-black p-4 lg:p-5 rounded-2xl text-center min-w-[80px]">
                <h3 className="text-2xl lg:text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</h3>
                <p className="text-sm">Secs</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link to="/products" className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-500 transition">
              Shop Flash Sale
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
