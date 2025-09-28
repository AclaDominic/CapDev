import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="card-title mb-0">
                <i className="bi bi-house-door me-2"></i>
                Welcome, Admin!
              </h2>
            </div>
            <div className="card-body">
              <p className="lead mb-4">
                This is your admin dashboard. From here, you can manage the dental clinic system such as device approvals, dentist schedules, users, and reports.
              </p>
              
              <div className="row g-3 g-md-4">
                <div className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-2 p-md-3">
                      <i className="bi bi-people-fill text-primary fs-2 fs-md-1 mb-2 mb-md-3"></i>
                      <h6 className="card-title small">Device Management</h6>
                      <p className="card-text text-muted small d-none d-md-block">Manage device approvals</p>
                      <a href="/admin/device-approvals" className="btn btn-outline-primary btn-sm">Devices</a>
                    </div>
                  </div>
                </div>
                
                <div className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-2 p-md-3">
                      <i className="bi bi-calendar-check text-success fs-2 fs-md-1 mb-2 mb-md-3"></i>
                      <h6 className="card-title small">Appointments</h6>
                      <p className="card-text text-muted small d-none d-md-block">Schedule management</p>
                      <a href="/admin/appointments" className="btn btn-outline-success btn-sm">Schedule</a>
                    </div>
                  </div>
                </div>
                
                <div className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-2 p-md-3">
                      <i className="bi bi-graph-up text-info fs-2 fs-md-1 mb-2 mb-md-3"></i>
                      <h6 className="card-title small">Analytics</h6>
                      <p className="card-text text-muted small d-none d-md-block">Performance metrics</p>
                      <a href="/admin/analytics" className="btn btn-outline-info btn-sm">Analytics</a>
                    </div>
                  </div>
                </div>
                
                <div className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-2 p-md-3">
                      <i className="bi bi-gear text-warning fs-2 fs-md-1 mb-2 mb-md-3"></i>
                      <h6 className="card-title small">Settings</h6>
                      <p className="card-text text-muted small d-none d-md-block">System settings</p>
                      <a href="/admin/services" className="btn btn-outline-warning btn-sm">Settings</a>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-2 p-md-3">
                      <i className="bi bi-box text-secondary fs-2 fs-md-1 mb-2 mb-md-3"></i>
                      <h6 className="card-title small">Inventory</h6>
                      <p className="card-text text-muted small d-none d-md-block">Stock management</p>
                      <a href="/admin/inventory" className="btn btn-outline-secondary btn-sm">Inventory</a>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-2 p-md-3">
                      <i className="bi bi-file-earmark-text text-dark fs-2 fs-md-1 mb-2 mb-md-3"></i>
                      <h6 className="card-title small">Reports</h6>
                      <p className="card-text text-muted small d-none d-md-block">Monthly reports</p>
                      <a href="/admin/monthly-report" className="btn btn-outline-dark btn-sm">Reports</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
