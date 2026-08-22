import { createContext, useState, useEffect, useContext } from "react";
import { teachersApi, studentsApi } from "../services/api";
import { INITIAL_ADMINS } from "../data/eduData";

const EduAuthContext = createContext();

const VALID_PASSWORDS = ["10102013", "1010201300"];

const DEFAULT_USER = {
  id: 201,
  name: "Abdulaziz Abdulhayev (Bosh Admin)",
  phone: "+998 90 599 06 00",
  email: "admin@educontrol.uz",
  roleTitle: "Bosh Administrator",
};

export const EduAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("educontrol_is_authenticated") === "true";
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem("educontrol_role") || "admin";
  });

  const [selectedUserId, setSelectedUserId] = useState(() => {
    return parseInt(localStorage.getItem("educontrol_user_id")) || 201;
  });

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("educontrol_user_email") || "admin@educontrol.uz";
  });

  const [authError, setAuthError] = useState("");
  const [liveTeachers, setLiveTeachers] = useState([]);
  const [liveStudents, setLiveStudents] = useState([]);

  useEffect(() => {
    const fetchAuthUsers = async () => {
      try {
        const [teachersData, studentsData] = await Promise.all([
          teachersApi.getAll(),
          studentsApi.getAll(),
        ]);
        setLiveTeachers(teachersData);
        setLiveStudents(studentsData);
      } catch (err) {
        console.error("Auth users fetch error:", err.message);
      }
    };
    fetchAuthUsers();
  }, []);

  const getUserObject = (role, userId) => {
    let found;
    if (role === "admin") {
      found = INITIAL_ADMINS.find((a) => a.id === userId) || INITIAL_ADMINS[0];
    } else if (role === "teacher") {
      found = liveTeachers.find((t) => t.id === userId) || liveTeachers[0];
    } else {
      found = liveStudents.find((s) => s.id === userId) || liveStudents[0];
    }
    return found || DEFAULT_USER;
  };

  const user = getUserObject(currentRole, selectedUserId);

  const login = (email, password, roleHint = "admin") => {
    setAuthError("");

    if (!email || !email.trim()) {
      setAuthError("Iltimos, elektron pochta (Email) manzilini kiriting!");
      return false;
    }

    if (!password || !VALID_PASSWORDS.includes(password.trim())) {
      setAuthError("Noto'g'ri parol kiritildi! Iltimos qaytadan urinib ko'ring.");
      return false;
    }

    let determinedRole = roleHint;
    const lowerEmail = email.toLowerCase().trim();

    if (lowerEmail.includes("teacher") || lowerEmail.includes("ustoz") || lowerEmail.includes("oqituvchi")) {
      determinedRole = "teacher";
    } else if (lowerEmail.includes("student") || lowerEmail.includes("oquvchi") || lowerEmail.includes("talaba")) {
      determinedRole = "student";
    } else if (lowerEmail.includes("admin")) {
      determinedRole = "admin";
    }

    let targetUserId = 201;
    if (determinedRole === "admin") {
      targetUserId = 201;
    } else if (determinedRole === "teacher") {
      targetUserId = liveTeachers[0]?.id || 101;
    } else {
      targetUserId = liveStudents[0]?.id || 1;
    }

    setIsAuthenticated(true);
    setCurrentRole(determinedRole);
    setSelectedUserId(targetUserId);
    setUserEmail(email.trim());

    localStorage.setItem("educontrol_is_authenticated", "true");
    localStorage.setItem("educontrol_role", determinedRole);
    localStorage.setItem("educontrol_user_id", targetUserId.toString());
    localStorage.setItem("educontrol_user_email", email.trim());
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("educontrol_is_authenticated");
    localStorage.removeItem("educontrol_role");
    localStorage.removeItem("educontrol_user_id");
    localStorage.removeItem("educontrol_user_email");
  };

  const switchRoleWithPassword = (newRole, password, targetUserId) => {
    setAuthError("");

    if (VALID_PASSWORDS.includes(password.trim())) {
      setCurrentRole(newRole);
      const newUserId =
        targetUserId ||
        (newRole === "admin" ? 201 : newRole === "teacher" ? 101 : 1);
      setSelectedUserId(newUserId);
      localStorage.setItem("educontrol_role", newRole);
      localStorage.setItem("educontrol_user_id", newUserId.toString());
      return true;
    } else {
      setAuthError(
        "Noto'g'ri parol kiritildi! Iltimos qaytadan urinib ko'ring.",
      );
      return false;
    }
  };

  const isAdmin = currentRole === "admin";
  const isTeacher = currentRole === "teacher";
  const isStudent = currentRole === "student";

  const canManageGroups = isAdmin;
  const canManageStudents = isAdmin;
  const canMarkAttendance = isAdmin || isTeacher;
  const canManagePayments = isAdmin;

  return (
    <EduAuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        login,
        logout,
        currentRole,
        switchRoleWithPassword,
        user: user || DEFAULT_USER,
        authError,
        setAuthError,
        isAdmin,
        isTeacher,
        isStudent,
        canManageGroups,
        canManageStudents,
        canMarkAttendance,
        canManagePayments,
        allAdmins: INITIAL_ADMINS,
        allTeachers: liveTeachers.length > 0 ? liveTeachers : [{ id: 101, name: "Abdulaziz Abdulhayev", subject: "Frontend ReactJS" }],
        allStudents: liveStudents.length > 0 ? liveStudents : [{ id: 1, name: "Abdulaziz Abdulhayev", groupName: "F-12 Guruh" }],
      }}
    >
      {children}
    </EduAuthContext.Provider>
  );
};

export const useEduAuth = () => {
  const context = useContext(EduAuthContext);
  if (!context) {
    throw new Error("useEduAuth must be used within EduAuthProvider");
  }
  return context;
};

export default EduAuthContext;
