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
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-3">
      <Link className="navbar-brand d-flex align-items-center" to="/patient">
        {/* ✅ logo + text */}
        <img
          src={logo}
          alt="Kreative Dental Clinic"
          style={{ height: "32px", width: "32px", objectFit: "contain", marginRight: "8px" }}
        />
        <span className="d-none d-md-inline">Kreative Dental & Orthodontics</span>
        <span className="d-md-none">Kreative Dental</span>
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#patientNavbar"
        aria-controls="patientNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="patientNavbar">
        <ul className="navbar-nav ms-auto align-items-center">
          <li className="nav-item">
            <Link to="/patient" className="nav-link">
              <i className="bi bi-house me-1"></i>
              <span className="d-none d-lg-inline">Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patient/appointment" className="nav-link">
              <i className="bi bi-calendar-plus me-1"></i>
              <span className="d-none d-lg-inline">Book</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patient/appointments" className="nav-link">
              <i className="bi bi-calendar3 me-1"></i>
              <span className="d-none d-lg-inline">Appointments</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patient/profile" className="nav-link">
              <i className="bi bi-person me-1"></i>
              <span className="d-none d-lg-inline">Profile</span>
            </Link>
          </li>
          <li className="nav-item">
            {/* 🔔 Unified notifications */}
            {user && <NotificationBell />}
          </li>
          <li className="nav-item ms-2">
            {user && (
              <button
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                <span className="d-none d-lg-inline">Logout</span>
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default PatientNavbar;
