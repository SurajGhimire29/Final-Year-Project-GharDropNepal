import React, { useState } from 'react';

const VendorHome = () => {
  // Mock State for Shop Details and Products
  const [shopInfo] = useState({ name: "GharDrop Store #101", rating: 4.8, status: "Active" });
  const [products, setProducts] = useState([
    { id: 1, name: "Fresh Milk", price: 100, stock: 25 },
    { id: 2, name: "Organic Bread", price: 65, stock: 12 }
  ]);
  const [orders] = useState([{ id: "ORD-99", item: "Fresh Milk", status: "Prepared" }]);

  const handleDelete = (id) => setProducts(products.filter(p => p.id !== id));

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Shop Header - Glassmorphism Style */}
      <div className="bg-white/30 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-sm mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{shopInfo.name}</h1>
        <p className="text-gray-600">Status: <span className="text-green-600 font-semibold">{shopInfo.status}</span> | Rating: ⭐ {shopInfo.rating}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Management Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventory Management</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              + Add New Product
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Price (NPR)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">{product.price}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4 text-center space-x-2">
                      <button className="text-blue-500 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Dispatch Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-orange-600">Pending Dispatch</h2>
          {orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500">
              <p className="font-bold text-gray-800">{order.id}</p>
              <p className="text-sm text-gray-600">Item: {order.item}</p>
              <p className="text-xs text-blue-500 mb-4 italic">Status: {order.status}</p>
              <button className="w-full bg-black text-white py-2 rounded-md hover:opacity-90 transition">
                Assign to Delivery Boy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorHome;