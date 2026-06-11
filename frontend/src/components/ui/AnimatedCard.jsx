import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const AnimatedCard = ({ children, className = "", delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedCard
