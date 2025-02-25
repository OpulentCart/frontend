import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/login';
import HomePage from '../pages/home';
import SignupPage from '../pages/signUp';
import ForgotPasswordPage from '../pages/forgot';
import VendorForm from '../pages/vendorForm';
import ContactUs from '../pages/contact';
import CreateProductForm from '../pages/productForm';
import AdminDashboard from '../pages/adminDashboard';
import ProductApproval from '../pages/productApproval';
import StoreApproval from '../pages/storeApproval';
import AdminLayout from '../layouts/AdminLayout';
import AdminUsers from '../pages/AdminUsers';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={< SignupPage/>} />
      <Route path="/forgot" element={< ForgotPasswordPage/>} />
      {/* <Route path="/vendor-dashboard" element={<VendorDashboard />} /> */}
      <Route path="/store-form" element={< VendorForm/>} />
      <Route path="/product-form" element={< CreateProductForm/>} />
      <Route path="/contact" element={< ContactUs/>} />
      <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="stores" element={<StoreApproval />} />
          <Route path="products" element={<ProductApproval />} />
          <Route path="users" element={<AdminUsers />} />
      </Route> 

    </Routes>
  );
}

export default AppRoutes;
