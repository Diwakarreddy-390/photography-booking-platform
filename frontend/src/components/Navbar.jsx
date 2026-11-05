
import { Camera, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );

  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    setIsLoggedIn(false);
    closeMenu();
    navigate("/");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="logo" onClick={closeMenu}>
        <Camera size={25} />
        <span>
          PRL <strong>SHOOTS</strong>
        </span>
      </Link>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>

        <Link to="/" onClick={closeMenu}>Home</Link>

        <Link to="/about" onClick={closeMenu}>About</Link>

        <Link to="/packages" onClick={closeMenu}>Packages</Link>

        {isLoggedIn && (
          <Link to="/my-bookings" onClick={closeMenu}>
            My Bookings
          </Link>
        )}

        <Link to="/contact" onClick={closeMenu}>Contact</Link>

        {isLoggedIn ? (
          <button onClick={handleLogout} className="nav-logout">
            Logout
          </button>
        ) : (
          <Link to="/login" onClick={closeMenu}>
            Login
          </Link>
        )}

        <Link to="/booking" onClick={closeMenu}>Book Now</Link>

      </div>

      <Link
        to="/packages#custom-booking"
        className="nav-book"
        onClick={closeMenu}
      >
        Book Now
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

    </nav>
  );
}

export default Navbar;
