import React from "react";

const orders = [
  { id: "ORD001", customer: "John Doe", total: "$120.50", status: "Shipped", date: "2025-03-04" },
  { id: "ORD002", customer: "Jane Smith", total: "$85.00", status: "Pending", date: "2025-03-03" },
  { id: "ORD003", customer: "Michael Brown", total: "$200.75", status: "Delivered", date: "2025-03-02" },
  { id: "ORD004", customer: "Emily Davis", total: "$45.99", status: "Canceled", date: "2025-03-01" }
];

const OrderPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 mt-15">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-lg">
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-all duration-200`}>
                  <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>
                  <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full shadow-sm ${
                      order.status === "Shipped" ? "bg-blue-200 text-blue-800" :
                      order.status === "Pending" ? "bg-yellow-200 text-yellow-800" :
                      order.status === "Delivered" ? "bg-green-200 text-green-800" :
                      "bg-red-200 text-red-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
