import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  getStoredData,
  INITIAL_GROUPS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  STORAGE,
} from "../../data/eduData";
import "./CommandPalette.css";

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [students] = useState(() =>
    getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS),
  );
  const [groups] = useState(() =>
    getStoredData(STORAGE.GROUPS, INITIAL_GROUPS),
  );
  const [teachers] = useState(() =>
    getStoredData(STORAGE.TEACHERS, INITIAL_TEACHERS),
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredStudents = q
    ? students.filter(
        (s) => s.fullName.toLowerCase().includes(q) || s.phone.includes(q),
      )
    : students.slice(0, 3);

  const filteredGroups = q
    ? groups.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.courseName.toLowerCase().includes(q),
      )
    : groups.slice(0, 3);

  const filteredTeachers = q
    ? teachers.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q),
      )
    : teachers.slice(0, 2);

  const quickActions = [
    { title: "👨‍🎓 Yangi O'quvchi Qo'shish", path: "/students" },
    { title: "💳 To'lov Qabul Qilish", path: "/payments" },
    { title: "📚 Yangi Guruh Yaratish", path: "/groups" },
    { title: "📝 Davomat Belgilash", path: "/attendance" },
    { title: "🎯 Imtihon E'lon Qilish", path: "/exams" },
  ];

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <span className="cmd-search-icon">🔍</span>
          <input
            type="text"
            className="cmd-input"
            placeholder="Tezkor qidiruv yoki buyruq (Masalan: Abdulaziz, F-12, To'lov)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <span className="cmd-badge-esc" onClick={onClose}>
            ESC
          </span>
        </div>

        <div className="cmd-results-wrap">
          {!q && (
            <div className="cmd-section">
              <span className="cmd-section-title">⚡ TEZKOR BUYRUQLAR</span>
              {quickActions.map((action, idx) => (
                <div
                  key={idx}
                  className="cmd-item"
                  onClick={() => handleSelect(action.path)}
                >
                  <span className="cmd-item-title">{action.title}</span>
                  <span className="cmd-item-arrow">→</span>
                </div>
              ))}
            </div>
          )}

          {filteredStudents.length > 0 && (
            <div className="cmd-section">
              <span className="cmd-section-title">
                👨‍🎓 O'QUVCHILAR ({filteredStudents.length})
              </span>
              {filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className="cmd-item"
                  onClick={() => handleSelect("/students")}
                >
                  <span className="cmd-item-icon">👤</span>
                  <div className="cmd-item-text">
                    <strong>{s.fullName}</strong>
                    <small>
                      {s.groupName} • 📞 {s.phone}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredGroups.length > 0 && (
            <div className="cmd-section">
              <span className="cmd-section-title">
                📚 GURUHLAR ({filteredGroups.length})
              </span>
              {filteredGroups.map((g) => (
                <div
                  key={g.id}
                  className="cmd-item"
                  onClick={() => handleSelect("/groups")}
                >
                  <span className="cmd-item-icon">📖</span>
                  <div className="cmd-item-text">
                    <strong>
                      {g.name} ({g.courseName})
                    </strong>
                    <small>
                      👨‍🏫 {g.teacherName} • 📍 {g.room}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTeachers.length > 0 && (
            <div className="cmd-section">
              <span className="cmd-section-title">
                👨‍🏫 O'QITUVCHILAR ({filteredTeachers.length})
              </span>
              {filteredTeachers.map((t) => (
                <div
                  key={t.id}
                  className="cmd-item"
                  onClick={() => handleSelect("/teachers")}
                >
                  <span className="cmd-item-icon">{t.avatar || "👨‍🏫"}</span>
                  <div className="cmd-item-text">
                    <strong>{t.name}</strong>
                    <small>
                      {t.subject} • 📞 {t.phone}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cmd-footer">
          <span>
            💡 Maslahat: Qidiruvni yopish uchun <code>ESC</code> yoki qayta{" "}
            <code>Ctrl + K</code> bosing
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
