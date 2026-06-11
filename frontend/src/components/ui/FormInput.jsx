import { forwardRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"

const FormInput = forwardRef(({
  label,
  type = "text",
  placeholder,
  error,
  icon,
  required = false,
  className = "",
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  
  // Determine the actual input type
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={icon} className="text-gray-400 dark:text-gray-500 text-sm" />
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
            dark:bg-gray-800 dark:border-gray-700 dark:text-white
            transition-all duration-200
            ${icon ? "pl-10" : "pl-4"}
            ${isPassword ? "pr-12" : "pr-4"}
            ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700"}
            ${className}
          `}
          {...props}
        />
        
        {/* Password Toggle Button */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:opacity-70 transition-opacity"
            tabIndex={-1}
          >
            <FontAwesomeIcon 
              icon={showPassword ? faEyeSlash : faEye} 
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
            />
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fadeIn">{error}</p>
      )}
    </div>
  )
})

FormInput.displayName = "FormInput"

export default FormInput
