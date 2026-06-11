import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faStore, 
  faSave, 
  faSpinner, 
  faArrowLeft,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faInfoCircle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

const StoreSettingsPage = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    store_name: "",
    store_description: "",
    phone: "",
    address: "",
    pickup_location: "",
    business_hours: "Mon-Fri: 9AM - 5PM"
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchStoreSettings()
  }, [isAuthenticated])

  const fetchStoreSettings = async () => {
    try {
      const response = await api.get('/users/me/')
      const userData = response.data.user || response.data
      
      setFormData({
        store_name: userData.store_name || `${userData.first_name || "Campus"}'s Store`,
        store_description: userData.store_description || "Quality products for campus students",
        phone: userData.phone || "",
        address: userData.address || "Mulungushi University Campus",
        pickup_location: userData.pickup_location || "Library - Main Entrance",
        business_hours: userData.business_hours || "Mon-Fri: 9AM - 5PM"
      })
    } catch (error) {
      console.error("Failed to fetch store settings:", error)
      toast.error("Failed to load store settings")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await api.patch('/users/me/', {
        store_name: formData.store_name,
        store_description: formData.store_description,
        phone: formData.phone,
        address: formData.address,
        pickup_location: formData.pickup_location,
        business_hours: formData.business_hours
      })
      toast.success("Store settings updated successfully!")
    } catch (error) {
      console.error("Failed to update store settings:", error)
      toast.error("Failed to update store settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-3xl">
        <button
          onClick={() => navigate("/seller/dashboard")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faStore} className="text-white text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-white">Store Settings</h1>
                <p className="text-amber-100 text-sm mt-1">Manage your store information</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faStore} className="mr-2 text-amber-500" />
                Store Name
              </label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-amber-500" />
                Store Description
              </label>
              <textarea
                name="store_description"
                value={formData.store_description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-amber-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-amber-500" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Pickup Location
              </label>
              <select
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
              >
                <option value="Library - Main Entrance">Library - Main Entrance</option>
                <option value="Student Center - Food Court">Student Center - Food Court</option>
                <option value="ICT Building - Reception">ICT Building - Reception</option>
                <option value="Administration Block">Administration Block</option>
                <option value="Sports Complex">Sports Complex</option>
                <option value="Hostels Area">Hostels Area</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Hours
              </label>
              <input
                type="text"
                name="business_hours"
                value={formData.business_hours}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/seller/dashboard")}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors dark:border-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Store Tips:</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• A complete store profile builds trust with buyers</li>
            <li>• Set clear pickup locations for smooth meetups</li>
            <li>• Respond to messages quickly to increase sales</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default StoreSettingsPage
