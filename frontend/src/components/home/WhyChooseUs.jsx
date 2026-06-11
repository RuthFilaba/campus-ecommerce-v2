import { ShieldCheck, Truck, BadgeCheck, Users } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Your transactions are protected and secure",
    color: "text-blue-600"
  },
  {
    icon: Truck,
    title: "Campus Meetup",
    description: "Free and flexible pickup at locations that work for you",
    color: "text-green-600"
  },
  {
    icon: BadgeCheck,
    title: "Verified Sellers",
    description: "Connect and trade only with verified sellers on your campus",
    color: "text-purple-600"
  },
  {
    icon: Users,
    title: "Student Community",
    description: "Built by students, for students, transparent and reliable",
    color: "text-amber-600"
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Shop with CampusEcom</h2>
          <p className="text-gray-500 mt-2">Built for students, by students</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Icon size={28} className={feature.color} />
                </div>
                <h3 className="font-semibold text-gray-800 mt-4">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{feature.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
