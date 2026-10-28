import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminStorageService } from '../../services/admin/adminStorage.service';
import { AdminLoginPage } from '../../pages/admin/AdminLoginPage';

interface AdminAuthGuardProps {
  children?: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return AdminStorageService.isAuthenticated();
  });

  useEffect(() => {
    setIsAuthenticated(AdminStorageService.isAuthenticated());
  }, []);

  if (!isAuthenticated) {
    return <AdminLoginPage onSuccess={() => setIsAuthenticated(true)} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
