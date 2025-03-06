import React, { useState, useEffect } from "react";
import { Bar, Line, Doughnut, Radar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, RadialLinearScale } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale // Required for Radar chart
);

const VendorDashboard = () => {
  const authToken = useSelector((state) => state.auth.access_token);

  const [salesData, setSalesData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [quantityData, setQuantityData] = useState(null);
  const [topCustomersData, setTopCustomersData] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://13.60.181.56:5002/vendors/sales/dashboard/", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const salesOverview = res.data.vendorSalesOverview[0]; // Assuming there's only one vendor in the response
        const monthlyProfit = res.data.monthlyProfit;
        const quantityByCategory = res.data.quantityByCategory;
        const topCustomers = res.data.topCustomers;

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

        // Prepare Quantity Data (Radar Chart)
        setQuantityData({
          labels: quantityByCategory.map(item => item.name),
          datasets: [
            {
              label: "Quantity by Category",
              data: quantityByCategory.map(item => item.total_quantity),
              backgroundColor: "rgba(255, 159, 64, 0.6)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
              fill: true,
            },
          ],
        });

        // Prepare Top Customers Data (Doughnut Chart)
        setTopCustomersData({
          labels: topCustomers.map(item => item.name),
          datasets: [
            {
              label: "Top Customers",
              data: topCustomers.map(item => item.sum_of_amount),
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
              ],
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
    <div className="p-6 bg-gray-100 min-h-screen mt-15 mb-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Vendor Sales Dashboard</h1>
      <p className="text-center text-lg mb-6 text-gray-700">This is your sales overview page showing key insights such as total sales, profits, top customers, and more.</p>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Sales Overview (Bar Chart) */}
        <div className="bg-white p-4 shadow-lg rounded-xl w-full h-72 flex items-center justify-center">
          <h2 className="text-xl font-semibold mb-2">Sales Overview</h2>
          <Bar data={salesData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>

        {/* Profit Trend (Line Chart) */}
        <div className="bg-white p-4 shadow-lg rounded-xl w-full h-72 flex items-center justify-center">
          <h2 className="text-xl font-semibold mb-2">Profit Trend</h2>
          <Line data={profitData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>
      </div>

      {/* Quantity by Category (Radar Chart) and Top Customers (Doughnut Chart) on the same row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
        {/* Quantity by Category (Radar Chart) */}
        <div className="bg-white p-4 shadow-lg rounded-xl w-full h-72 flex items-center justify-center">
          <h2 className="text-xl font-semibold mb-2">Quantity by Category</h2>
          <Radar data={quantityData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>

        {/* Top Customers (Doughnut Chart) */}
        <div className="bg-white p-4 shadow-lg rounded-xl w-full h-72 flex items-center justify-center">
          <h2 className="text-xl font-semibold mb-2">Top Customers</h2>
          <Doughnut data={topCustomersData} options={{ responsive: true, plugins: { tooltip: { enabled: true } } }} />
        </div>
      </div>

      {/* Date Filter (Placeholder) */}
      {/* <div className="mt-6 text-center">
        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600">
          Filter by Date
        </button>
      </div> */}
    </div>
  );
};

export default VendorDashboard;
