const RatingStars = ({ rating = 0, reviewCount = 0, size = "sm" }) => {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={sizes[size]}>
            {star <= rating ? "?" : "?"}
          </span>
        ))}
      </div>
      {reviewCount > 0 && (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          ({reviewCount})
        </span>
      )}
    </div>
  )
}

export default RatingStars
