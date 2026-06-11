import { Link } from "react-router-dom"
import Sidebar from "../components/dashboard/Sidebar"
import TopBar from "../components/dashboard/TopBar"
import WelcomeSection from "../components/dashboard/WelcomeSection"
import QuickActions from "../components/dashboard/QuickActions"
import OrdersOverview from "../components/dashboard/OrdersOverview"
import Recommendations from "../components/dashboard/Recommendations"
import WishlistPreview from "../components/dashboard/WishlistPreview"
import Breadcrumb from "../components/common/Breadcrumb"

const DashboardPage = () => {
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Breadcrumb />
          <WelcomeSection />
          <QuickActions />
          <OrdersOverview />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Recommendations />
            </div>
            <div>
              <WishlistPreview />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">FAQs</h3>
                <p className="text-sm text-gray-500 mt-1">Track Return / Refund</p>
              </div>
              <Link to="/faq" className="text-amber-500 text-sm hover:underline">View All FAQs ?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
