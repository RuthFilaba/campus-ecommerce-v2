export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-green-100 p-8 rounded-lg text-center">
        <h1 className="text-2xl font-bold text-green-700">Seller Page Test</h1>
        <p className="mt-2">If you can see this, seller routing is working!</p>
        <p className="mt-4 text-sm text-gray-600">Path: {window.location.pathname}</p>
      </div>
    </div>
  );
}
