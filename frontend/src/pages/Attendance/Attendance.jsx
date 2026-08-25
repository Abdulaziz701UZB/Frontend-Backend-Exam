import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { attendanceApi, groupsApi, studentsApi } from "../../services/api";
import { format9DigitId } from "../../utils/idFormatter";
import StudentProfileModal from "../../components/StudentProfileModal/StudentProfileModal";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineFlag,
  HiOutlineInformationCircle,
  HiOutlineEllipsisHorizontal,
  HiOutlineEllipsisVertical,
  HiOutlineArrowsUpDown,
  HiOutlineArrowsPointingOut,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineArrowLeft,
  HiOutlineChevronDown,
  HiOutlineLockClosed,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle
} from "react-icons/hi2";
import { FaTelegram, FaUserGraduate, FaChalkboardUser } from "react-icons/fa6";
import "./Attendance.css";

const LC_UP_TABS = [
  { id: "attendance", label: "Davomat" },
  { id: "grades", label: "Baholash" },
  { id: "exercises", label: "Mashqlar" },
  { id: "homework", label: "Uyga vazifa" },
  { id: "discounts", label: "Chegirma" },
  { id: "ratings", label: "Reyting" },
  { id: "exams", label: "Imtihonlar" },
  { id: "history", label: "Tarix" },
  { id: "notes", label: "Izoh" }
];

const MONTHS_LIST = [
  { key: "05", name: "May", short: "may" },
  { key: "06", name: "Iyun", short: "iyun" },
  { key: "07", name: "Iyul", short: "iyul" },
  { key: "08", name: "Avg", short: "avg" },
  { key: "09", name: "Sen", short: "sen" },
  { key: "10", name: "Okt", short: "okt" },
  { key: "11", name: "Noy", short: "noy" },
  { key: "12", name: "Dek", short: "dek" }
];

const EXCUSED_REASONS = [
  { id: "medical", label: "Salomatlik / Kasallik", tag: "Kasal" },
  { id: "family", label: "Oilaviy Sabab", tag: "Oilaviy" },
  { id: "competition", label: "Musobaqa / Olimpiada", tag: "Musobaqa" },
  { id: "technical", label: "Texnik / Transport", tag: "Texnik" },
  { id: "other_excused", label: "Boshqa Uzrli Sabab", tag: "Uzrli" }
];

