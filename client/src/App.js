// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <NavigationBar />
      <Routes>
        <Route path="/" element={<UserTable />} />
        <Route path="/user/:indId" element={<UserDetails />} />
        <Route path="/user/:indId/usage" element={<UserUsage />} />
        <Route path="/coupon-validity" element={<CouponValidityManager />} />
        <Route path="/usages" element={<UsagePage />} />
      </Routes>
    </Router>
  );
}

export default App;
