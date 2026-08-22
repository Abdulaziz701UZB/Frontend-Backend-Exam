import { useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { 
  HiBars3, 
  HiMagnifyingGlass, 
  HiCalendarDays, 
  HiOutlineArrowRightOnRectangle
} from "react-icons/hi2";
import { FaCrown, FaChalkboardUser, FaGraduationCap } from "react-icons/fa6";
import { MdWavingHand } from "react-icons/md";
import "./Header.css";

const Header = ({ onToggleMobileMenu, onOpenCmdPalette }) => {
  const navigate = useNavigate();
  const { currentRole, logout, user } = useEduAuth();

  const currentDate = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || user?.fullName || "Abdulaziz Abdulhayev";
  const firstName = displayName.split(" ")[0] || "Abdulaziz";

  return (
    <header className="crm-header">
      <div className="crm-header-content">
        <div className="header-left-flex">
          <button
            className="mobile-hamburger-btn"
            onClick={onToggleMobileMenu}
            aria-label="Menuni ochish"
          >
            <HiBars3 />
          </button>
          <div className="header-welcome">
            <h1 className="header-greeting">
              Xush kelibsiz, {firstName}{" "}
              <span className="waving-hand-wrap" title="Salom!">
                <MdWavingHand className="waving-hand-icon" />
              </span>
            </h1>
            <p className="header-date">
              <HiCalendarDays style={{ verticalAlign: 'middle', marginRight: 4 }} /> {currentDate}
            </p>
          </div>
        </div>

        <div className="header-right-actions">
          <button
            className="cmd-trigger-btn"
            onClick={onOpenCmdPalette}
            title="Tezkor qidiruv modali (Ctrl + K)"
          >
            <HiMagnifyingGlass /> <span>Tezkor Qidiruv</span>{" "}
            <code className="cmd-kbd">Ctrl + K</code>
          </button>

          <div className="crm-user-profile">
            <div className="user-avatar-wrap">
              <span className="user-avatar-emoji">
                {currentRole === "admin" && <FaCrown />}
                {currentRole === "teacher" && <FaChalkboardUser />}
                {currentRole === "student" && <FaGraduationCap />}
              </span>
            </div>
            <div className="user-info-text">
              <p className="user-display-name">{displayName}</p>
              <p className="user-display-role">
                {user?.roleTitle || (currentRole === "teacher" ? "O'qituvchi" : currentRole === "student" ? "O'quvchi" : "Administrator")}
              </p>
            </div>
          </div>

          <button
            className="crm-logout-btn"
            onClick={handleLogout}
            title="Tizimdan chiqish (Log Out)"
          >
            <HiOutlineArrowRightOnRectangle className="logout-icon" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
