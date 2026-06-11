import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faPhone, 
  faStore,
  faUserGraduate,
  faArrowRight,
  faSpinner
} from "@fortawesome/free-solid-svg-icons"
import { useAuth } from "../../contexts/AuthContext"
import FormInput from "../../components/ui/FormInput"
import AnimatedButton from "../../components/ui/AnimatedButton"
import { z } from "zod"
import api from "../../services/api"

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: z.string().optional(),
  role: z.enum(["buyer", "seller"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password2: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.password2, {
  message: "Passwords don't match",
  path: ["password2"],
})

const RegisterPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("buyer")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "buyer",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      password2: "",
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    
    const payload = {
      email: data.email,
      password: data.password,
      password2: data.password2,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || "",
      role: data.role,
    }
    
    try {
      const response = await api.post('/users/register/', payload)
      
      if (response.data) {
        setSuccessMessage('Registration successful! Redirecting to login...')
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      }
    } catch (error) {
      let message = 'Registration failed. '
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.email) message = errorData.email.join?.(", ") || errorData.email
        else if (errorData.password) message = errorData.password.join?.(", ") || errorData.password
        else if (errorData.detail) message = errorData.detail
        else message = "Please check your information"
      }
      
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setValue("role", role)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 bg-amber-500 rounded-2xl items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Join CampusEcom today</p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleRoleSelect("buyer")}
              className={`
                py-3 px-4 rounded-xl text-center transition-all
                ${selectedRole === "buyer" 
                  ? "bg-amber-500 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }
              `}
            >
              <FontAwesomeIcon icon={faUserGraduate} className="mr-2" />
              Buyer
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("seller")}
              className={`
                py-3 px-4 rounded-xl text-center transition-all
                ${selectedRole === "seller" 
                  ? "bg-amber-500 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }
              `}
            >
              <FontAwesomeIcon icon={faStore} className="mr-2" />
              Seller
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="First name"
                placeholder="John"
                icon={faUser}
                error={errors.first_name?.message}
                {...register("first_name")}
              />
              <FormInput
                label="Last name"
                placeholder="Doe"
                icon={faUser}
                error={errors.last_name?.message}
                {...register("last_name")}
              />
            </div>

            <FormInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={faEnvelope}
              error={errors.email?.message}
              {...register("email")}
            />

            <FormInput
              label="Phone (optional)"
              type="tel"
              placeholder="Your phone number"
              icon={faPhone}
              error={errors.phone?.message}
              {...register("phone")}
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="Create a password"
              icon={faLock}
              error={errors.password?.message}
              {...register("password")}
            />

            <FormInput
              label="Confirm password"
              type="password"
              placeholder="Confirm your password"
              icon={faLock}
              error={errors.password2?.message}
              {...register("password2")}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <>
                  Create account <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-600 hover:text-amber-500 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
