import { Link } from "react-router-dom";

const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">Access Denied 🚫</h1>
      <p className="text-lg text-gray-700 mt-2">
        You don’t have permission to view this page.
      </p>
      <Link to="/" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">
        Go to Home
      </Link>
    </div>
  );
};

export default AccessDenied;
