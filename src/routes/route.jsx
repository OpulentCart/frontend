import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./privateRoute";
import RoleBasedRoute from "./roleBasedRoute";

import LoginPage from "../pages/login";
import HomePage from "../pages/home";
import SignupPage from "../pages/signUp";
import ForgotPasswordPage from "../pages/forgot";
import VendorForm from "../pages/vendorForm";
import ContactUs from "../pages/contact";
import CreateProductForm from "../pages/productForm";
import AdminDashboard from "../pages/admin/adminDashboard";
import ProductApproval from "../pages/admin/productApproval";
import StoreApproval from "../pages/admin/storeApproval";
import AdminLayout from "../layouts/AdminLayout";
import Shop from "../pages/shop";
import AdminUsers from "../pages/admin/AdminUsers";
import Profile from "../pages/user-profile/profile";
import ProductDetails from "../pages/productDetails";
import EditProfile from "../pages/user-profile/editProfile";
import VendorDashboard from "../pages/vendor/vendorDashboard";
import VendorProducts from "../pages/vendor/vendorProducts";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />

      {/* Private Routes - Must Be Logged In */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/store-form"
        element={
          <PrivateRoute>
            <VendorForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/product-form"
        element={
          <PrivateRoute>
            <CreateProductForm />
          </PrivateRoute>
        }
      />

      {/* Admin Routes - Only Accessible by Admins */}
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </RoleBasedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="stores" element={<StoreApproval />} />
        <Route path="products" element={<ProductApproval />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Vendor Routes - Only Accessible by Vendors */}
      <Route
        path="/vendor/dashboard"
        element={
          <RoleBasedRoute allowedRoles={["vendor"]}>
            <VendorDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/vendor/products"
        element={
          <RoleBasedRoute allowedRoles={["vendor"]}>
            <VendorProducts />
          </RoleBasedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
