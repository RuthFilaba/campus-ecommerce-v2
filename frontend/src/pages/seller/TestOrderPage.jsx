import { useParams } from "react-router-dom";

const TestOrderPage = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">? Page is Working!</h1>
        <p className="text-gray-700 mb-2">You are on the Seller Order Page</p>
        <p className="text-amber-600 font-bold">Order ID: {id}</p>
        <p className="text-sm text-gray-500 mt-4">If you see this, routing is working correctly.</p>
      </div>
    </div>
  );
};

export default TestOrderPage;
