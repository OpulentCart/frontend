import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/slices/authSlice"; // Import Redux action
import { message } from "antd";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Store tokens & role in Redux
        dispatch(login({ access: data.access, refresh: data.refresh, role: data.role }));
        localStorage.setItem("token", data.access);
  
        message.success("Login successful! Fetching cart...");
  
        // Step 2: Fetch Cart Data
        const cartResponse = await fetch("http://localhost:5007/carts", {
          method: "GET",
          headers: { Authorization: `Bearer ${data.access}` }, // Attach token in headers
        });
  
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          console.log("Cart Data:", cartData);
  
          // Optionally store cart data in Redux (create a cart slice)
          // dispatch(setCart(cartData));
        } else {
          console.warn("No cart found for this user.");
        }
  
        setTimeout(() => navigate("/"), 1000);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Login failed. Please try again.");
      }
    } catch (error) {
      message.error("Something went wrong. Please try again.");
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Or{" "}
          <a href="/signup" className="font-medium text-yellow-500 hover:text-yellow-400 transition">
            create an account
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="/forgot" className="font-medium text-yellow-500 hover:text-yellow-400 transition">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Social Media Login */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <a
              href="#"
              className="w-full flex items-center justify-center px-8 py-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
            >
              <img className="h-5 w-5" src="https://www.svgrepo.com/show/512120/facebook-176.svg" alt="Facebook" />
            </a>
            <a
              href="#"
              className="w-full flex items-center justify-center px-8 py-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
            >
              <img className="h-5 w-5" src="https://www.svgrepo.com/show/513008/twitter-154.svg" alt="Twitter" />
            </a>
            <a
              href="#"
              className="w-full flex items-center justify-center px-8 py-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
            >
              <img className="h-6 w-6" src="https://www.svgrepo.com/show/506498/google.svg" alt="Google" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
