import { NavLink } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const { currentRole, isAdmin, isTeacher, isStudent } = useEduAuth();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <aside className={`crm-sidebar ${isOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <span className="brand-logo-icon">⚡</span>
          </div>
          <div className="brand-text">
            <h2 className="brand-title">EduControl</h2>
            <span className="brand-subtitle">LC-UP CRM v3.0</span>
          </div>
          <button className="mobile-sidebar-close" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className={`role-badge role-${currentRole}`}>
          <span className="role-dot"></span>
          <span className="role-name">
            {isAdmin && "👑 Administrator"}
            {isTeacher && "👨‍🏫 O'qituvchi Panel"}
            {isStudent && "🎓 O'quvchi Kabineti"}
          </span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">ASOSIY MENYU</div>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">📊</span>
            <span className="link-text">Dashboard</span>
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">📚</span>
            <span className="link-text">1. Guruhlar va Kurslar</span>
          </NavLink>

          <NavLink
            to="/students"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">👨‍🎓</span>
            <span className="link-text">2. O'quvchilar</span>
          </NavLink>

          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">📝</span>
            <span className="link-text">3. Davomat va Darslar</span>
          </NavLink>

          <NavLink
            to="/payments"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">💳</span>
            <span className="link-text">4. To'lovlar va Moliya</span>
          </NavLink>

          <NavLink
            to="/teachers"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">👨‍🏫</span>
            <span className="link-text">5. O'qituvchilar</span>
          </NavLink>

          <NavLink
            to="/exams"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">🎯</span>
            <span className="link-text">6. Imtihonlar & Baholar</span>
          </NavLink>

          <NavLink
            to="/homework"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">📖</span>
            <span className="link-text">7. Uyga Vazifalar</span>
          </NavLink>

          <NavLink
            to="/certificates"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">📜</span>
            <span className="link-text">8. Sertifikatlar</span>
          </NavLink>

          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">🏢</span>
            <span className="link-text">9. Xonalar & Inventar</span>
          </NavLink>

          <NavLink
            to="/leads"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon">📞</span>
            <span className="link-text">10. Lidlar & Sales CRM</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-ping"></span>
            <span>Tizim Holati: Faol</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
