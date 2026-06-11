import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowRight, 
  faStar, 
  faTruck, 
  faShieldAlt, 
  faHeart,
  faShoppingBag,
  faClock,
  faCheckCircle,
  faStore,
  faLeaf,
  faRocket,
  faQuoteLeft,
  faGraduationCap,
  faHandshake,
  faChartLine
} from "@fortawesome/free-solid-svg-icons"
import api from "../services/api"

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products/featured/')
      let products = []
      if (response.data.results) {
        products = response.data.results
      } else if (Array.isArray(response.data)) {
        products = response.data
      }
      setFeaturedProducts(products.slice(0, 4))
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: "Electronics", icon: "faLaptop", image: "https://images.pexels.com/photos/18105/pexels-photo.jpg?w=600", description: "Laptops, phones & accessories" },
    { name: "Fashion", icon: "faShirt", image: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?w=600", description: "Clothing, shoes & style" },
    { name: "Books", icon: "faBook", image: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?w=600", description: "Textbooks & novels" },
    { name: "Sports", icon: "faFutbol", image: "https://images.pexels.com/photos/5131007/pexels-photo-5131007.jpeg?w=600", description: "Equipment & active wear" }
  ]

  const testimonials = [
    { 
      name: "Dr. Sarah Mwila", 
      role: "Lecturer, Mulungushi University", 
      text: "CampusEcom has transformed how students access resources. The platform is intuitive and secure.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    { 
      name: "John Banda", 
      role: "Student Seller", 
      text: "I sold my laptop within 24 hours. The meetup feature made the transaction smooth and safe.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    { 
      name: "Patricia Phiri", 
      role: "Buyer", 
      text: "Found all my textbooks at great prices. Saved over ZMW 800 this semester",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ]

  const features = [
    { icon: faHandshake, title: "Safe Campus Meetups", description: "Meet in person at designated campus locations", color: "from-emerald-500 to-emerald-600" },
    { icon: faShieldAlt, title: "Secure Payments", description: "Verified transactions with purchase protection", color: "from-blue-500 to-blue-600" },
    { icon: faGraduationCap, title: "Student Verified", description: "All sellers are verified students", color: "from-purple-500 to-purple-600" },
    { icon: faChartLine, title: "Best Prices", description: "Fair prices negotiated by students", color: "from-amber-500 to-amber-600" }
  ]

  return (
    <div className="bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Business deal focused */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40 z-10"></div>
          <img 
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=1920"
            alt="Students making a business deal on campus"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container-custom relative z-20 py-32 lg:py-40">
          <motion.div
            style={{ opacity, scale }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm px-5 py-2 rounded-full mb-6 shadow-lg"
            >
              <span className="text-white text-sm font-semibold tracking-wide">WELCOME TO MULUNGUSHI'S MARKETPLACE</span>
            </motion.div>

            {/* Main Heading - More visible with better contrast */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
            >
              Buy & Sell on
              <span className="text-amber-400 block mt-2">Campus with Confidence</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-100 mb-8 max-w-2xl leading-relaxed drop-shadow-lg"
            >
              The premier marketplace for Mulungushi University students. 
              Discover great deals, sell your items, and connect with fellow students — all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                to="/products" 
                className="group bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl"
              >
                Start Shopping
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/register" 
                className="group bg-white/10 backdrop-blur-md border-2 border-white hover:border-amber-400 text-white hover:text-amber-400 px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2"
              >
                Become a Seller
                <FontAwesomeIcon icon={faStore} className="group-hover:scale-110 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/20"
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar} className="text-amber-400 text-sm" />)}
                </div>
                <span className="text-sm text-gray-200">4.9/5 from 2,000+ reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldAlt} className="text-emerald-400" />
                <span className="text-sm text-gray-200">Secure Transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHandshake} className="text-amber-400" />
                <span className="text-sm text-gray-200">Safe Campus Meetups</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 bg-amber-500 rounded-full border-2 border-white"></div>
                  <div className="w-7 h-7 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-7 h-7 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm text-gray-200">1,000+ Active Students</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="w-7 h-11 border-2 border-white/40 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4">Built for the Campus Community</h2>
            <p className="text-gray-600 dark:text-gray-400">Everything you need for safe and convenient campus trading</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <FontAwesomeIcon icon={feature.icon} className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Shop by Category</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4">Explore Collections</h2>
            <p className="text-gray-600 dark:text-gray-400">Find exactly what you're looking for</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={`/products?category=${category.name.toLowerCase()}`}>
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-2xl font-bold">{category.name}</h3>
                      <p className="text-gray-200 text-sm mt-1">{category.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12 flex-wrap gap-4"
          >
            <div>
              <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Curated Picks</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2">Featured Products</h2>
            </div>
            <Link to="/products" className="group text-amber-500 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              View All <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img 
                          src={product.image_1 || product.image_url || "https://placehold.co/400x400/f59e0b/white?text=Product"} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-amber-50 transition-colors">
                            <FontAwesomeIcon icon={faHeart} className="text-gray-600 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{product.seller_name || "Campus Seller"}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar} className="text-amber-400 text-xs" />)}
                          </div>
                          <span className="text-xs text-gray-500">(5)</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xl font-bold text-amber-600">ZMW {product.price}</span>
                          <button className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4">Trusted by the Campus Community</h2>
            <p className="text-gray-600 dark:text-gray-400">What our users say about CampusEcom</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <FontAwesomeIcon icon={faQuoteLeft} className="text-amber-500 text-2xl mb-4 opacity-50" />
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar} className="text-amber-400 text-xs" />)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-500 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Ready to Start Your Journey
            </h2>
            <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students already buying and selling on CampusEcom
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="group bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all inline-flex items-center gap-2 shadow-lg">
                Get Started
                <FontAwesomeIcon icon={faRocket} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products" className="group border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold text-lg transition-all inline-flex items-center gap-2">
                Browse Products
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