const Attendance = () => {
  const { currentRole, user, canMarkAttendance } = useEduAuth();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("08");
  const [selectedGradeDate, setSelectedGradeDate] = useState("");
  const [studentFilter, setStudentFilter] = useState("all"); // all, debtors, trial, active, frozen
  const [sortAsc, setSortAsc] = useState(true);

  // Local Attendance Matrix: { [studentId_dateKey]: { status: 'Present'|'Excused'|'Absent'|'Trial'|null, note: '' } }
  const [matrixData, setMatrixData] = useState({});
  const [gradesData, setGradesData] = useState({});

  const teacherFullName = (user?.name || user?.fullName || "").toLowerCase().trim();

  const accessibleGroups = currentRole === "admin"
    ? groups
    : groups.filter((g) => {
        const gTeacher = (g.teacherName || "").toLowerCase().trim();
        const gTeacherId = String(g.teacherId || g.teacher_id || "");
        const curUserId = String(user?.id || "");
        if (curUserId && gTeacherId && gTeacherId === curUserId) return true;
        if (teacherFullName && gTeacher) {
          const tWords = teacherFullName.split(" ").filter((w) => w.length > 2);
          return tWords.some((w) => gTeacher.includes(w)) || gTeacher.includes(teacherFullName) || teacherFullName.includes(gTeacher);
        }
        return false;
      });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [gData, sData, aData] = await Promise.all([
        groupsApi.getAll(),
        studentsApi.getAll(),
        attendanceApi.getAll()
      ]);
      setGroups(gData);
      setStudents(sData);
      setAttendanceRecords(aData);

      if (gData.length > 0 && !selectedGroup) {
        setSelectedGroup(gData[0].id);
      }
    } catch (err) {
      console.error("Attendance initial load error:", err.message);
      toast.error("Davomat ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const currentGroupObj = groups.find((g) => g.id === selectedGroup) || groups[0];
  const activeGroupStudents = students.filter((s) => s.groupId === selectedGroup);

  // Generate lesson dates for selected year & month based on group schedule
  const getMonthLessonDates = () => {
    const monthObj = MONTHS_LIST.find((m) => m.key === selectedMonth) || MONTHS_LIST[3];
    const monthShort = monthObj.short;
    
    // Generates realistic schedule dates for odd/even days
    const isOddDays = (currentGroupObj?.scheduleDays || "").toLowerCase().includes("dushanba") || (currentGroupObj?.name || "").includes("Toq");
    const dayNumbers = isOddDays 
      ? ["03", "05", "07", "10", "12", "14", "17", "19", "21", "24", "26", "28", "31"]
      : ["02", "04", "06", "09", "11", "13", "16", "18", "20", "23", "25", "27", "30"];

    return dayNumbers.map((d) => ({
      dayStr: `${d} ${monthShort}`,
      fullDate: `${selectedYear}-${selectedMonth}-${d}`,
      dayNum: d
    }));
  };

  const lessonDates = getMonthLessonDates();

  // Populate matrix when group, month, or attendance records change
  useEffect(() => {
    if (!selectedGroup) return;

    const newMatrix = {};
    const newGrades = {};

    activeGroupStudents.forEach((student, sIdx) => {
      lessonDates.forEach((d) => {
        const cellKey = `${student.id}_${d.fullDate}`;
        const found = attendanceRecords.find(
          (r) => String(r.groupId || r.group_id) === String(selectedGroup) &&
                 String(r.studentId || r.student_id) === String(student.id) &&
                 r.date === d.fullDate
        );

        if (found) {
          newMatrix[cellKey] = {
            status: found.status,
            note: found.note || ""
          };
        } else {
          // Default is unmarked (dot .)
          newMatrix[cellKey] = { status: null, note: "" };
        }
      });

      newGrades[student.id] = {
        score: 10,
        homework: true,
        comment: ""
      };
    });

    setMatrixData(newMatrix);
    setGradesData(newGrades);
  }, [selectedGroup, selectedMonth, selectedYear, activeGroupStudents.length, attendanceRecords.length]);

  // Active cell picker state (shows ✅ ❌ on two sides when clicked)
  const [activePickerCell, setActivePickerCell] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".td-attendance-cell")) {
        setActivePickerCell(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // 1-Qoida: Dars tugaganidan so'ng 1 soatgacha tahrirlash mumkin (faqat O'qituvchilar uchun). Admin esa istalgan payt o'zgartira oladi.
  const isLessonTimeLocked = (fullDate) => {
    if (currentRole === "admin") return false; // Admin cheklovsiz tahrirlaydi

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // O'tib ketgan sana (kecha yoki oldingi kunlar)
    if (fullDate < todayStr) {
      return true;
    }

    // Kelajak sanasi
    if (fullDate > todayStr) {
      return false;
    }

    // Bugungi dars: dars tugashidan so'ng 1 soatgacha
    const scheduleTimeStr = currentGroupObj?.time || currentGroupObj?.scheduleTime || "14:00 - 16:00";
    const parts = scheduleTimeStr.split("-");
    if (parts.length === 2) {
      const endPart = parts[1].trim(); // "16:00"
      const [endHour, endMin] = endPart.split(":").map(Number);
      if (!isNaN(endHour)) {
        const lockHour = endHour + 1; // 1 soatlik vaqt oynasi
        const currentHour = today.getHours();
        const currentMin = today.getMinutes();
        if (currentHour > lockHour || (currentHour === lockHour && currentMin > (endMin || 0))) {
          return true; // 1 soatdan ko'p vaqt o'tgan -> Qulflangan
        }
      }
    }

    return false;
  };

  // Set status directly from ✅ ❌ picker with Instant Auto-Save & Bot Dispatch
  const handleSelectStatus = async (studentId, fullDate, studentName, newStatus, e) => {
    if (e) e.stopPropagation();
    if (!canMarkAttendance) return;

    if (isLessonTimeLocked(fullDate)) {
      toast.error("⏱️ Ushbu dars davomati qulflangan! Qoida bo'yicha dars tugaganidan so'ng faqat 1 soatgacha o'zgartirish mumkin. O'zgartirish uchun Adminga murojaat qiling.");
      return;
    }

    const cellKey = `${studentId}_${fullDate}`;
    setMatrixData((prev) => ({
      ...prev,
      [cellKey]: {
        status: newStatus,
        note: newStatus === "Excused" ? "Salomatlik / Uzrli" : newStatus === "Absent" ? "Sababsiz" : ""
      }
    }));

    setActivePickerCell(null);

    // Instant Backend Auto-Save
    try {
      if (newStatus) {
        await attendanceApi.create({
          group_id: selectedGroup,
          student_id: studentId,
          date: fullDate,
          status: newStatus,
          note: newStatus === "Excused" ? "Salomatlik / Uzrli" : newStatus === "Absent" ? "Sababsiz" : ""
        });
      }
    } catch (err) {
      console.warn("Auto-save sync:", err.message);
    }

    if (newStatus === "Present") {
      toast.success(`"${studentName}" — Keldi ✅ (Avto-saqlandi & Botga yuborildi)`);
    } else if (newStatus === "Absent") {
      toast.error(`"${studentName}" — Kelmadi ❌ (Avto-saqlandi & Telegram bot ogohlantirildi)`);
    } else if (newStatus === "Excused") {
      toast.info(`"${studentName}" — Sababli dars qoldirdi 🚩 (Avto-saqlandi)`);
    } else {
      toast.info(`"${studentName}" davomati tozalandi • (Avto-saqlandi)`);
    }
  };

  // Mark all students Present for all dates with instant auto-save
  const handleMarkAllPresent = async () => {
    const updated = { ...matrixData };
    const promises = [];

    activeGroupStudents.forEach((student) => {
      lessonDates.forEach((d) => {
        if (parseInt(d.dayNum, 10) <= 25) {
          const cellKey = `${student.id}_${d.fullDate}`;
          updated[cellKey] = { status: "Present", note: "" };
          promises.push(
            attendanceApi.create({
              group_id: selectedGroup,
              student_id: student.id,
              date: d.fullDate,
              status: "Present",
              note: ""
            }).catch(() => null)
          );
        }
      });
    });

    setMatrixData(updated);
    await Promise.all(promises);
    toast.success("Barcha talabalar 'Keldi' qilindi va avtomatik ravishda saqlandi! ⚡");
  };

  // Filter students based on legend
  const filteredStudents = activeGroupStudents.filter((s) => {
    const isDebtor = (s.balance || 0) < 0 || s.paymentStatus === "Overdue" || s.paymentStatus === "Unpaid";
    if (studentFilter === "debtors") return isDebtor;
    if (studentFilter === "trial") return s.status === "Trial" || (s.notes || "").includes("Sinov");
    if (studentFilter === "frozen") return s.status === "Frozen" || s.status === "Inactive";
    if (studentFilter === "active") return !isDebtor && s.status !== "Frozen";
    return true;
  }).sort((a, b) => {
    if (sortAsc) return a.fullName.localeCompare(b.fullName);
    return b.fullName.localeCompare(a.fullName);
  });

  return (
    <div className="lc-up-attendance-container">
      {/* Top Bar for Group Switcher & Real-time Auto-save Indicator */}
      <div className="lc-up-header-bar">
        <div className="group-switcher-wrap">
          <label className="group-switcher-label">Tanlangan Guruh:</label>
          <select
            className="lc-up-group-select"
            value={selectedGroup || ""}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {accessibleGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} — {g.courseName} ({g.teacherName})
              </option>
            ))}
          </select>
        </div>

        <div className="lc-up-header-actions">
          {canMarkAttendance && (
            <button
              type="button"
              className="lc-btn-mark-all"
              onClick={handleMarkAllPresent}
              title="Barcha talabalarni 'Keldi' qilish"
            >
              <HiOutlineCheck className="btn-icon" /> Barchasi Keldi
            </button>
          )}

          <div className="auto-save-live-indicator">
            <span className="live-pulse-dot"></span>
            <span className="auto-save-text">Real-time Avto-Saqlash & Bot Faol</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column LC-UP Layout */}
      <div className="lc-up-main-layout">
        {/* LEFT COLUMN: Group Info Card & Student Roster */}
        <div className="lc-left-panel">
          {/* Group Info Header */}
          <div className="lc-group-passport-card">
            <div className="passport-title-row">
              <h2 className="passport-title">{currentGroupObj?.name || "E-08 Toq Kunlar"}</h2>
              <button className="passport-more-btn" title="Qo'shimcha amallar">
                <HiOutlineEllipsisHorizontal />
              </button>
            </div>

            <div className="passport-details-list">
              <div className="passport-row">
                <span className="passport-label">O'qituvchi:</span>
                <span className="passport-teacher-val">{currentGroupObj?.teacherName || "To'rayeva Azizaxon"}</span>
              </div>
              <div className="passport-row">
                <span className="passport-label">Narx:</span>
                <span className="passport-val">{Number(currentGroupObj?.monthlyFee || 850000).toLocaleString("uz-UZ")} so'm</span>
              </div>
              <div className="passport-row">
                <span className="passport-label">Vaqt:</span>
                <span className="passport-val">{currentGroupObj?.scheduleTime || "09:30 - 11:00"}</span>
              </div>
              <div className="passport-row">
                <span className="passport-label">Kurs:</span>
                <span className="passport-val">{currentGroupObj?.courseName || "A1 level"}</span>
              </div>
              <div className="passport-row">
                <span className="passport-label">Boshlanish sanasi:</span>
                <span className="passport-val">May 12, 2025</span>
              </div>
              <div className="passport-row">
                <span className="passport-label">Xona:</span>
                <span className="passport-val">{currentGroupObj?.room || "13-xona"}</span>
              </div>
              <div className="passport-row">
                <span className="passport-label">O'tilgan darslar:</span>
                <span className="passport-val">42</span>
              </div>
              <div className="passport-row">
                <span className="passport-label">Dars kunlari:</span>
                <span className="passport-days-val">{currentGroupObj?.scheduleDays || "Dushanba  Chorshanba  Juma"}</span>
              </div>
            </div>

            {/* Status Legend Filter Pills */}
            <div className="passport-legend-bar">
              <button 
                type="button" 
                className="btn-sort-toggle" 
                onClick={() => setSortAsc(!sortAsc)}
                title="Alifbo bo'yicha saralash"
              >
                <HiOutlineArrowsUpDown />
              </button>

              <button 
                type="button" 
                className={`legend-pill pill-debtors ${studentFilter === "debtors" ? "active" : ""}`}
                onClick={() => setStudentFilter(studentFilter === "debtors" ? "all" : "debtors")}
              >
                <span className="legend-dot dot-red"></span> Qarzdorlar
              </button>

              <button 
                type="button" 
                className={`legend-pill pill-trial ${studentFilter === "trial" ? "active" : ""}`}
                onClick={() => setStudentFilter(studentFilter === "trial" ? "all" : "trial")}
              >
                <span className="legend-dot dot-cyan"></span> Sinov darsida
              </button>

              <button 
                type="button" 
                className={`legend-pill pill-active ${studentFilter === "active" ? "active" : ""}`}
                onClick={() => setStudentFilter(studentFilter === "active" ? "all" : "active")}
              >
                <span className="legend-dot dot-green"></span> Faol
              </button>

              <button 
                type="button" 
                className={`legend-pill pill-frozen ${studentFilter === "frozen" ? "active" : ""}`}
                onClick={() => setStudentFilter(studentFilter === "frozen" ? "all" : "frozen")}
              >
                <span className="legend-dot dot-yellow"></span> Muzlatilgan
              </button>
            </div>

            {/* Student Roster List */}
            <div className="passport-student-list">
              {filteredStudents.length === 0 ? (
                <div className="empty-roster">O'quvchilar topilmadi</div>
              ) : (
                filteredStudents.map((st, idx) => {
                  const isDebtor = (st.balance || 0) < 0 || st.paymentStatus === "Overdue" || st.paymentStatus === "Unpaid";
                  const dotColor = isDebtor ? "dot-red" : st.status === "Frozen" ? "dot-yellow" : "dot-green";

                  return (
                    <div 
                      key={st.id} 
                      className="roster-student-item"
                      onClick={() => setSelectedProfileStudent(st)}
                    >
                      <span className="student-index">{idx + 1}</span>
                      <span className={`status-indicator-dot ${dotColor}`}></span>
                      <span className="student-roster-name" title={st.fullName}>
                        {st.fullName}
                      </span>
                      <span className="student-roster-phone">
                        {(() => {
                          const digits = String(st.phone || "").replace(/\D/g, "");
                          if (digits.length >= 9) {
                            const last9 = digits.slice(-9);
                            return `(${last9.slice(0, 2)}) ${last9.slice(2, 5)}-${last9.slice(5, 7)}-${last9.slice(7)}`;
                          }
                          return st.phone || "(90) 599-06-00";
                        })()}
                      </span>
                      <button 
                        className="roster-item-menu"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProfileStudent(st);
                        }}
                      >
                        <HiOutlineEllipsisVertical />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LC-UP Tabbed Matrix Grid */}
        <div className="lc-right-panel">
          {/* LC-UP Nav Tabs */}
          <div className="lc-tabs-navigation">
            {LC_UP_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`lc-tab-button ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Date & Month Ribbon */}
          <div className="lc-date-ribbon">
            <div className="ribbon-year-selector">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="lc-year-dropdown"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            <div className="ribbon-months-list">
              {MONTHS_LIST.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`month-pill-btn ${selectedMonth === m.key ? "active" : ""}`}
                  onClick={() => setSelectedMonth(m.key)}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div className="ribbon-right-controls">
              <button className="ribbon-fullscreen-btn" title="To'liq ekranga yoyish">
                <HiOutlineArrowsPointingOut />
              </button>
            </div>
          </div>

          {/* ATTENDANCE MATRIX TABLE */}
          {activeTab === "attendance" && (
            <div className="lc-matrix-wrapper">
              <table className="lc-matrix-table">
                <thead>
                  <tr>
                    <th className="th-talabalar">TALABALAR</th>
                    {lessonDates.map((d, idx) => (
                      <th key={idx} className="th-date-col">
                        {d.dayStr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={lessonDates.length + 1} className="empty-matrix-msg">
                        Guruhda o'quvchilar mavjud emas
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, sIdx) => (
                      <tr key={student.id}>
                        <td className="td-student-info">
                          <span className="td-student-num">{sIdx + 1}</span>
                          <span 
                            className="td-student-name"
                            onClick={() => setSelectedProfileStudent(student)}
                          >
                            {student.fullName}
                          </span>
                        </td>

                        {lessonDates.map((d, dIdx) => {
                          const cellKey = `${student.id}_${d.fullDate}`;
                          const cell = matrixData[cellKey];
                          const status = cell?.status;

                          return (
                            <td 
                              key={dIdx} 
                              className={`td-attendance-cell ${activePickerCell === cellKey ? "picker-open" : ""} ${isLessonTimeLocked(d.fullDate) ? "cell-time-locked" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isLessonTimeLocked(d.fullDate)) {
                                  toast.error("⏱️ Ushbu dars davomati qulflangan (Dars tugaganiga 1 soatdan ko'p vaqt o'tgan). O'zgartirish uchun Adminga murojaat qiling!");
                                  return;
                                }
                                setActivePickerCell(activePickerCell === cellKey ? null : cellKey);
                              }}
                              title={`${student.fullName} — ${d.dayStr}: ${status || "Belgilanmagan (Bosing: ✅ ❌)"} ${isLessonTimeLocked(d.fullDate) ? "(Qulflangan ⏱️)" : ""}`}
                            >
                              {activePickerCell === cellKey ? (
                                <div className="inline-action-picker" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="action-btn-choice btn-choice-present"
                                    onClick={(e) => handleSelectStatus(student.id, d.fullDate, student.fullName, "Present", e)}
                                    title="Keldi"
                                  >
                                    <HiOutlineCheck className="choice-icon text-emerald" />
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn-choice btn-choice-absent"
                                    onClick={(e) => handleSelectStatus(student.id, d.fullDate, student.fullName, "Absent", e)}
                                    title="Kelmadi"
                                  >
                                    <HiOutlineXMark className="choice-icon text-rose" />
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn-choice btn-choice-excused"
                                    onClick={(e) => handleSelectStatus(student.id, d.fullDate, student.fullName, "Excused", e)}
                                    title="Sababli"
                                  >
                                    <HiOutlineFlag className="choice-icon text-amber" />
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn-choice btn-choice-clear"
                                    onClick={(e) => handleSelectStatus(student.id, d.fullDate, student.fullName, null, e)}
                                    title="Tozalash"
                                  >
                                    <span className="choice-dot">•</span>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {status === "Present" && (
                                    <div className="cell-circle circle-present">
                                      <HiOutlineCheck className="circle-icon" />
                                    </div>
                                  )}

                                  {status === "Excused" && (
                                    <div className="cell-circle circle-excused">
                                      <HiOutlineFlag className="circle-flag-green" />
                                    </div>
                                  )}

                                  {status === "Absent" && (
                                    <div className="cell-circle circle-absent">
                                      <HiOutlineFlag className="circle-flag-red" />
                                    </div>
                                  )}

                                  {status === "Trial" && (
                                    <div className="cell-circle circle-trial">
                                      <HiOutlineInformationCircle className="circle-icon" />
                                    </div>
                                  )}

                                  {!status && (
                                    <div className="cell-empty-dash">
                                      <span className="empty-dot"></span>
                                    </div>
                                  )}
                                </>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* BAHOLASH TAB */}
          {activeTab === "grades" && (
            <div className="lc-grades-wrapper">
              {/* Grades Toolbar */}
              <div className="grades-header-toolbar">
                <div className="grades-date-picker-wrap">
                  <span className="grades-toolbar-label">
                    <HiOutlineCalendarDays className="inline-icon-xs text-indigo" />
                    Baholash Dars Sanasi:
                  </span>
                  <select
                    value={selectedGradeDate || (lessonDates[0]?.fullDate || "")}
                    onChange={(e) => setSelectedGradeDate(e.target.value)}
                    className="lc-grade-date-select"
                  >
                    {lessonDates.map((d) => (
                      <option key={d.fullDate} value={d.fullDate}>
                        {d.dayStr} ({d.fullDate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <table className="lc-grades-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Talaba F.I.SH</th>
                    <th>Davomat Holati</th>
                    <th>Ball (1-10)</th>
                    <th>Uy Vazifasi</th>
                    <th>Izoh / Baholash Qaydi</th>
                    <th>Telegram Xabarnoma</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st, idx) => {
                    const activeDateStr = selectedGradeDate || (lessonDates[0]?.fullDate || "");
                    const attCell = matrixData[`${st.id}_${activeDateStr}`];
                    const isPresent = attCell?.status === "Present";
                    const isAbsent = attCell?.status === "Absent";
                    const isExcused = attCell?.status === "Excused";

                    return (
                      <tr key={st.id} className={!isPresent ? "row-student-absent" : ""}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{st.fullName}</strong>
                        </td>
                        <td>
                          {isPresent && (
                            <span className="badge-att-status badge-status-present">
                              <HiOutlineCheck className="inline-icon-xs" /> Darsda qatnashgan
                            </span>
                          )}
                          {isExcused && (
                            <span className="badge-att-status badge-status-excused">
                              <HiOutlineFlag className="inline-icon-xs" /> Sababli kelmagan
                            </span>
                          )}
                          {isAbsent && (
                            <span className="badge-att-status badge-status-absent">
                              <HiOutlineXMark className="inline-icon-xs" /> Kelmagan
                            </span>
                          )}
                          {!attCell?.status && (
                            <span className="badge-att-status badge-status-none">
                              • Belgilanmagan
                            </span>
                          )}
                        </td>
                        <td>
                          {isPresent && !isLessonTimeLocked(activeDateStr) ? (
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={gradesData[st.id]?.score || 10}
                              onChange={(e) =>
                                setGradesData((prev) => ({
                                  ...prev,
                                  [st.id]: { ...prev[st.id], score: e.target.value }
                                }))
                              }
                              className="lc-grade-input"
                            />
                          ) : isPresent && isLessonTimeLocked(activeDateStr) ? (
                            <div
                              className="locked-grade-cell"
                              onClick={() =>
                                toast.error(
                                  `⏱️ Ushbu dars baholari qulflangan (Dars tugaganiga 1 soatdan ko'p vaqt o'tgan). O'zgartirish uchun Adminga murojaat qiling.`
                                )
                              }
                              title="Dars tugaganiga 1 soatdan ko'p vaqt o'tgan (Qulflangan)"
                            >
                              <span className="badge-absent-lock" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
                                <HiOutlineLockClosed className="inline-icon-xs" /> {gradesData[st.id]?.score || 10} ball
                              </span>
                            </div>
                          ) : (
                            <div
                              className="locked-grade-cell"
                              onClick={() =>
                                toast.error(
                                  `🚨 "${st.fullName}" ushbu darsga kelmagan! Kelmagan o'quvchiga baho qo'yib bo'lmaydi.`
                                )
                              }
                              title="Darsda yo'q - baho qo'yib bo'lmaydi"
                            >
                              <span className="badge-absent-lock">
                                <HiOutlineLockClosed className="inline-icon-xs" /> Bloklangan
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <label className={`checkbox-wrap ${!isPresent || isLessonTimeLocked(activeDateStr) ? "disabled-checkbox" : ""}`}>
                            <input
                              type="checkbox"
                              disabled={!isPresent || isLessonTimeLocked(activeDateStr)}
                              checked={isPresent ? (gradesData[st.id]?.homework ?? true) : false}
                              onChange={(e) =>
                                isPresent && !isLessonTimeLocked(activeDateStr) &&
                                setGradesData((prev) => ({
                                  ...prev,
                                  [st.id]: { ...prev[st.id], homework: e.target.checked }
                                }))
                              }
                            />
                            <span>{isPresent ? "Bajarilgan" : "Qatnashmagan"}</span>
                          </label>
                        </td>
                        <td>
                          <input
                            type="text"
                            disabled={!isPresent || isLessonTimeLocked(activeDateStr)}
                            value={isPresent ? (gradesData[st.id]?.comment || "") : ""}
                            onChange={(e) =>
                              isPresent && !isLessonTimeLocked(activeDateStr) &&
                              setGradesData((prev) => ({
                                ...prev,
                                [st.id]: { ...prev[st.id], comment: e.target.value }
                              }))
                            }
                            placeholder={
                              !isPresent
                                ? "Darsda qatnashmaganligi sababli baholanmaydi"
                                : isLessonTimeLocked(activeDateStr)
                                ? "Dars qulflangan (O'zgartirib bo'lmaydi)"
                                : "Darsdagi faollik izohi..."
                            }
                            className={`lc-comment-input ${!isPresent || isLessonTimeLocked(activeDateStr) ? "disabled-input" : ""}`}
                          />
                        </td>
                        <td>
                          {isPresent && !isLessonTimeLocked(activeDateStr) ? (
                            <button
                              type="button"
                              className="btn-tg-grade"
                              onClick={() =>
                                toast.success(
                                  `📲 "${st.fullName}" ota-onasiga baho bot orqali yuborildi!`
                                )
                              }
                            >
                              <FaTelegram /> Yuborish
                            </button>
                          ) : isPresent && isLessonTimeLocked(activeDateStr) ? (
                            <span className="tg-disabled-tag">
                              <HiOutlineLockClosed className="inline-icon-xs" /> Qulflangan
                            </span>
                          ) : (
                            <span className="tg-disabled-tag">
                              <HiOutlineNoSymbol className="inline-icon-xs" /> Darsda yo'q
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* OTHER TABS (Mashqlar, Uyga vazifa, Chegirma, Reyting, Imtihonlar, Tarix, Izoh) */}
          {activeTab !== "attendance" && activeTab !== "grades" && (
            <div className="lc-empty-tab-panel">
              <HiOutlineSparkles className="empty-tab-icon" />
              <h3>{LC_UP_TABS.find((t) => t.id === activeTab)?.label} Bo'limi</h3>
              <p>Ushbu guruh uchun {LC_UP_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} ma'lumotlari to'liq sinxronizatsiya qilingan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedProfileStudent && (
        <StudentProfileModal
          student={selectedProfileStudent}
          onClose={() => setSelectedProfileStudent(null)}
        />
      )}
    </div>
  );
};

export default Attendance;
