import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faPhone, faSave, faSpinner } from "@fortawesome/free-solid-svg-icons"
import Breadcrumb from "../components/common/Breadcrumb"
import toast from "react-hot-toast"
import { readPreferredCurrency, writePreferredCurrency } from "../services/currency"

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [preferredCurrency, setPreferredCurrency] = useState(readPreferredCurrency)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: ""
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || ""
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(formData)
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-2xl">
        <Breadcrumb />
        
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={user.email} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label htmlFor="preferred-currency" className="block text-sm font-medium mb-1">Preferred currency</label>
              <select id="preferred-currency" value={preferredCurrency} onChange={(event) => { setPreferredCurrency(event.target.value); writePreferredCurrency(event.target.value) }} className="w-full rounded-lg border bg-white px-4 py-2 focus:ring-2 focus:ring-amber-500">
                <option value="ZMW">Zambian Kwacha (ZMW)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">USD conversion uses the preview exchange rate set by an administrator.</p>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
              {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <><FontAwesomeIcon icon={faSave} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
