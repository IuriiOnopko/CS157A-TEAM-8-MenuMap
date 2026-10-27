import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import BusinessLogin from "./pages/BusinessLogin";
import BusinessDashboard from "./pages/BusinessDashboard";
import MapPage from "./pages/MapPage";
import NotFoundPage from "./pages/NotFoundPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import TableOrderPage from "./pages/TableOrderPage";
import { SessionProvider } from "./session/SessionContext";

// Minimal path-based routing (no router library yet).
// The app is served under PUBLIC_URL (/menumap), so strip that prefix first.
function currentPath(): string {
  const base = process.env.PUBLIC_URL || "";
  let path = window.location.pathname;
  if (base && path.startsWith(base)) path = path.slice(base.length);
  return path.replace(/\/+$/, "") || "/";
}

// Paths are relative to /menumap (PUBLIC_URL). On Tomcat, SpaFallbackFilter serves
// index.html for these paths so they also work when opened directly or refreshed.
function App() {
  return (
    <SessionProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<Account />} />
          <Route path="/business/login" element={<BusinessLogin />} />
          <Route path="/business/dashboard" element={<BusinessDashboard />} />
          <Route path="/restaurants/:restaurantId?" element={<MapPage />} />
          <Route path="/table/:token" element={<TableOrderPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId" element={<OrderStatusPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
