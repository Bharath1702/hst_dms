// frontend/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import UserTable from './UserTable';
import UserDetails from './UserDetails';
import UserUsage from './UserUsage';
import CouponValidityManager from './CouponValidityManager';
import UsagePage from './UsagePage';
import NavigationBar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

// The 4-digit password to access protected routes
const ACCESS_PASSWORD = "170204"; // Change this to the desired password

// Protected Route Component with Password Check
const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      setIsAuthorized(true);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword(''); // Clear the input
    }
  };

  if (isAuthorized) {
    return children;
  }

  return (
    <div className="password-protected" style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Enter Password to Access</h3>
      <form onSubmit={handlePasswordSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="4-digit password"
          maxLength={6}
          style={{ padding: '10px', fontSize: '16px', width: '100px', textAlign: 'center' }}
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '10px 15px' }}>Submit</button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

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

  // Check if current route matches any hideNavRoutes
  const shouldHideNav = hideNavRoutes.some((route) => {
    const regex = new RegExp(`^${route.replace(':indId', '[^/]+')}$`);
    return regex.test(location.pathname);
  });

  return (
    <>
      {!shouldHideNav && <NavigationBar />}
      <Routes>
        {/* <Route path="/usertable" element={<ProtectedRoute><UserTable /></ProtectedRoute>} /> */}
        <Route path="/user/:indId" element={<UserDetails />} />
        {/* <Route
          path="/user/:indId/usage"
          element={
            <ProtectedRoute>
              <UserUsage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/coupon-validity"
          element={
            <ProtectedRoute>
              <CouponValidityManager />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/usages"
          element={
            <ProtectedRoute>
              <UsagePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
