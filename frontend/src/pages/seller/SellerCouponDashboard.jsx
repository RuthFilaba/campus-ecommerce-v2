import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTicket, 
  faPlus, 
  faSearch, 
  faTrash, 
  faSpinner,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const SellerCouponDashboard = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 10,
    maximum_discount: "",
    minimum_order_amount: 0,
    valid_from: "",
    valid_to: "",
    usage_limit: 100,
    per_user_limit: 1
  });

  useEffect(() => {
    fetchCoupons();
    // Set default dates
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    setFormData(prev => ({
      ...prev,
      valid_from: now.toISOString().slice(0, 16),
      valid_to: nextMonth.toISOString().slice(0, 16)
    }));
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/coupons/seller/');
      const data = response.data.results || response.data;
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, code: random });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/coupons/seller/', formData);
      toast.success("Coupon created successfully!");
      setIsModalOpen(false);
      fetchCoupons();
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: 10,
        maximum_discount: "",
        minimum_order_amount: 0,
        valid_from: new Date().toISOString().slice(0, 16),
        valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        usage_limit: 100,
        per_user_limit: 1
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create coupon");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (confirm(`Delete coupon "${coupon.code}"?`)) {
      try {
        await api.delete(`/coupons/seller/${coupon.id}/`);
        toast.success("Coupon deleted");
        fetchCoupons();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const getStatus = (coupon) => {
    const now = new Date();
    if (!coupon.is_active) return { text: "Inactive", color: "bg-gray-100 text-gray-600" };
    if (new Date(coupon.valid_to) < now) return { text: "Expired", color: "bg-red-100 text-red-600" };
    if (new Date(coupon.valid_from) > now) return { text: "Scheduled", color: "bg-yellow-100 text-yellow-600" };
    return { text: "Active", color: "bg-green-100 text-green-600" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Coupons & Promotions</h1>
            <p className="text-gray-500 mt-1">Create and manage discounts for your store</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 shadow-md"
          >
            <FontAwesomeIcon icon={faPlus} /> Create Coupon
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by coupon code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Usage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Expiry</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                      No coupons found. Click "Create Coupon" to get started.
                    </td>
                  </tr>
                ) : (
                  coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase())).map((coupon) => {
                    const status = getStatus(coupon);
                    return (
                      <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-amber-600">{coupon.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          {coupon.discount_type === "percentage" 
                            ? `${coupon.discount_value}%` 
                            : `K${coupon.discount_value}`}
                        </td>
                        <td className="px-4 py-3">
                          {coupon.used_count || 0} / {coupon.usage_limit}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(coupon.valid_to).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDelete(coupon)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Basic Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="SAVE10"
                        required
                      />
                      <button type="button" onClick={generateCode} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                        Generate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Summer sale discount"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Settings */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Discount Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (K)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Value</label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Discount (Optional)</label>
                    <input
                      type="number"
                      value={formData.maximum_discount}
                      onChange={(e) => setFormData({ ...formData, maximum_discount: e.target.value ? parseFloat(e.target.value) : "" })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Order Amount</label>
                    <input
                      type="number"
                      value={formData.minimum_order_amount}
                      onChange={(e) => setFormData({ ...formData, minimum_order_amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Validity Period</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.valid_to}
                      onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Usage Limits */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Usage Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Usage Limit</label>
                    <input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Per User Limit</label>
                    <input
                      type="number"
                      value={formData.per_user_limit}
                      onChange={(e) => setFormData({ ...formData, per_user_limit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
                  {formLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCouponDashboard;
