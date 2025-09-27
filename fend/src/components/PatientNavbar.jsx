import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell"; // ✅ new bell
import logo from "../pages/logo.png"; // ✅ import your logo

function PatientNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    api
      .get("/api/user")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/app");
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-3 d-none d-lg-block">
        <Link className="navbar-brand d-flex align-items-center" to="/patient">
          {/* ✅ logo + text */}
          <img
            src={logo}
            alt="Kreative Dental Clinic"
            style={{ height: "32px", width: "32px", objectFit: "contain", marginRight: "8px" }}
          />
          <span>Kreative Dental & Orthodontics</span>
        </Link>

        <div className="navbar-nav ms-auto align-items-center">
          <Link to="/patient" className="nav-link">
            <i className="bi bi-house me-1"></i>
            <span>Home</span>
          </Link>
          <Link to="/patient/appointment" className="nav-link">
            <i className="bi bi-calendar-plus me-1"></i>
            <span>Book</span>
          </Link>
          <Link to="/patient/appointments" className="nav-link">
            <i className="bi bi-calendar3 me-1"></i>
            <span>Appointments</span>
          </Link>
          <Link to="/patient/profile" className="nav-link">
            <i className="bi bi-person me-1"></i>
            <span>Profile</span>
          </Link>
          {user && <NotificationBell />}
          {user && (
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm ms-2"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="navbar navbar-light bg-white shadow-sm px-2 px-sm-3 d-lg-none">
        <div className="d-flex align-items-center w-100">
          <Link className="navbar-brand d-flex align-items-center flex-shrink-0" to="/patient">
            <img
              src={logo}
              alt="Kreative Dental Clinic"
              style={{ height: "28px", width: "28px", objectFit: "contain", marginRight: "6px" }}
            />
            <span className="fs-6">Kreative Dental</span>
          </Link>
          
          {/* Horizontal Mobile Navigation */}
          <div className="mobile-nav-horizontal">
            <Link to="/patient" className="mobile-nav-item" title="Home">
              <i className="bi bi-house"></i>
            </Link>
            <Link to="/patient/appointment" className="mobile-nav-item" title="Book Appointment">
              <i className="bi bi-calendar-plus"></i>
            </Link>
            <Link to="/patient/appointments" className="mobile-nav-item" title="My Appointments">
              <i className="bi bi-calendar3"></i>
            </Link>
            <Link to="/patient/profile" className="mobile-nav-item" title="My Profile">
              <i className="bi bi-person"></i>
            </Link>
            {user && <NotificationBell />}
            {user && (
              <button
                onClick={handleLogout}
                className="mobile-nav-item btn btn-outline-danger btn-sm"
                title="Logout"
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default PatientNavbar;
