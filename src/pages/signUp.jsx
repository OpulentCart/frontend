
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import showToast from "../components/showToast";

function SignupPage() {
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Timer state
  const [otpTimer, setOtpTimer] = useState(0);

  // Start countdown when OTP is sent
  useEffect(() => {
    if (otpSent && otpTimer > 0) {
      const timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, otpTimer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Generate OTP
  const handleGenerateOtp = async () => {
    if (!email || !isValidEmail(email)) {
      showToast({ label: "Please enter a valid EMAIL", type: "warning" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);

        setOtpTimer(30); // Start 30-second timer
        alert(data.message || `OTP Sent to ${email}`);

        showToast({ label: "OTP is sent", type: "success" });

      } else {
        showToast({ label: "Failed to send OTP", type: "error" });
      }
    } catch (error) {
      showToast({ label: "Error in sending OTP", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("").trim();
    
    if (otpCode.length !== 6 || isNaN(otpCode)) {
      showToast({ label: "Please enter a valid 6-digit OTP", type: "warning" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/auth/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpVerified(true);
        showToast({ label: "OTP verified. Please login.", type: "success" });
        navigate("/login");
      } else {
        showToast({ label: "Invalid OTP. Please try again.", type: "warning" });
      }
    } catch (error) {
      showToast({ label: "Something went wrong!!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Register User
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      showToast({ label: "Please verify your OTP first", type: "warning" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://dummyapi.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast({ label: "User registered successfully!!!", type: "success" });
      } else {
        showToast({ label: "Failed to register", type: "error" });
      }
    } catch (error) {
      showToast({ label: "Registration failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Or{" "}
          <a href="/login" className="font-medium text-yellow-500 hover:text-yellow-400 transition">
            Login to your account
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Select Role</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            {/* OTP Section */}

          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Enter OTP</label>
              <div className="flex justify-between gap-2 mt-1">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    value={digit}
                    maxLength="1"
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center border border-gray-600 rounded-md bg-gray-700 text-white text-xl font-bold"
                  />
                ))}
              </div>

              {/* Timer Display */}
              {otpSent && otpTimer > 0 && (
                <p className="text-sm text-yellow-400 mt-2 text-center">
                  Resend OTP in {otpTimer} seconds
                </p>
              )}

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full mt-4 py-2 px-4 bg-green-500 text-black font-medium rounded-md hover:bg-green-600"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}


            {!otpSent && (
              <button
                type="button"
                onClick={handleGenerateOtp}
                className="w-full py-2 px-4 bg-yellow-500 text-black font-medium rounded-md hover:bg-yellow-600"
              >
                {loading ? "Sending..." : "Generate OTP"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
