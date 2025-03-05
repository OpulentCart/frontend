import React from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const VendorDashboard = () => {
  // Dummy Data
  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales (in $)",
        data: [5000, 7000, 8000, 12000, 15000, 18000],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const profitData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Profit (in $)",
        data: [2000, 3000, 4000, 6000, 8000, 10000],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const ordersData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Orders",
        data: [150, 180, 250, 300, 350, 400],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const paymentModeData = {
    labels: ["Credit Card", "PayPal", "Cash", "UPI"],
    datasets: [
      {
        label: "Payment Modes",
        data: [45, 25, 20, 10],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Vendor Sales Dashboard</h1>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-4 shadow-lg rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Sales Overview</h2>
          <Bar data={salesData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>

        {/* Profit Chart */}
        <div className="bg-white p-4 shadow-lg rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Profit Trend</h2>
          <Line data={profitData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-4 shadow-lg rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
          <Bar data={ordersData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>

        {/* Payment Modes Chart */}
        <div className="bg-white p-4 shadow-lg rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Payment Mode Distribution</h2>
          <Doughnut data={paymentModeData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>
      </div>

      {/* Date Filter (Placeholder) */}
      <div className="mt-6 text-center">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Filter by Date
        </button>
      </div>
    </div>
  );
};

export default VendorDashboard;
