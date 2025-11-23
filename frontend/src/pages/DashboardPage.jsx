import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function DashboardPage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // добавление сервера
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // редактирование сервера
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editHost, setEditHost] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);

  // удаление
  const [deletingId, setDeletingId] = useState(null);

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

  const handleAddServer = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!name.trim() || !host.trim()) {
      setSubmitError("Заполните оба поля.");
      return;
    }

    try {
      setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (server) => {
    setEditingId(server.id);
    setEditName(server.name);
    setEditHost(server.host);
    setUpdateError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditHost("");
    setUpdateError("");
  };

  const handleUpdateServer = async (event) => {
    event.preventDefault();
    if (!editingId) return;

    if (!editName.trim() || !editHost.trim()) {
      setUpdateError("Заполните оба поля.");
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/servers/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName, host: editHost }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка обновления: ${response.status}`);
      }

      const updated = await response.json();

      setServers((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );

      cancelEdit();
    } catch (e) {
      setUpdateError(e.message || "Неизвестная ошибка");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteServer = async (id, name) => {
    const confirmed = window.confirm(`Удалить сервер "${name}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const response = await fetch(`${API_BASE_URL}/servers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Ошибка удаления: ${response.status}`);
      }

      setServers((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(e.message || "Ошибка удаления");
    } finally {
      setDeletingId(null);
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

  // --- стили ---

  const outerContainerStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
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
  };

  const formGroupStyle = {
    marginBottom: "12px",
    textAlign: "left",
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

  const dangerButtonStyle = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "12px",
  };

  const smallButtonStyle = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#111827",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "8px",
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
    justifyContent: "space-between",
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
    marginRight: "6px",
  };

  const serverInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const serverNameLinkStyle = {
    color: "#60a5fa",
    textDecoration: "none",
  };

  return (
    <div style={outerContainerStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Панель мониторинга</h1>

        {/* Карточка добавления */}
        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>Добавить сервер</h2>

          <form onSubmit={handleAddServer}>
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

            <button
              type="submit"
              style={primaryButtonStyle}
              disabled={submitting}
            >
              {submitting ? "Сохраняем..." : "Сохранить"}
            </button>
          </form>
        </section>

        {/* Кнопка обновления */}
        <div style={{ marginBottom: "12px" }}>
          <button
            style={secondaryButtonStyle}
            onClick={loadServers}
            disabled={loading}
          >
            {loading ? "Обновляем..." : "Обновить список"}
          </button>
        </div>

        {error && <p style={errorTextStyle}>Ошибка: {error}</p>}

        {/* Список серверов */}
        {servers.length === 0 && !loading && (
          <p style={mutedTextStyle}>Серверов пока нет.</p>
        )}

        {servers.length > 0 && (
          <p style={mutedTextStyle}>Всего серверов: {servers.length}</p>
        )}

        <ul style={listStyle}>
          {servers.map((server) => (
            <li key={server.id} style={listItemStyle}>
              <div style={serverInfoStyle}>
                <span
                  style={{
                    ...statusDotBaseStyle,
                    backgroundColor: getStatusColor(server.status),
                  }}
                ></span>
                <div>
                  <Link
                    to={`/servers/${server.id}`}
                    style={serverNameLinkStyle}
                  >
                    <strong>{server.name}</strong>
                  </Link>{" "}
                  <span>({server.host})</span>
                </div>
              </div>

              <div>
                <button
                  style={smallButtonStyle}
                  onClick={() => startEdit(server)}
                >
                  Редактировать
                </button>
                <button
                  style={dangerButtonStyle}
                  onClick={() => handleDeleteServer(server.id, server.name)}
                  disabled={deletingId === server.id}
                >
                  {deletingId === server.id ? "Удаляем..." : "Удалить"}
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Карточка редактирования (появляется при выборе сервера) */}
        {editingId && (
          <section style={cardStyle}>
            <h2 style={cardTitleStyle}>Редактировать сервер</h2>

            <form onSubmit={handleUpdateServer}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Новое название:
                  <input
                    type="text"
                    style={inputStyle}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </label>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Новый host / IP:
                  <input
                    type="text"
                    style={inputStyle}
                    value={editHost}
                    onChange={(e) => setEditHost(e.target.value)}
                  />
                </label>
              </div>

              {updateError && <p style={errorTextStyle}>{updateError}</p>}

              <button
                type="submit"
                style={primaryButtonStyle}
                disabled={updating}
              >
                {updating ? "Сохраняем..." : "Сохранить изменения"}
              </button>

              <button
                type="button"
                style={{ ...secondaryButtonStyle, marginLeft: "8px" }}
                onClick={cancelEdit}
                disabled={updating}
              >
                Отмена
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
