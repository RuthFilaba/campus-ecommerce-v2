import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faLock, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useAuth } from "../../contexts/AuthContext"
import FormInput from "../../components/ui/FormInput"
import AnimatedButton from "../../components/ui/AnimatedButton"
import { loginSchema } from "../../utils/validators"
import { isPreviewAuth } from "../../services/auth"
import { useCart } from "../../contexts/CartContext"
import { clearPendingPurchase, readPendingPurchase, saveDirectCheckout } from "../../services/purchaseFlow"

const LoginPage = () => {
  const { login } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  
  const from = location.state?.from?.pathname || "/"

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: location.state?.email || "" },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    const success = await login(data.email, data.password)
    setIsLoading(false)
    
    if (success) {
      const pendingPurchase = readPendingPurchase()
      if (pendingPurchase?.product && pendingPurchase.type === "add-to-cart") {
        addItem(pendingPurchase.product, pendingPurchase.quantity)
        clearPendingPurchase()
        navigate("/cart", { replace: true })
        return
      }
      if (pendingPurchase?.product && pendingPurchase.type === "buy-now") {
        saveDirectCheckout(pendingPurchase.product, pendingPurchase.quantity)
        clearPendingPurchase()
        navigate("/checkout", { replace: true })
        return
      }
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your CampusEcom account
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={faEnvelope}
              required
              error={errors.email?.message}
              {...register("email")}
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={faLock}
              required
              error={errors.password?.message}
              {...register("password")}
            />

            {isPreviewAuth && (
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-amber-50 p-3">
                <p className="col-span-2 text-[11px] font-semibold text-amber-900">Quick preview sign in</p>
                {[
                  { label: "Test as buyer", email: "buyer@campusecom.zm" },
                  { label: "Test as seller", email: "seller@campusecom.zm" },
                ].map(({ label, email }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => {
                      setValue("email", email, { shouldValidate: true })
                      setValue("password", "preview123", { shouldValidate: true })
                    }}
                    className="rounded-lg border border-amber-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-800"
                  >
                    {label}
                  </button>
                ))}
                <p className="col-span-2 text-[10px] text-amber-800">Demo password: preview123</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-amber-600 hover:text-amber-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <AnimatedButton
              type="submit"
              fullWidth
              loading={isLoading}
            >
              Sign In
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </AnimatedButton>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  New to CampusEcom?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Create New Account
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Preview sign-in guidance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-gray-500 dark:text-gray-400"
        >
          <p>Preview sign in is enabled. Use any valid email and password.</p>
          <p>No database connection is required; preview passwords are not saved.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
