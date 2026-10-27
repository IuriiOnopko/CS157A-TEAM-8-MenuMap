import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import NotFoundPage from "./pages/NotFoundPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import TableOrderPage from "./pages/TableOrderPage";
import { SessionProvider } from "./session/SessionContext";

// Paths are relative to /menumap (PUBLIC_URL). On Tomcat, SpaFallbackFilter serves
// index.html for these paths so they also work when opened directly or refreshed.
function App() {
  return (
    <SessionProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Home />} />
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
