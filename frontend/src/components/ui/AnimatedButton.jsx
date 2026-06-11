import { motion } from "framer-motion"

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  className = "",
  disabled = false,
  loading = false,
  fullWidth = false
}) => {
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    outline: "border-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        px-6 py-2.5 rounded-lg font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}

export default AnimatedButton
