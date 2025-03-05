import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const VendorDashboard = () => {
  const authToken = useSelector((state) => state.auth.access_token);

  const [salesData, setSalesData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5002/vendors/sales/dashboard/", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const salesOverview = res.data.vendorSalesOverview[0]; // Assuming there's only one vendor in the response
        const monthlyProfit = res.data.monthlyProfit;

        // Prepare Sales Data (replace $ with ₹)
        setSalesData({
          labels: [salesOverview.store_name],
          datasets: [
            {
              label: "Total Sales (in ₹)", // Changed label
              data: [salesOverview.total_sales],
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        // Prepare Profit Data (Line Chart, replace $ with ₹)
        setProfitData({
          labels: monthlyProfit.map(item => item.month.trim()),
          datasets: [
            {
              label: "Profit (in ₹)", // Changed label
              data: monthlyProfit.map(item => item.profit),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
              fill: false,
            },
          ],
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false); // Stop loading after the data is fetched
      }
    };

    fetchData();
  }, [authToken]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Vendor Sales Dashboard</h1>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Overview (Bar Chart) */}
        <div className="bg-white p-4 shadow-lg rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Sales Overview</h2>
          <Bar data={salesData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>

        {/* Profit Trend (Line Chart) */}
        <div className="bg-white p-4 shadow-lg rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Profit Trend</h2>
          <Line data={profitData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
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
