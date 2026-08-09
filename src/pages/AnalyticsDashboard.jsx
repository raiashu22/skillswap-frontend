import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_COLORS = {
  PENDING: "#e0a530",
  ACCEPTED: "#4a9eff",
  DECLINED: "#ff6b8b",
  COMPLETED: "#4fe0a0",
};

const CATEGORY_COLORS = ["#4a9eff", "#a06bff", "#4fe0a0", "#ff6bd8", "#6cd9ff", "#e0a530"];

const AXIS_COLOR = "#757c96";
const GRID_COLOR = "rgba(255,255,255,0.08)";
const TOOLTIP_STYLE = {
  background: "#131a2e",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  fontSize: 13,
  color: "#f2f4fb",
};

function ChartCard({ title, icon: Icon, children, isEmpty }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={16} /> {title}
      </h3>
      {isEmpty ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 13.5, textAlign: "center", padding: "30px 0" }}>
          Not enough data yet — complete a session to see this chart.
        </p>
      ) : (
        children
      )}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await api.getMyAnalytics(token);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="form-error">{error}</div>
      </div>
    );
  }

  const { statusBreakdown, categoryBreakdown, creditHistory, totals } = data;

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-eyebrow">Your stats</p>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">A look at your sessions, categories, and credit history over time.</p>
      </div>

      <div className="dash-stats" style={{ marginBottom: 28 }}>
        <div className="card dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "linear-gradient(135deg, var(--blue-300), var(--blue-600))" }}>
            <BarChart3 size={18} />
          </div>
          <div>
            <div className="dash-stat-num">{totals.totalSessions}</div>
            <div className="dash-stat-label">Total sessions</div>
          </div>
        </div>
        <div className="card dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "linear-gradient(135deg, var(--green-300), var(--green-500))" }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="dash-stat-num">{totals.completedSessions}</div>
            <div className="dash-stat-label">Completed</div>
          </div>
        </div>
        <div className="card dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "linear-gradient(135deg, var(--purple-300), var(--purple-600))" }}>
            <PieChartIcon size={18} />
          </div>
          <div>
            <div className="dash-stat-num">
              {totals.totalSessions > 0 ? Math.round((totals.completedSessions / totals.totalSessions) * 100) : 0}%
            </div>
            <div className="dash-stat-label">Completion rate</div>
          </div>
        </div>
      </div>

      <div className="profile-grid" style={{ marginBottom: 24 }}>
        <ChartCard title="Sessions by status" icon={BarChart3} isEmpty={statusBreakdown.length === 0}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="status" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={{ stroke: GRID_COLOR }} />
              <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={{ stroke: GRID_COLOR }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusBreakdown.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || "#4a9eff"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completed sessions by category" icon={PieChartIcon} isEmpty={categoryBreakdown.length === 0}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={78}
                label={({ category, count }) => `${category} (${count})`}
                labelLine={false}
              >
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Credit balance over time" icon={TrendingUp} isEmpty={creditHistory.length === 0}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={creditHistory}>
            <defs>
              <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a06bff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a06bff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="date" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={{ stroke: GRID_COLOR }} />
            <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={{ stroke: GRID_COLOR }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="balance" stroke="#4a9eff" fill="url(#creditGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}