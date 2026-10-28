import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/policies/PrivacyPolicyPage';
import { TermsPage } from './pages/policies/TermsPage';
import { RefundPolicyPage } from './pages/policies/RefundPolicyPage';
import { DeliveryPolicyPage } from './pages/policies/DeliveryPolicyPage';
import { LicensePolicyPage } from './pages/policies/LicensePolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ScrollToTop } from './components/common/ScrollToTop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AccountPage } from './pages/AccountPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminAuthGuard } from './components/admin/AdminAuthGuard';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminStoragePage } from './pages/admin/AdminStoragePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="library" element={<AccountPage defaultTab="library" />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="policies/privacy" element={<PrivacyPolicyPage />} />
            <Route path="policies/terms" element={<TermsPage />} />
            <Route path="policies/refunds" element={<RefundPolicyPage />} />
            <Route path="policies/delivery" element={<DeliveryPolicyPage />} />
            <Route path="policies/license" element={<LicensePolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login Gatekeeper */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Console Routes */}
          <Route
            path="/admin"
            element={
              <AdminAuthGuard>
                <AdminLayout />
              </AdminAuthGuard>
            }
          >
            <Route index element={<AdminStoragePage />} />
            <Route path="storage" element={<AdminStoragePage />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
