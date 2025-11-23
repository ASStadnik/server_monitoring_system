import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function DashboardPage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [submitError, setSubmitError] = useState("");

  const loadServers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/servers`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      const data = await response.json();
      setServers(data);
    } catch (e) {
      setError(e.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!name.trim() || !host.trim()) {
      setSubmitError("Заполните оба поля.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/servers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, host }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка добавления: ${response.status}`);
      }

      const newServer = await response.json();
      setServers((prev) => [...prev, newServer]);

      setName("");
      setHost("");
    } catch (e) {
      setSubmitError(e.message || "Неизвестная ошибка");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OK":
        return "#22c55e";
      case "WARN":
        return "#facc15";
      case "CRIT":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };


  const containerStyle = {
  width: "100%",
  maxWidth: "480px",
  textAlign: "center",
  };


  const titleStyle = {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "24px",
    textAlign: "center",
  };

  const cardStyle = {
    backgroundColor: "#020617",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "20px 24px",
    margin: "0 auto 24px auto",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.45)",
  };


  const cardTitleStyle = {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "16px",
    textAlign: "center",
  };

  const formGroupStyle = {
    marginBottom: "12px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    marginBottom: "4px",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #4b5563",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    outline: "none",
  };

  const primaryButtonStyle = {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "14px",
  };

  const secondaryButtonStyle = {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#111827",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "14px",
  };

  const errorTextStyle = {
    color: "#f97373",
    fontSize: "14px",
    marginTop: "4px",
  };

  const mutedTextStyle = {
    fontSize: "14px",
    color: "#9ca3af",
  };

  const listStyle = {
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  const listItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid #1f2937",
    marginBottom: "8px",
    backgroundColor: "#020617",
  };

  const statusDotBaseStyle = {
    width: "12px",
    height: "12px",
    borderRadius: "999px",
  };

  return (
  <div
    style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div style={containerStyle}>
      <h1 style={titleStyle}>Панель мониторинга</h1>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>Добавить сервер</h2>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Название:
              <input
                type="text"
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Host / IP:
              <input
                type="text"
                style={inputStyle}
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
            </label>
          </div>

          {submitError && <p style={errorTextStyle}>{submitError}</p>}

          <button type="submit" style={primaryButtonStyle}>
            Сохранить
          </button>
        </form>
      </section>

      <div style={{ marginBottom: "12px" }}>
        <button style={secondaryButtonStyle} onClick={loadServers}>
          Обновить список
        </button>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p style={errorTextStyle}>Ошибка: {error}</p>}

      {servers.length === 0 && !loading && (
        <p style={mutedTextStyle}>Серверов пока нет.</p>
      )}

      <ul style={listStyle}>
        {servers.map((server) => (
          <li key={server.id} style={listItemStyle}>
            <span
              style={{
                ...statusDotBaseStyle,
                backgroundColor: getStatusColor(server.status),
              }}
            ></span>
            <div>
              <strong>{server.name}</strong> ({server.host}) — статус:{" "}
              {server.status || "unknown"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

}

export default DashboardPage;
