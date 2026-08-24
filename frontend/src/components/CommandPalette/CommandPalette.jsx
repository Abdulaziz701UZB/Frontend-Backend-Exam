import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { studentsApi, groupsApi, teachersApi } from "../../services/api";
import { 
  HiMagnifyingGlass, 
  HiBolt, 
  HiOutlineUserPlus, 
  HiOutlineCreditCard, 
  HiOutlineAcademicCap, 
  HiOutlineClipboardDocumentCheck, 
  HiOutlineTrophy, 
  HiArrowRight,
  HiOutlineUser,
  HiOutlineBookOpen,
  HiOutlineMapPin,
  HiOutlinePhone
} from "react-icons/hi2";
import { FaUserGraduate, FaChalkboardUser, FaLightbulb } from "react-icons/fa6";
import "./CommandPalette.css";

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      const fetchLiveData = async () => {
        try {
          const [sData, gData, tData] = await Promise.all([
            studentsApi.getAll(),
            groupsApi.getAll(),
            teachersApi.getAll(),
          ]);
          setStudents(sData);
          setGroups(gData);
          setTeachers(tData);
        } catch (err) {
          console.error("Command palette load error:", err.message);
        }
      };
      fetchLiveData();
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
        (s) => (s.fullName || "").toLowerCase().includes(q) || (s.phone || "").includes(q),
      )
    : students.slice(0, 3);

  const filteredGroups = q
    ? groups.filter(
        (g) =>
          (g.name || "").toLowerCase().includes(q) ||
          (g.courseName || "").toLowerCase().includes(q),
      )
    : groups.slice(0, 3);

  const filteredTeachers = q
    ? teachers.filter(
        (t) =>
          (t.name || "").toLowerCase().includes(q) ||
          (t.subject || "").toLowerCase().includes(q),
      )
    : teachers.slice(0, 2);

  const quickActions = [
    { title: "Yangi O'quvchi Qo'shish", icon: <HiOutlineUserPlus />, path: "/students" },
    { title: "To'lov Qabul Qilish", icon: <HiOutlineCreditCard />, path: "/payments" },
    { title: "Yangi Guruh Yaratish", icon: <HiOutlineAcademicCap />, path: "/groups" },
    { title: "Davomat Belgilash", icon: <HiOutlineClipboardDocumentCheck />, path: "/attendance" },
    { title: "Imtihon E'lon Qilish", icon: <HiOutlineTrophy />, path: "/exams" },
  ];

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <span className="cmd-search-icon"><HiMagnifyingGlass /></span>
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Tezkor qidiruv yoki buyruq..."
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
              <span className="cmd-section-title">
                <HiBolt className="inline-icon-xs text-amber" /> TEZKOR BUYRUQLAR
              </span>
              {quickActions.map((action, idx) => (
                <div
                  key={idx}
                  className="cmd-item"
                  onClick={() => handleSelect(action.path)}
                >
                  <span className="cmd-item-title">
                    {action.icon} {action.title}
                  </span>
                  <span className="cmd-item-arrow"><HiArrowRight /></span>
                </div>
              ))}
            </div>
          )}

          {filteredStudents.length > 0 && (
            <div className="cmd-section">
              <span className="cmd-section-title">
                <FaUserGraduate className="inline-icon-xs text-indigo" /> O'QUVCHILAR ({filteredStudents.length})
              </span>
              {filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className="cmd-item"
                  onClick={() => handleSelect("/students")}
                >
                  <span className="cmd-item-icon"><HiOutlineUser /></span>
                  <div className="cmd-item-text">
                    <strong>{s.fullName}</strong>
                    <small>
                      {s.groupName} • <HiOutlinePhone className="inline-icon-xs" /> {s.phone}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredGroups.length > 0 && (
            <div className="cmd-section">
              <span className="cmd-section-title">
                <HiOutlineAcademicCap className="inline-icon-xs text-indigo" /> GURUHLAR ({filteredGroups.length})
              </span>
              {filteredGroups.map((g) => (
                <div
                  key={g.id}
                  className="cmd-item"
                  onClick={() => handleSelect("/groups")}
                >
                  <span className="cmd-item-icon"><HiOutlineBookOpen /></span>
                  <div className="cmd-item-text">
                    <strong>
                      {g.name} ({g.courseName})
                    </strong>
                    <small>
                      <FaChalkboardUser className="inline-icon-xs" /> {g.teacherName} • <HiOutlineMapPin className="inline-icon-xs" /> {g.room}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTeachers.length > 0 && (
            <div className="cmd-section">
              <span className="cmd-section-title">
                <FaChalkboardUser className="inline-icon-xs text-blue" /> O'QITUVCHILAR ({filteredTeachers.length})
              </span>
              {filteredTeachers.map((t) => (
                <div
                  key={t.id}
                  className="cmd-item"
                  onClick={() => handleSelect("/teachers")}
                >
                  <span className="cmd-item-icon"><FaChalkboardUser /></span>
                  <div className="cmd-item-text">
                    <strong>{t.name}</strong>
                    <small>
                      {t.subject} • <HiOutlinePhone className="inline-icon-xs" /> {t.phone}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cmd-footer">
          <span>
            <FaLightbulb className="inline-icon-xs text-amber" />
            Maslahat: Qidiruvni yopish uchun <code>ESC</code> yoki qayta{" "}
            <code>Ctrl + K</code> bosing
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
