import { Users, Clock, TrendingUp, Heart } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Join our community",
    description: "Connect with thousands of students and sellers",
  },
  {
    icon: Clock,
    title: "List in minutes",
    description: "Start selling in less than 2 minutes",
  },
  {
    icon: TrendingUp,
    title: "Earn on your terms",
    description: "Sell what you no longer need and make extra cash",
  },
  {
    icon: Heart,
    title: "Support local",
    description: "Empower your campus and beyond",
  },
];

export default function Community() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Join our community</h2>
          <p className="text-gray-500 mt-2">Be part of something bigger</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center p-6 rounded-xl hover:bg-gray-50 transition">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <feature.icon size={28} className="text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mt-4">{feature.title}</h3>
              <p className="text-gray-500 text-sm mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
