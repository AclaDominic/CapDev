import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AdminGoalsPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [periodType, setPeriodType] = useState("month");
  const [periodEnd, setPeriodEnd] = useState("");
  const [metric, setMetric] = useState("total_visits");
  const [target, setTarget] = useState(100);
  const [serviceId, setServiceId] = useState("");
  const [packagePromoId, setPackagePromoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [goals, setGoals] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);

  // Load services and packages
  useEffect(() => {
    const loadData = async () => {
      try {
        const servicesRes = await api.get("/api/services");
        
        setServices(servicesRes.data || []);
        
        // Filter services that have bundle items (packages/promos)
        // Since packages and promos are both marked as special services
        const packageServices = servicesRes.data?.filter(service => 
          service.is_special || (service.bundleItems && service.bundleItems.length > 0)
        ) || [];
        setPackages(packageServices);
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    };
    loadData();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/goals", { params: { period } });
      setGoals(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const createGoal = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      const payload = {
        period_type: periodType,
        period_start: periodType === "month" ? `${period}-01` : period,
        metric,
        target_value: Number(target) || 0,
      };

      if (periodType === "promo" && periodEnd) {
        payload.period_end = periodEnd;
      }

      if (metric === "service_availment" && serviceId) {
        payload.service_id = Number(serviceId);
      }

      if (metric === "package_promo_availment" && packagePromoId) {
        payload.package_promo_id = Number(packagePromoId);
      }

      await api.post("/api/goals", payload);
      await load();
      
      // Reset form
      setMetric("total_visits");
      setServiceId("");
      setPackagePromoId("");
      setPeriodEnd("");
      setTarget(100);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to create goal.");
    } finally {
      setLoading(false);
    }
  };

  const derivedStatus = (g) => {
    const actual = Number(g.latest_actual || 0);
    const targetVal = Number(g.target_value || 1);
    const now = new Date();
    const start = new Date(g.period_start);
    
    // Handle different period types
    let end;
    if (g.period_type === "month") {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else {
      end = new Date(g.period_end || g.period_start);
    }
    
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const daysPassed = Math.min(totalDays, now < start ? 1 : now > end ? totalDays : Math.ceil((now - start) / (1000 * 60 * 60 * 24)) + 1);
    const expected = Math.round((targetVal * daysPassed) / totalDays);

    if (g.status === "missed") return { label: "Missed", color: "danger" };
    if (g.status === "done") return { label: "Completed", color: "success" };

    if (actual >= expected) return { label: "On track", color: "success" };
    if (actual >= expected * 0.8) return { label: "At risk", color: "warning" };
    return { label: "Behind", color: "danger" };
  };

  const progressPct = (g) => {
    const actual = Number(g.latest_actual || 0);
    const target = Number(g.target_value || 1);
    return Math.min(100, Math.round((actual / target) * 100));
  };

  const getMetricDisplayName = (metric) => {
    switch (metric) {
      case "total_visits": return "Total Visits";
      case "service_availment": return "Service Availment";
      case "package_promo_availment": return "Package/Promo Availment";
      default: return metric;
    }
  };

  const getGoalDescription = (goal) => {
    switch (goal.metric) {
      case "service_availment":
        const service = services.find(s => s.id === goal.service_id);
        return service ? `${service.name}` : "Unknown Service";
      case "package_promo_availment":
        const package_ = packages.find(p => p.id === goal.package_id);
        return package_ ? `${package_.name}` : "Unknown Package/Promo";
      default:
        return "";
    }
  };

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">🎯 Performance Goals</h3>
        <div style={{ width: 180 }}>
          <input
            type="month"
            className="form-control"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      <div className="card mb-3">
        <div className="card-header">Create Goal</div>
        <div className="card-body">
          <form className="row g-3" onSubmit={createGoal}>
            <div className="col-12 col-md-6">
              <label className="form-label">Period Type</label>
              <select 
                className="form-select" 
                value={periodType} 
                onChange={(e) => setPeriodType(e.target.value)}
              >
                <option value="month">Monthly</option>
                <option value="promo">Promo Period</option>
              </select>
            </div>
            
            <div className="col-12 col-md-6">
              <label className="form-label">Metric</label>
              <select 
                className="form-select" 
                value={metric} 
                onChange={(e) => setMetric(e.target.value)}
              >
                <option value="total_visits">Total Visits</option>
                <option value="service_availment">Service Availment</option>
                <option value="package_promo_availment">Package/Promo Availment</option>
              </select>
            </div>

            {periodType === "month" && (
              <div className="col-12 col-md-6">
                <label className="form-label">Period</label>
                <input 
                  type="month" 
                  className="form-control" 
                  value={period} 
                  onChange={(e) => setPeriod(e.target.value)} 
                />
              </div>
            )}

            {periodType === "promo" && (
              <>
                <div className="col-12 col-md-6">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value)} 
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={periodEnd} 
                    onChange={(e) => setPeriodEnd(e.target.value)} 
                    required
                  />
                </div>
              </>
            )}

            {metric === "service_availment" && (
              <div className="col-12 col-md-6">
                <label className="form-label">Service</label>
                <select 
                  className="form-select" 
                  value={serviceId} 
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  <option value="">Select a service...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {metric === "package_promo_availment" && (
              <div className="col-12 col-md-6">
                <label className="form-label">Package/Promo</label>
                <select 
                  className="form-select" 
                  value={packagePromoId} 
                  onChange={(e) => setPackagePromoId(e.target.value)}
                  required
                >
                  <option value="">Select a package/promo...</option>
                  {packages.map(package_ => (
                    <option key={package_.id} value={package_.id}>
                      {package_.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-12 col-md-6">
              <label className="form-label">Target Value</label>
              <input 
                type="number" 
                min="1" 
                className="form-control" 
                value={target} 
                onChange={(e) => setTarget(e.target.value)} 
                required
              />
            </div>

            <div className="col-12">
              <button className="btn btn-primary" disabled={loading}>
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Goals for {period}</div>
        <div className="card-body">
          {loading ? (
            <div>Loading…</div>
          ) : goals.length === 0 ? (
            <div className="text-muted">No goals found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Description</th>
                    <th>Period</th>
                    <th>Target</th>
                    <th>Actual</th>
                    <th>Status</th>
                    <th style={{ width: 220 }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((g) => (
                    <tr key={g.id}>
                      <td>{getMetricDisplayName(g.metric)}</td>
                      <td>{getGoalDescription(g)}</td>
                      <td>
                        {g.period_type === "month" 
                          ? new Date(g.period_start).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                          : `${new Date(g.period_start).toLocaleDateString()} - ${new Date(g.period_end).toLocaleDateString()}`
                        }
                      </td>
                      <td>{g.target_value}</td>
                      <td>{g.latest_actual || 0}</td>
                      <td>
                        {(() => {
                          const s = derivedStatus(g);
                          return <span className={`badge bg-${s.color}`}>{s.label}</span>;
                        })()}
                      </td>
                      <td>
                        <div className="progress" style={{ height: 16 }}>
                          <div
                            className={`progress-bar ${progressPct(g) >= 100 ? 'bg-success' : progressPct(g) >= 70 ? 'bg-info' : 'bg-warning'}`}
                            role="progressbar"
                            style={{ width: `${progressPct(g)}%` }}
                            aria-valuenow={progressPct(g)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {progressPct(g)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}