import { Routes, Route, Link, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";

function App() {
  const appStyle = {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0f172a",
    color: "#e5e7eb",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const headerStyle = {
    width: "100%",
    padding: "12px 24px",
    borderBottom: "1px solid #1f2937",
    backgroundColor: "#020617",
  };

  const linkStyle = {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: 500,
  };

  const mainStyle = {
    flex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 16px",
  };

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <Link to="/dashboard" style={linkStyle}>
          Панель мониторинга
        </Link>
      </header>

      <main style={mainStyle}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
