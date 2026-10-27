import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { SkipLink } from '../common/SkipLink';

export const RootLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SkipLink />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
