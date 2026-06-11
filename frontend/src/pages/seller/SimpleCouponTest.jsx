import { useState } from "react";

export default function SimpleCouponTest() {
  const [showModal, setShowModal] = useState(false);
  
  console.log("SimpleCouponTest rendered, showModal:", showModal);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Coupon Test Page</h1>
      <p className="mb-4">This is a simple test page to verify routing works.</p>
      
      <button
        onClick={() => {
          console.log("Button clicked, setting showModal to true");
          setShowModal(true);
        }}
        className="bg-amber-500 text-white px-4 py-2 rounded"
      >
        Open Modal
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl mb-4">Modal is Working!</h2>
            <button onClick={() => setShowModal(false)} className="bg-red-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
