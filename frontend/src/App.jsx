
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Portfolio from "./pages/Portfolio";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Packages from "./pages/Packages";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminCustomers from "./pages/AdminCustomers";
import AdminPackages from "./pages/AdminPackages";
import AdminReels from "./pages/AdminReels";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./ProtectedRoute";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ServiceReels from "./pages/ServiceReels";

import "./App.css";

function AppContent() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/booking" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/reels" element={<AdminReels />} />
        <Route path="/reels/:category" element={<ServiceReels />} />
        {/* Other Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      {!isAdminPage && (
        <footer className="footer" id="contact">
          <h2>
            PRL <span>SHOOTS</span>
          </h2>

          <p>Capturing moments. Creating memories.</p>

          <p>© 2026 PRL SHOOTS. All rights reserved.</p>
        </footer>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
