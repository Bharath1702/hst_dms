// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import UserTable from './UserTable';
import UserDetails from './UserDetails';
import UserUsage from './UserUsage';
import CouponValidityManager from './CouponValidityManager';
import UsagePage from './UsagePage';
import NavigationBar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  // Define routes where the NavigationBar should be hidden
  const hideNavRoutes = ['/user/:indId'];

  // Function to check if current route matches any hideNavRoutes
  const shouldHideNav = hideNavRoutes.some((route) => {
    const regex = new RegExp(`^${route.replace(':indId', '[^/]+')}$`);
    return regex.test(location.pathname);
  });

  return (
    <>
      {!shouldHideNav && <NavigationBar />}
      <Routes>
        <Route path="/" element={<UserTable />} />
        <Route path="/user/:indId" element={<UserDetails />} />
        <Route path="/user/:indId/usage" element={<UserUsage />} />
        <Route path="/coupon-validity" element={<CouponValidityManager />} />
        <Route path="/usages" element={<UsagePage />} />
      </Routes>
    </>
  );
}

export default App;
