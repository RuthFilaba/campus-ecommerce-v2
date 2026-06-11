import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "4th Year Student",
    review: "Found all my textbooks at half the price. The campus meetup was super convenient.",
    rating: 5
  },
  {
    name: "John K.",
    role: "Campus Seller",
    review: "Sold my laptop within 48 hours. The verification process kept scammers away.",
    rating: 5
  },
  {
    name: "Mary Mwila",
    role: "Business Student",
    review: "Easy to use, fast transactions, and trusted sellers. Best campus marketplace!",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Trusted by Students</h2>
          <p className="text-gray-500 mt-2">What our community is saying</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FACC15" color="#FACC15" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">"{testimonial.review}"</p>
              <div className="mt-4">
                <p className="font-semibold text-gray-800">{testimonial.name}</p>
                <p className="text-xs text-gray-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
