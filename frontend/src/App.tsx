import React from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import BusinessLogin from "./pages/BusinessLogin";
import BusinessDashboard from "./pages/BusinessDashboard";

// Minimal path-based routing (no router library yet).
// The app is served under PUBLIC_URL (/menumap), so strip that prefix first.
function currentPath(): string {
  const base = process.env.PUBLIC_URL || "";
  let path = window.location.pathname;
  if (base && path.startsWith(base)) path = path.slice(base.length);
  return path.replace(/\/+$/, "") || "/";
}

function App() {
  switch (currentPath()) {
    case "/login":
      return <Login />;
    case "/signup":
      return <Signup />;
    case "/account":
      return <Account />;
    case "/business/login":
      return <BusinessLogin />;
    case "/business/dashboard":
      return <BusinessDashboard />;
    default:
      return <Home />;
  }
}

export default App;
