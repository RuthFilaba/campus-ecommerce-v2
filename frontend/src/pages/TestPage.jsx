import { Link } from "react-router-dom";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">?</div>
        <h1 className="text-2xl font-bold text-green-600 mb-4">Test Page is Working!</h1>
        <p className="text-gray-600 mb-4">If you can see this page, routing is working correctly.</p>
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p className="text-sm text-gray-600">Current URL: <span className="font-mono">{window.location.pathname}</span></p>
        </div>
        <Link to="/seller/sales" className="text-blue-600 hover:underline">Go back to Sales</Link>
      </div>
    </div>
  );
}
