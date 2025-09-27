import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import HmoCard from "../../components/HmoCard"; // ⬅️ add this import (adjust path if needed)

const PatientProfile = () => {
  const [user, setUser] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/user");
      setUser(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch user info", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleResetRequest = async () => {
    try {
      await api.post("/logout");
      localStorage.removeItem("token");
    } catch (err) {
      console.warn("Logout failed, proceeding anyway.");
    }

    navigate("/forgot-password", {
      state: { email: user.email, fromProfile: true },
    });
  };

  const handleLinkSelf = async () => {
    setLoading(true);
    setErrors({});
    try {
      await api.post("/api/patients/link-self", {
        contact_number: contactNumber,
      });

      setMessage("✅ Profile linked successfully.");
      await fetchUser(); // 🔁 re-fetch updated user data here
      setShowContactForm(false);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage("❌ Failed to link profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading your profile...</p>;

  const isLinked = !!user.patient && user.patient.is_linked;
  const role = user.role; // 'admin' | 'staff' | 'patient'
  const patientId = user.patient?.id; // will exist after linking

  return (
    <div className="w-100">
      <div className="card border-0 shadow-lg w-100 patient-page-card">
            <div className="card-header bg-gradient bg-primary text-white text-center py-4">
              <h2 className="h3 mb-2">
                <i className="bi bi-person-circle me-2"></i>
                My Account
              </h2>
              <p className="mb-0 opacity-75">Manage your personal information and preferences</p>
            </div>
            <div className="card-body p-5">

              {/* Personal Information Section */}
              <div className="mb-5">
                <h4 className="h5 mb-3">
                  <i className="bi bi-person me-2 text-primary"></i>
                  Personal Information
                </h4>
                <div className="card border-0 bg-light shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-fill me-3 text-primary fs-5"></i>
                          <div>
                            <small className="text-muted d-block">Full Name</small>
                            <span className="fw-semibold">{user.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-envelope-fill me-3 text-primary fs-5"></i>
                          <div>
                            <small className="text-muted d-block">Email Address</small>
                            <span className="fw-semibold">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Reset Section */}
              <div className="mb-5">
                <h4 className="h5 mb-3">
                  <i className="bi bi-shield-lock me-2 text-primary"></i>
                  Account Security
                </h4>
                <div className="card border-0 bg-light shadow-sm">
                  <div className="card-body p-4">
                    <p className="text-muted mb-3">
                      Need to change your password? We'll send a secure reset link to your email address.
                    </p>
                    <button
                      className="btn btn-outline-primary btn-lg"
                      onClick={handleResetRequest}
                    >
                      <i className="bi bi-envelope me-2"></i>
                      Send Password Reset Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Patient Profile Linking Section */}
              {!isLinked && (
                <div className="mb-5">
                  <h4 className="h5 mb-3">
                    <i className="bi bi-person-plus me-2 text-primary"></i>
                    Link Patient Profile
                  </h4>
                  <div className="card border-warning shadow-sm">
                    <div className="card-header bg-warning-subtle border-warning">
                      <h5 className="h6 mb-1">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Profile Not Linked
                      </h5>
                      <p className="mb-0 text-muted">You're not yet linked to a patient profile.</p>
                    </div>
                    <div className="card-body">
                      <p className="mb-3">Have you visited the clinic before?</p>

                      <div className="mb-4">
                        <div className="alert alert-info border-0 shadow-sm mb-3">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>Yes</strong> – Please visit the clinic for assistance with linking your profile
                        </div>
                        <button
                          className="btn btn-outline-primary btn-lg w-100"
                          onClick={() => {
                            if (user?.contact_number) setContactNumber(user.contact_number);
                            setShowContactForm(true);
                          }}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          No – I haven't visited before
                        </button>
                      </div>

                      {showContactForm && (
                        <div className="border-top pt-4">
                          <h6 className="mb-3">
                            <i className="bi bi-telephone me-2"></i>
                            Provide Your Contact Information
                          </h6>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Contact Number</label>
                            <input
                              className="form-control form-control-lg border-2"
                              placeholder="e.g. 09123456789"
                              value={contactNumber}
                              onChange={(e) => setContactNumber(e.target.value)}
                              style={{ fontSize: '1.1rem' }}
                            />
                            {errors.contact_number && (
                              <div className="text-danger mt-2">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                {errors.contact_number[0]}
                              </div>
                            )}
                          </div>
                          <button
                            className="btn btn-success btn-lg w-100"
                            onClick={handleLinkSelf}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Linking Profile...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-link me-2"></i>
                                Link My Profile
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {message && (
                        <div className={`alert mt-4 border-0 shadow-sm ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
                          <i className={`bi ${message.includes('✅') ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                          {message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================= HMO SECTION ========================= */}
              {isLinked && patientId && (
                <div className="mb-4">
                  <h4 className="h5 mb-3">
                    <i className="bi bi-hospital me-2 text-primary"></i>
                    Health Maintenance Organization (HMO)
                  </h4>
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                      {/* HmoCard uses Tailwind classes internally; it can live inside Bootstrap containers just fine. */}
                      <HmoCard
                        patientId={patientId}
                        currentUserRole={role}                 // 'patient' here
                        currentUserPatientId={patientId}       // so it knows this user is managing self
                        compact={false}
                        onChange={(items) => {
                          // optional: toast or side-effects after CRUD
                          // console.log("HMO updated:", items);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* =============================================================== */}
            </div>
          </div>
    </div>
  );
};

export default PatientProfile;
