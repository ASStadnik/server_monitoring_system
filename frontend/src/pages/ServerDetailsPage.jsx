import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function ServerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // сервер
  const [server, setServer] = useState(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // проверки
  const [checks, setChecks] = useState([]);
  const [checksLoading, setChecksLoading] = useState(false);
  const [checksError, setChecksError] = useState("");

  // история результатов
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  // форма новой проверки
  const [checkType, setCheckType] = useState("");
  const [checkInterval, setCheckInterval] = useState("");
  const [checkTimeout, setCheckTimeout] = useState("");
  const [checkSubmitError, setCheckSubmitError] = useState("");
  const [checkSubmitting, setCheckSubmitting] = useState(false);

  // ------------------- загрузка данных с бэка -------------------

  const loadServer = async () => {
    try {
      setServerLoading(true);
      setServerError("");
      const resp = await fetch(`${API_BASE_URL}/servers/${id}`);
      if (!resp.ok) throw new Error(`Ошибка загрузки сервера: ${resp.status}`);
      const data = await resp.json();
      setServer(data);
    } catch (e) {
      setServerError(e.message || "Неизвестная ошибка");
    } finally {
      setServerLoading(false);
    }
  };

  const loadChecks = async () => {
    try {
      setChecksLoading(true);
      setChecksError("");
      const resp = await fetch(`${API_BASE_URL}/servers/${id}/checks`);
      if (!resp.ok && resp.status !== 404) {
        throw new Error(`Ошибка загрузки проверок: ${resp.status}`);
      }
      if (resp.ok) {
        const data = await resp.json();
        setChecks(data);
      } else {
        setChecks([]);
      }
    } catch (e) {
      setChecksError(e.message || "Неизвестная ошибка");
    } finally {
      setChecksLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      setResultsLoading(true);
      setResultsError("");
      const resp = await fetch(`${API_BASE_URL}/servers/${id}/results`);
      if (!resp.ok && resp.status !== 404) {
        throw new Error(`Ошибка загрузки истории: ${resp.status}`);
      }
      if (resp.ok) {
        const data = await resp.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (e) {
      setResultsError(e.message || "Неизвестная ошибка");
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    loadServer();
    loadChecks();
    loadResults();
  }, [id]);

  // ------------------- создание новой проверки -------------------

  const handleCreateCheck = async (event) => {
    event.preventDefault();
    setCheckSubmitError("");

    if (!checkType.trim() || !checkInterval.trim() || !checkTimeout.trim()) {
      setCheckSubmitError("Заполните все поля проверки.");
      return;
    }

    const intervalNum = Number(checkInterval);
    const timeoutNum = Number(checkTimeout);

    if (
      Number.isNaN(intervalNum) ||
      Number.isNaN(timeoutNum) ||
      intervalNum <= 0 ||
      timeoutNum <= 0
    ) {
      setCheckSubmitError("Интервал и таймаут должны быть положительными числами.");
      return;
    }

    try {
      setCheckSubmitting(true);
      const resp = await fetch(`${API_BASE_URL}/servers/${id}/checks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: checkType,
          interval: intervalNum,
          timeout: timeoutNum,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Ошибка создания проверки: ${resp.status}`);
      }

      const newCheck = await resp.json();
      setChecks((prev) => [...prev, newCheck]);

      setCheckType("");
      setCheckInterval("");
      setCheckTimeout("");
    } catch (e) {
      setCheckSubmitError(e.message || "Неизвестная ошибка");
    } finally {
      setCheckSubmitting(false);
    }
  };

  // ------------------- вспомогалки -------------------

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
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

  // ------------------- стили -------------------

  const outerStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  };

  const pageStyle = {
    width: "100%",
    maxWidth: "720px",
    color: "#e5e7eb",
  };

  const backButtonStyle = {
    border: "none",
    background: "none",
    color: "#60a5fa",
    cursor: "pointer",
    marginBottom: "8px",
    padding: 0,
  };

  const cardStyle = {
    backgroundColor: "#020617",
    borderRadius: "16px",
    border: "1px solid #1f2937",
    padding: "20px 24px",
    marginBottom: "16px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
  };

  const cardTitleStyle = {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "12px",
  };

  const labelStyle = {
    fontSize: "14px",
    color: "#9ca3af",
  };

  const valueStyle = {
    fontSize: "16px",
    marginBottom: "8px",
  };

  const formGroupStyle = {
    marginBottom: "10px",
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

  const errorTextStyle = {
    color: "#f97373",
    fontSize: "14px",
    marginTop: "4px",
  };

  const mutedTextStyle = {
    fontSize: "14px",
    color: "#9ca3af",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  };

  const thStyle = {
    textAlign: "left",
    padding: "6px 8px",
    borderBottom: "1px solid #1f2937",
    color: "#9ca3af",
  };

  const tdStyle = {
    padding: "6px 8px",
    borderBottom: "1px solid #111827",
  };

  const statusDotStyle = (status) => ({
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    marginRight: "6px",
    backgroundColor: getStatusColor(status),
  });

  // ------------------- рендер -------------------

  return (
    <div style={outerStyle}>
      <div style={pageStyle}>
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          ← Назад
        </button>

        <div style={{ marginBottom: "8px" }}>
          <Link to="/dashboard" style={{ color: "#60a5fa", textDecoration: "none" }}>
            К панели мониторинга
          </Link>
        </div>

        {/* сервер */}
        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>Информация о сервере</h2>

          {serverLoading && <p>Загрузка сервера...</p>}
          {serverError && <p style={errorTextStyle}>Ошибка: {serverError}</p>}

          {server && (
            <div>
              <div style={labelStyle}>ID</div>
              <div style={valueStyle}>{server.id}</div>

              <div style={labelStyle}>Название</div>
              <div style={valueStyle}>{server.name}</div>

              <div style={labelStyle}>Host / IP</div>
              <div style={valueStyle}>{server.host}</div>

              <div style={labelStyle}>Статус (логический)</div>
              <div style={valueStyle}>
                <span style={statusDotStyle(server.status)}></span>
                {server.status}
              </div>
            </div>
          )}
        </section>

        {/* проверки */}
        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>Регулярные проверки</h2>

          {checksLoading && <p>Загрузка проверок...</p>}
          {checksError && <p style={errorTextStyle}>Ошибка: {checksError}</p>}

          {checks.length === 0 && !checksLoading && (
            <p style={mutedTextStyle}>Для сервера пока нет проверок.</p>
          )}

          {checks.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Тип</th>
                  <th style={thStyle}>Интервал (сек)</th>
                  <th style={thStyle}>Таймаут (сек)</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => (
                  <tr key={check.id}>
                    <td style={tdStyle}>{check.id}</td>
                    <td style={tdStyle}>{check.type}</td>
                    <td style={tdStyle}>{check.interval}</td>
                    <td style={tdStyle}>{check.timeout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <hr style={{ margin: "16px 0", borderColor: "#1f2937" }} />

          <h3 style={{ ...cardTitleStyle, fontSize: "16px", marginBottom: "8px" }}>
            Добавить новую проверку
          </h3>

          <form onSubmit={handleCreateCheck}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Тип проверки (ping/http/...):
                <input
                  type="text"
                  style={inputStyle}
                  value={checkType}
                  onChange={(e) => setCheckType(e.target.value)}
                />
              </label>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Интервал (сек):
                <input
                  type="number"
                  style={inputStyle}
                  value={checkInterval}
                  onChange={(e) => setCheckInterval(e.target.value)}
                />
              </label>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Таймаут (сек):
                <input
                  type="number"
                  style={inputStyle}
                  value={checkTimeout}
                  onChange={(e) => setCheckTimeout(e.target.value)}
                />
              </label>
            </div>

            {checkSubmitError && <p style={errorTextStyle}>{checkSubmitError}</p>}

            <button type="submit" style={primaryButtonStyle} disabled={checkSubmitting}>
              {checkSubmitting ? "Сохраняем..." : "Сохранить проверку"}
            </button>
          </form>
        </section>

        {/* результаты */}
        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>История результатов проверок</h2>

          {resultsLoading && <p>Загрузка истории...</p>}
          {resultsError && <p style={errorTextStyle}>Ошибка: {resultsError}</p>}

          {results.length === 0 && !resultsLoading && (
            <p style={mutedTextStyle}>История ещё пустая.</p>
          )}

          {results.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Статус</th>
                  <th style={thStyle}>Начало</th>
                  <th style={thStyle}>Окончание</th>
                  <th style={thStyle}>Метрики</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.id}>
                    <td style={tdStyle}>{res.id}</td>
                    <td style={tdStyle}>
                      <span style={statusDotStyle(res.status)}></span>
                      {res.status}
                    </td>
                    <td style={tdStyle}>{formatDateTime(res.started_at)}</td>
                    <td style={tdStyle}>{formatDateTime(res.finished_at)}</td>
                    <td style={tdStyle}>
                      {res.metrics ? JSON.stringify(res.metrics) : (
                        <span style={mutedTextStyle}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default ServerDetailsPage;
