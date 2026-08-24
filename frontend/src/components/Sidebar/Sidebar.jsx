import { NavLink, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { 
  HiOutlineSquares2X2, 
  HiOutlineAcademicCap, 
  HiOutlineClipboardDocumentCheck, 
  HiOutlineBanknotes, 
  HiOutlineUsers, 
  HiOutlineBookOpen, 
  HiOutlineDocumentText, 
  HiOutlineBuildingOffice2, 
  HiOutlineUserPlus,
  HiOutlineStar,
  HiOutlineSparkles,
  HiXMark,
  HiOutlineArrowRightOnRectangle
} from "react-icons/hi2";
import { FaCrown, FaChalkboardUser, FaGraduationCap, FaUserGraduate } from "react-icons/fa6";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentRole, isAdmin, isTeacher, isStudent, logout } = useEduAuth();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <aside className={`crm-sidebar ${isOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <span className="logo-spark">✨</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">EduControl</span>
            <span className="brand-subtitle">O'quv Markazi CRM</span>
          </div>
          <button className="mobile-sidebar-close" onClick={onClose} aria-label="Menuni yopish">
            <HiXMark />
          </button>
        </div>

        <div className={`role-badge role-${currentRole}`}>
          <span className="role-dot"></span>
          <span className="role-name">
            {isAdmin && <><FaCrown className="inline-icon-sm" /> Administrator</>}
            {isTeacher && <><FaChalkboardUser className="inline-icon-sm" /> O'qituvchi Panel</>}
            {isStudent && <><FaGraduationCap className="inline-icon-sm" /> O'quvchi Kabineti</>}
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
            <span className="link-icon"><HiOutlineSquares2X2 /></span>
            <span className="link-text">Dashboard</span>
          </NavLink>

          <NavLink
            to="/students"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><FaUserGraduate /></span>
            <span className="link-text">O'quvchilar Boshqaruvi</span>
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineAcademicCap /></span>
            <span className="link-text">Kurslar va Guruhlar</span>
          </NavLink>

          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineClipboardDocumentCheck /></span>
            <span className="link-text">Davomat</span>
          </NavLink>

          <NavLink
            to="/teachers"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><FaChalkboardUser /></span>
            <span className="link-text">O'qituvchilar</span>
          </NavLink>

          <NavLink
            to="/payments"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineBanknotes /></span>
            <span className="link-text">To'lovlar & Kassa</span>
          </NavLink>

          <NavLink
            to="/leads"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineUserPlus /></span>
            <span className="link-text">Lidlar Boshqaruvi</span>
          </NavLink>

          <NavLink
            to="/homework"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineBookOpen /></span>
            <span className="link-text">Uy Vazifalari</span>
          </NavLink>

          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineBuildingOffice2 /></span>
            <span className="link-text">Xonalar & Bandlik</span>
          </NavLink>

          <NavLink
            to="/certificates"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineSparkles /></span>
            <span className="link-text">Sertifikatlar</span>
          </NavLink>

          <NavLink
            to="/reviews"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineStar /></span>
            <span className="link-text">Fikrlar & NPS</span>
          </NavLink>

          <NavLink
            to="/trial-lessons"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="link-icon"><HiOutlineDocumentText /></span>
            <span className="link-text">Sinov Darslari</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Tizimdan chiqish"
          >
            <span className="link-icon"><HiOutlineArrowRightOnRectangle /></span>
            <span className="link-text">Tizimdan Chiqish</span>
          </button>
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
