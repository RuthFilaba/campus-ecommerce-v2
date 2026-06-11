const SkeletonLoader = ({ type = "card", count = 1 }) => {
  const skeletons = {
    card: (
      <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 mb-4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4 mb-2"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-1/2 mb-2"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-10 w-full"></div>
      </div>
    ),
    product: (
      <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 mb-4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-5 w-3/4 mb-3"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-1/2 mb-2"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-full mb-2"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-10 w-full mt-4"></div>
      </div>
    ),
    text: (
      <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-full mb-2"></div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-5/6"></div>
      </div>
    ),
  }

  return (
    <>
      {Array(count).fill().map((_, i) => (
        <div key={i}>{skeletons[type]}</div>
      ))}
    </>
  )
}

export default SkeletonLoader
