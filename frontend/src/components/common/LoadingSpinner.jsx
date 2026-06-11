const LoadingSpinner = ({ fullScreen = false, size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={"animate-spin rounded-full border-4 border-primary-500 border-t-transparent " + sizeClasses[size]}></div>
      <p className="text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner
