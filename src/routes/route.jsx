import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/login';
import HomePage from '../pages/home';
import SignupPage from '../pages/signUp';
import ForgotPasswordPage from '../pages/forgot';
import VendorForm from '../pages/vendorForm';
import ContactUs from '../pages/contact';
import CreateProductForm from '../pages/productForm';
import AdminDashboard from '../pages/admin/adminDashboard';
import ProductApproval from '../pages/admin/productApproval';
import StoreApproval from '../pages/admin/storeApproval';
import AdminLayout from '../layouts/AdminLayout';
import Shop from '../pages/shop';
import AdminUsers from '../pages/admin/AdminUsers';
import Profile from '../pages/user-profile/profile';
import ProductDetails from '../pages/productDetails';


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
      <Route path="/shop" element={< Shop/>} />
      <Route path="/profile" element={< Profile/>} />
      <Route path="/product/:id" element={<ProductDetails />} />
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
