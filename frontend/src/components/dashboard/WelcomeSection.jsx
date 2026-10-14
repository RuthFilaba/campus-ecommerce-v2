import { useAuth } from "../../contexts/AuthContext"

const WelcomeSection = () => {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-800 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {greeting}, {user?.first_name || user?.email?.split('@')[0]}! ??
      </h2>
      <p className="text-gray-500 mt-1">Discover something new today</p>
      
      <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-500">8</p>
          <p className="text-xs text-gray-500">Recently Viewed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-500">12</p>
          <p className="text-xs text-gray-500">Frequently Bought</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-500">3</p>
          <p className="text-xs text-gray-500">In Cart</p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeSection
