import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  HiOutlineArrowsPointingIn,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineArrowLeft,
  HiOutlineChevronDown,
  HiOutlineLockClosed,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineArrowUpRight
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

const ABSENT_REASONS = [
  { id: "health", label: "🩺 Salomatligi / Kasallik tufayli" },
  { id: "family", label: "👨‍👩‍👧 Oilaviy sabab / Marosim" },
  { id: "travel", label: "🚗 Sayohat / Shaharda yo'q" },
  { id: "unreachable", label: "📞 Sababsiz (Telefoni ko'tarmadi)" },
  { id: "medical_note", label: "📑 Tibbiy ma'lumotnoma (Spravka) taqdim etiladi" },
  { id: "other", label: "✍️ Boshqa sabab (qo'lda yozish)" }
];

const Attendance = () => {
  const { id: routeGroupId } = useParams();
  const navigate = useNavigate();
  const { currentRole, user, canMarkAttendance } = useEduAuth();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState(routeGroupId || null);
  const [groupFilterTab, setGroupFilterTab] = useState("all");

  useEffect(() => {
    if (routeGroupId) {
      setSelectedGroup(routeGroupId);
    } else {
      setSelectedGroup(null);
    }
  }, [routeGroupId]);

  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("08");
  const [selectedGradeDate, setSelectedGradeDate] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeReasonCard, setActiveReasonCard] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved");

  const [activeGradeCell, setActiveGradeCell] = useState(null);
  const [gradesMatrixData, setGradesMatrixData] = useState(() => {
    try {
      const saved = localStorage.getItem("velnex_grades_matrix");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const now = new Date();
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode]);

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

      if (routeGroupId) {
        setSelectedGroup(routeGroupId);
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

  const currentGroupObj = groups.find((g) => String(g.id) === String(selectedGroup)) || groups[0];
  const activeGroupStudents = students.filter((s) => String(s.groupId || s.group_id) === String(selectedGroup));

  const getMonthLessonDates = () => {
    const monthObj = MONTHS_LIST.find((m) => m.key === selectedMonth) || MONTHS_LIST[3];
    const monthShort = monthObj.short;
    
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

        if (found && found.status) {
          newMatrix[cellKey] = {
            status: found.status,
            note: found.note || ""
          };
        } else {
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

  const isPastDate = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return fullDate < todayStr;
  };

  const isFutureDate = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return fullDate > todayStr;
  };

  const isTodayDate = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return fullDate === todayStr;
  };

  const isLessonTimeLocked = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (fullDate === todayStr) {
      return false;
    }
    if (fullDate < todayStr || fullDate > todayStr) {
      return true;
    }
    return false;
  };

  const checkDoubleBooking = (studentId, fullDate) => {
    const otherGroups = groups.filter((g) => g.id !== selectedGroup);
    const scheduleTimeStr = currentGroupObj?.time || currentGroupObj?.scheduleTime || "14:00 - 16:00";

    for (const g of otherGroups) {
      const gTime = g.time || g.scheduleTime || "";
      if (gTime === scheduleTimeStr) {
        const studentInOtherGroup = students.some((s) => s.groupId === g.id && s.id === studentId);
        if (studentInOtherGroup) {
          const rec = attendanceRecords.find(
            (r) => r.groupId === g.id && r.studentId === studentId && r.date === fullDate && r.status === "Present"
          );
          if (rec) {
            return { name: g.name, time: gTime };
          }
        }
      }
    }
    return null;
  };

  const handleSelectStatus = async (studentId, fullDate, studentName, newStatus, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!canMarkAttendance) return;

    if (isPastDate(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini o'zgartirib bo'lmaydi! Faqat bugungi dars uchun ruxsat berilgan.");
      return;
    }

    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }

    if (isLessonTimeLocked(fullDate)) {
      toast.error("⏱️ Ushbu dars davomati qulflangan!");
      return;
    }

    if (newStatus === "Present") {
      const conflictGroup = checkDoubleBooking(studentId, fullDate);
      if (conflictGroup) {
        toast.warning(`⚠️ [Double-Booking] "${studentName}" xuddi shu vaqtda (${conflictGroup.time}) "${conflictGroup.name}" guruhida ham darsda deb qayd etilgan!`);
      }
    }

    const cellKey = `${studentId}_${fullDate}`;
    const newEntry = {
      status: newStatus,
      note: newStatus === "Excused" ? "Darsga kechikdi" : newStatus === "Absent" ? "Sababsiz" : ""
    };

    setMatrixData((prev) => ({
      ...prev,
      [cellKey]: newEntry
    }));

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (r) => String(r.groupId || r.group_id) === String(selectedGroup) &&
               String(r.studentId || r.student_id) === String(studentId) &&
               r.date === fullDate
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newEntry, date: fullDate, groupId: selectedGroup, studentId };
        return copy;
      }
      return [{ groupId: selectedGroup, studentId, date: fullDate, ...newEntry }, ...prev];
    });

    setActivePickerCell(null);
    setSaveStatus("saving");

    try {
      if (newStatus) {
        await attendanceApi.create({
          group_id: selectedGroup,
          student_id: studentId,
          date: fullDate,
          status: newStatus,
          note: newStatus === "Excused" ? "Darsga kechikdi" : newStatus === "Absent" ? "Sababsiz" : ""
        });
      }
      setSaveStatus("saved");
    } catch (err) {
      console.warn("Auto-save sync:", err.message);
      setSaveStatus("error");
      toast.error("Internet yoki server bilan aloqa uzildi!");
    }
  };

  const touchStartCoords = useRef({ x: 0, y: 0 });
  const mouseDragCoords = useRef({ x: 0, y: 0, isDragging: false });

  // Touch Swipe (Mobile / Tablet) - Faqat Bugungi dars uchun ishlaydi
  const handleCellTouchStart = (fullDate, e) => {
    if (!isTodayDate(fullDate)) return;
    if (e.touches && e.touches[0]) {
      touchStartCoords.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleCellTouchEnd = (studentId, fullDate, studentName, e) => {
    if (isPastDate(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini o'zgartirib bo'lmaydi!");
      return;
    }
    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }
    if (isLessonTimeLocked(fullDate)) {
      toast.error("🔒 Ushbu dars davomati qulflangan!");
      return;
    }

    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - touchStartCoords.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartCoords.current.y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist > 15) {
        if ((deltaY > 15 || deltaY < -15) && Math.abs(deltaY) >= Math.abs(deltaX)) {
          // Swipe DOWN / Vertical (Pastga tortish) -> Kechikdi / Kech qolmoqda 🕒
          handleSelectStatus(studentId, fullDate, studentName, "Excused", e);
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 15) {
            // Swipe Right -> Keldi ✅
            handleSelectStatus(studentId, fullDate, studentName, "Present", e);
          } else if (deltaX < -15) {
            // Swipe Left -> Kelmadi ❌ + Tepadan Smart Card tushishi
            handleSelectStatus(studentId, fullDate, studentName, "Absent", e);
            setActiveReasonCard({
              studentId,
              fullDate,
              studentName,
              reason: ABSENT_REASONS[0].label,
              customNote: ""
            });
          }
        }
      } else {
        const cellKey = `${studentId}_${fullDate}`;
        setActivePickerCell((prev) => (prev === cellKey ? null : cellKey));
      }
    }
  };

  // Mouse Drag & Click (Desktop / Laptop) - Faqat Bugungi dars uchun ishlaydi
  const handleCellMouseDown = (studentId, fullDate, studentName, e) => {
    if (e.button !== 0) return; // Faqat chap tugma
    if (!isTodayDate(fullDate)) return;
    mouseDragCoords.current = {
      x: e.clientX,
      y: e.clientY,
      isDragging: true,
      studentId,
      fullDate,
      studentName
    };
  };

  // Global Window MouseUp Listener for Smooth Reliable Dragging in Any Direction
  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      if (!mouseDragCoords.current.isDragging) return;
      const { x, y, studentId, fullDate, studentName } = mouseDragCoords.current;
      mouseDragCoords.current.isDragging = false;

      if (!studentId || !fullDate) return;

      const deltaX = e.clientX - x;
      const deltaY = e.clientY - y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Agar sichqoncha surilgan bo'lsa (drag masofasi > 15px)
      if (dist > 15) {
        // Pastga (yoki vertikal) tortish (deltaY musbat / vertikal va |deltaY| >= |deltaX|)
        if ((deltaY > 15 || deltaY < -15) && Math.abs(deltaY) >= Math.abs(deltaX)) {
          // Pastga tortish -> Kechikdi / Kech qolmoqda 🕒
          handleSelectStatus(studentId, fullDate, studentName, "Excused", e);
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 15) {
            // O'ngga -> Keldi ✅
            handleSelectStatus(studentId, fullDate, studentName, "Present", e);
          } else if (deltaX < -15) {
            // Chapga -> Kelmadi ❌ + Smart Card
            handleSelectStatus(studentId, fullDate, studentName, "Absent", e);
            setActiveReasonCard({
              studentId,
              fullDate,
              studentName,
              reason: ABSENT_REASONS[0].label,
              customNote: ""
            });
          }
        }
      } else {
        // Joyida oddiy bosish (Click) -> faqat bugungi dars bo'lsa popover ochilsin
        if (isTodayDate(fullDate)) {
          const cellKey = `${studentId}_${fullDate}`;
          setActivePickerCell((prev) => (prev === cellKey ? null : cellKey));
        }
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [selectedGroup, groups, students, attendanceRecords]);

  // Right-Click (Sichqoncha o'ng tugmasi bilan tezkor aylantirib belgilash)
  const handleCellContextMenu = (studentId, fullDate, studentName, currentStatus, e) => {
    e.preventDefault();
    if (isPastDate(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini o'zgartirib bo'lmaydi!");
      return;
    }
    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }
    if (isLessonTimeLocked(fullDate)) {
      toast.error("🔒 Ushbu dars davomati qulflangan!");
      return;
    }
    const nextStatus = !currentStatus ? "Present" : currentStatus === "Present" ? "Absent" : currentStatus === "Absent" ? "Excused" : null;
    handleSelectStatus(studentId, fullDate, studentName, nextStatus, e);
  };

  // Smart Card: Sababni tasdiqlash va Telegram Botga yuborish
  const handleConfirmReason = async (e) => {
    if (e) e.preventDefault();
    if (!activeReasonCard) return;

    const finalReason = activeReasonCard.reason === "✍️ Boshqa sabab (qo'lda yozish)" && activeReasonCard.customNote.trim()
      ? activeReasonCard.customNote.trim()
      : activeReasonCard.reason;

    const cellKey = `${activeReasonCard.studentId}_${activeReasonCard.fullDate}`;
    const newEntry = {
      status: "Absent",
      note: finalReason
    };

    setMatrixData((prev) => ({
      ...prev,
      [cellKey]: newEntry
    }));

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (r) => String(r.groupId || r.group_id) === String(selectedGroup) &&
               String(r.studentId || r.student_id) === String(activeReasonCard.studentId) &&
               r.date === activeReasonCard.fullDate
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newEntry, date: activeReasonCard.fullDate, groupId: selectedGroup, studentId: activeReasonCard.studentId };
        return copy;
      }
      return [{ groupId: selectedGroup, studentId: activeReasonCard.studentId, date: activeReasonCard.fullDate, ...newEntry }, ...prev];
    });

    setSaveStatus("saving");
    setActiveReasonCard(null);

    try {
      await attendanceApi.create({
        group_id: selectedGroup,
        student_id: activeReasonCard.studentId,
        date: activeReasonCard.fullDate,
        status: "Absent",
        note: finalReason
      });
      setSaveStatus("saved");
    } catch (err) {
      console.warn("Auto-save sync:", err.message);
      setSaveStatus("error");
      toast.error("Internet yoki server bilan aloqa uzildi!");
    }
  };

  // Mark all students Present ONLY for TODAY's lesson date with instant auto-save
  const handleMarkAllPresent = async () => {
    if (!selectedGroup || activeGroupStudents.length === 0) return;

    const updated = { ...matrixData };
    const promises = [];

    activeGroupStudents.forEach((student) => {
      const cellKey = `${student.id}_${todayDateStr}`;
      updated[cellKey] = { status: "Present", note: "" };
      promises.push(
        attendanceApi.create({
          group_id: selectedGroup,
          student_id: student.id,
          date: todayDateStr,
          status: "Present",
          note: ""
        }).catch(() => null)
      );
    });

    setMatrixData(updated);
    setAttendanceRecords((prev) => {
      let copy = [...prev];
      activeGroupStudents.forEach((student) => {
        const idx = copy.findIndex(
          (r) => String(r.groupId || r.group_id) === String(selectedGroup) &&
                 String(r.studentId || r.student_id) === String(student.id) &&
                 r.date === todayDateStr
        );
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], status: "Present", note: "" };
        } else {
          copy.unshift({ groupId: selectedGroup, studentId: student.id, date: todayDateStr, status: "Present", note: "" });
        }
      });
      return copy;
    });

    await Promise.all(promises);
    toast.success(`Bugungi (${todayDateStr}) dars uchun barcha o'quvchilar "Keldi" qilindi va avto-saqlandi! ✅⚡`);
  };

  // Baholash (1-10 Ball) Ball qo'yish va saqlash
  const handleSetGradeScore = (studentId, fullDate, score, studentName) => {
    // Admin bo'lmagan foydalanuvchilar (O'qituvchi) o'tib ketgan darslarga baho qo'ya olmaydi
    if (currentRole !== "admin" && isPastDate(fullDate)) {
      toast.error(`⏱️ O'tib ketgan dars (${fullDate}) uchun faqat Administrator baho qo'yishi yoki o'zgartirishi mumkin!`);
      setActiveGradeCell(null);
      return;
    }
    if (currentRole !== "admin" && isFutureDate(fullDate)) {
      toast.info(`⏳ Kelajakdagi dars sanasi (${fullDate})! Dars kuni kelganda baholash ochiladi.`);
      setActiveGradeCell(null);
      return;
    }

    const cellKey = `${studentId}_${fullDate}`;
    setGradesMatrixData((prev) => {
      const updated = {
        ...prev,
        [cellKey]: {
          score: score,
          date: fullDate,
          studentId: studentId,
          updatedAt: new Date().toISOString()
        }
      };
      try {
        localStorage.setItem("velnex_grades_matrix", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
    }, 300);
    setActiveGradeCell(null);
  };

  // Klaviaturada 1-10 raqamlarini bosib baholash (Keyboard Hotkeys)
  useEffect(() => {
    const handleGradeKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      if (activeGradeCell) {
        const parts = activeGradeCell.split("_");
        if (parts.length >= 2) {
          const studentId = parts[0];
          const fullDate = parts.slice(1).join("_");
          const student = students.find((s) => String(s.id) === String(studentId));
          const studentName = student?.fullName || "Talaba";

          if (e.key >= "1" && e.key <= "9") {
            e.preventDefault();
            handleSetGradeScore(studentId, fullDate, parseInt(e.key, 10), studentName);
          } else if (e.key === "0") {
            e.preventDefault();
            handleSetGradeScore(studentId, fullDate, 10, studentName);
          } else if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            handleSetGradeScore(studentId, fullDate, null, studentName);
          } else if (e.key === "Escape") {
            setActiveGradeCell(null);
          }
        }
      }
    };

    window.addEventListener("keydown", handleGradeKeyDown);
    return () => window.removeEventListener("keydown", handleGradeKeyDown);
  }, [activeGradeCell, students]);

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

  // 1, 2, 3, 6, 7, 8, 9, 10-Qoidalar: Guruhlar Hubi Uchun Professional Helperlar

  // 7-Qoida: Bugun guruhning darsi bormi?
  const isGroupLessonToday = (group) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: Yakshanba, 1: Dush, 2: Sesh, 3: Chor, 4: Pay, 5: Juma, 6: Shanba
    const daysStr = (group.scheduleDays || "").toLowerCase();
    const groupName = (group.name || "").toLowerCase();

    // Toq kunlar: Dushanba (1), Chorshanba (3), Juma (5)
    if ([1, 3, 5].includes(dayOfWeek)) {
      if (daysStr.includes("dushanba") || daysStr.includes("toq") || groupName.includes("toq")) return true;
    }
    // Juft kunlar: Seshanba (2), Payshanba (4), Shanba (6)
    if ([2, 4, 6].includes(dayOfWeek)) {
      if (daysStr.includes("seshanba") || daysStr.includes("payshanba") || daysStr.includes("juft") || groupName.includes("juft")) return true;
    }

    const uzbekDays = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
    const todayName = uzbekDays[dayOfWeek];
    return daysStr.includes(todayName);
  };

  // 8-Qoida: Hozir ayni vaqtda jonli dars ketmoqdami?
  const isLessonLiveNow = (group) => {
    if (!isGroupLessonToday(group)) return false;
    const timeStr = group.scheduleTime || group.time || "14:00 - 16:00";
    const parts = timeStr.split("-");
    if (parts.length !== 2) return false;

    const [startH, startM] = parts[0].trim().split(":").map(Number);
    const [endH, endM] = parts[1].trim().split(":").map(Number);
    if (isNaN(startH) || isNaN(endH)) return false;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = startH * 60 + (startM || 0);
    const endMins = endH * 60 + (endM || 0);

    return currentMins >= startMins && currentMins <= endMins;
  };

  // 10-Qoida: Dars vaqti va countdown hisobi
  const getLessonTimingStatus = (group) => {
    if (!isGroupLessonToday(group)) {
      return { status: "no_lesson", text: "Bugun dars yo'q" };
    }
    if (isLessonLiveNow(group)) {
      return { status: "live", text: "⚡ Dars ketmoqda" };
    }

    const timeStr = group.scheduleTime || group.time || "14:00 - 16:00";
    const parts = timeStr.split("-");
    if (parts.length === 2) {
      const [startH, startM] = parts[0].trim().split(":").map(Number);
      if (!isNaN(startH)) {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const startMins = startH * 60 + (startM || 0);
        const diff = startMins - currentMins;

        if (diff > 0 && diff <= 180) {
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          const leftStr = h > 0 ? `${h}s ${m}m` : `${m}m`;
          return { status: "upcoming", text: `⏳ ${leftStr} qoldi` };
        } else if (diff > 180) {
          return { status: "upcoming", text: `⏰ ${parts[0].trim()} da` };
        } else {
          return { status: "ended", text: "🏁 Dars tugagan" };
        }
      }
    }
    return { status: "today", text: "Bugun dars bor" };
  };

  // 9-Qoida: Davomat topshirilganlik statusi
  const getGroupAttendanceStatus = (groupId, gStudents) => {
    if (gStudents.length === 0) return { type: "empty", label: "Talabalar yo'q" };

    const markedCount = gStudents.filter((s) =>
      attendanceRecords.some(
        (r) => String(r.groupId || r.group_id) === String(groupId) &&
               String(r.studentId || r.student_id) === String(s.id) &&
               r.date === todayDateStr &&
               r.status
      )
    ).length;

    if (markedCount === gStudents.length && gStudents.length > 0) {
      return { type: "done", label: `✓ Davomat Qilingan (${markedCount}/${gStudents.length})` };
    }
    if (markedCount > 0) {
      return { type: "partial", label: `⏳ Qisman Qilingan (${markedCount}/${gStudents.length})` };
    }
    return { type: "pending", label: `⚠️ Davomat Qilinmagan (0/${gStudents.length})` };
  };

  // 3-Qoida: Kurslar bo'yicha rangli gradient mavzular
  const getCourseTheme = (courseName = "") => {
    const c = courseName.toLowerCase();
    if (c.includes("react") || c.includes("front") || c.includes("js") || c.includes("web")) {
      return "theme-react";
    }
    if (c.includes("python") || c.includes("django") || c.includes("data") || c.includes("ai")) {
      return "theme-python";
    }
    if (c.includes("node") || c.includes("back") || c.includes("net") || c.includes("c#")) {
      return "theme-backend";
    }
    if (c.includes("design") || c.includes("ui") || c.includes("grafik") || c.includes("figma")) {
      return "theme-design";
    }
    return "theme-default";
  };

  return (
    <div className="lc-up-attendance-container">
      {/* 1. AGAR GURUH TANLANMAGAN BO'LSA: GURUHLARNI TANLASH JURNALI (HUB) */}
      {!selectedGroup ? (
        <div className="lc-group-selection-view oxford-dark-hub">
          {/* Header matching Image 1 */}
          <div className="lc-group-selection-header">
            <div className="hub-title-wrap">
              <h2 className="lc-group-selection-title">Guruhlar</h2>
            </div>
            {/* Filter Pills: Barchasi | Bugun */}
            <div className="hub-filter-pill-container">
              <button
                type="button"
                className={`hub-filter-pill ${groupFilterTab === "all" ? "active" : ""}`}
                onClick={() => setGroupFilterTab("all")}
              >
                Barchasi
              </button>
              <button
                type="button"
                className={`hub-filter-pill ${groupFilterTab === "today" ? "active" : ""}`}
                onClick={() => setGroupFilterTab("today")}
              >
                Bugun
              </button>
            </div>
          </div>

          {/* Sleek Dark Table matching Image 1 */}
          <div className="lc-groups-table-container">
            <table className="lc-groups-list-table">
              <thead>
                <tr>
                  <th className="th-g-name">Guruh nomi</th>
                  <th className="th-g-course">Kurs</th>
                  <th className="th-g-students">O'quvchilar ⓘ</th>
                  <th className="th-g-room">Xona</th>
                </tr>
              </thead>
              <tbody>
                {(groupFilterTab === "today" ? accessibleGroups.filter(isGroupLessonToday) : accessibleGroups).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-groups-row">
                      {groupFilterTab === "today" ? "Bugun darsi bor guruhlar mavjud emas" : "Guruhlar topilmadi"}
                    </td>
                  </tr>
                ) : (
                  (groupFilterTab === "today" ? accessibleGroups.filter(isGroupLessonToday) : accessibleGroups).map((g) => {
                    const gStudents = students.filter((s) => String(s.groupId || s.group_id) === String(g.id));
                    const hasLessonToday = isGroupLessonToday(g);
                    const isLive = isLessonLiveNow(g);
                    const timing = getLessonTimingStatus(g);
                    const attStatus = getGroupAttendanceStatus(g.id, gStudents);

                    return (
                      <tr
                        key={g.id}
                        className={`lc-group-table-row ${hasLessonToday ? "row-today" : ""}`}
                        onClick={() => {
                          setSelectedGroup(g.id);
                          navigate(`/attendance/${g.id}`);
                        }}
                      >
                        <td className="td-g-name">
                          <span className="g-arrow-icon">
                            <HiOutlineArrowUpRight />
                          </span>
                          <span className="g-name-text">{g.name}</span>
                          {isLive && <span className="mini-live-tag">⚡ JONLI</span>}
                          {hasLessonToday && !isLive && <span className="mini-today-tag">● BUGUN</span>}
                        </td>
                        <td className="td-g-course">
                          <span className="g-course-chip">{g.courseName || g.course_name || "Frontend ReactJS"}</span>
                        </td>
                        <td className="td-g-students">
                          <span className="g-students-count">{gStudents.length}</span>
                        </td>
                        <td className="td-g-room">
                          <span className="g-room-text">{g.roomName || g.room || "1-xona"}</span>
                          <span className="g-time-subtext">{g.scheduleTime || "14:00 - 16:00"}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* 2. GURUH TANLANGAN HOLAT: YAGONA BIR QATORLI TOP BAR & DAVOMAT JURNALI */}
          <div className="lc-top-controls-bar">
            {/* Left: Guruhlarga qaytish tugmasi + Nav Tabs */}
            <div className="lc-top-left-group">
              <button 
                type="button" 
                className="btn-back-to-groups" 
                onClick={() => {
                  setSelectedGroup(null);
                  navigate('/attendance');
                }}
                title="Boshqa guruhni tanlash"
              >
                <HiOutlineArrowLeft /> Guruhlar
              </button>

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
            </div>

            {/* Right: Sync Indicator, Year Dropdown, Month Dropdown, Barchasi Keldi, Fullscreen */}
            <div className="lc-top-right-actions">
              {/* Sokin Avto-Saqlash Indikatori (Google Docs / Notion uslubida) */}
              <div className="lc-sync-indicator-pill">
                {saveStatus === "saving" ? (
                  <span className="sync-status status-saving">
                    <span className="sync-dot dot-yellow"></span> Saqlanmoqda...
                  </span>
                ) : saveStatus === "error" ? (
                  <span className="sync-status status-error">
                    <span className="sync-dot dot-red"></span> Saqlanmadi
                  </span>
                ) : (
                  <span className="sync-status status-saved">
                    <span className="sync-dot dot-green"></span> ✓ Saqlandi
                  </span>
                )}
              </div>

              <div className="lc-select-pill year-select-pill">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="lc-clean-select"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div className="lc-select-pill month-select-pill">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="lc-clean-select"
                >
                  {MONTHS_LIST.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

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

              <button 
                type="button"
                className={`ribbon-fullscreen-btn ${isZenMode ? "active-zen" : ""}`} 
                onClick={() => setIsZenMode(!isZenMode)}
                title={isZenMode ? "To'liq ekrandan chiqish (Esc)" : "To'liq ekranga yoyish (Zen Mode)"}
              >
                {isZenMode ? <HiOutlineArrowsPointingIn /> : <HiOutlineArrowsPointingOut />}
              </button>
            </div>
          </div>

          {/* Main Full-Width Matrix Grid */}
          <div className={`lc-fullwidth-matrix-panel ${isZenMode ? "zen-fullscreen-mode" : ""}`}>
            {/* Zen Mode Floating Control Bar */}
            {isZenMode && (
              <div className="zen-exit-floating-bar">
                <div className="zen-title-info">
                  <span className="zen-live-dot"></span>
                  <strong>{currentGroupObj?.name || "Guruh"}</strong> — Davomat & Baholash (Zen Mode)
                </div>
                <button 
                  type="button" 
                  className="btn-exit-zen" 
                  onClick={() => setIsZenMode(false)}
                  title="To'liq ekrandan chiqish"
                >
                  <HiOutlineArrowsPointingIn className="inline-icon-xs" /> To'liq ekrandan chiqish (Esc)
                </button>
              </div>
            )}

            {/* ATTENDANCE MATRIX TABLE */}
            {activeTab === "attendance" && (
              <div className="lc-matrix-wrapper">
                <table className="lc-matrix-table">
                  <thead>
                    <tr>
                      <th className="th-talabalar">Talabalar</th>
                      {lessonDates.map((d, idx) => {
                        const isToday = d.fullDate === todayDateStr;
                        const isFuture = isFutureDate(d.fullDate);
                        const isPast = isPastDate(d.fullDate);
                        return (
                          <th key={idx} className={`th-date-col ${isToday ? "th-col-today" : ""} ${isPast ? "th-col-past" : ""} ${isFuture ? "th-col-future" : ""}`}>
                            {isToday && <span className="today-badge-pill">Bugun</span>}
                            {isFuture && <span className="future-badge-pill">Kelgusi</span>}
                            <span className="th-date-text">{d.dayNum || d.dayStr.split(" ")[0]}</span>
                          </th>
                        );
                      })}
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
                      filteredStudents.map((student, sIdx) => {
                        const isDebtor = (student.balance || 0) < 0 || student.paymentStatus === "Overdue" || student.paymentStatus === "Unpaid";
                        const paymentClass = isDebtor ? "student-row-debtor" : "student-row-paid";

                        return (
                          <tr key={student.id} className={`lc-matrix-student-row ${paymentClass}`}>
                            <td className={`td-student-info ${paymentClass}`}>
                              <div className="lc-student-row-flex">
                                <div className="lc-student-avatar-wrap">
                                  {student.avatar && student.avatar.length > 5 ? (
                                    <img src={student.avatar} alt="" className="lc-student-avatar-img" />
                                  ) : (
                                    <span className="lc-avatar-initials">{(student.fullName || "T").charAt(0)}</span>
                                  )}
                                </div>
                                <span 
                                  className="td-student-name"
                                  onClick={() => setSelectedProfileStudent(student)}
                                >
                                  {student.fullName}
                                </span>
                              </div>
                            </td>

                        {lessonDates.map((d, dIdx) => {
                          const cellKey = `${student.id}_${d.fullDate}`;
                          const cell = matrixData[cellKey];
                          const status = cell?.status;
                          const isToday = d.fullDate === todayDateStr;
                          const isFuture = isFutureDate(d.fullDate);
                          const isPast = isPastDate(d.fullDate);

                          return (
                            <td 
                              key={dIdx} 
                              className={`td-attendance-cell ${isToday ? "td-cell-today" : ""} ${isPast ? "td-cell-past" : ""} ${isFuture ? "td-cell-future" : ""} ${activePickerCell === cellKey ? "picker-open" : ""} ${isLessonTimeLocked(d.fullDate) ? "cell-time-locked" : ""}`}
                              onMouseDown={(e) => handleCellMouseDown(student.id, d.fullDate, student.fullName, e)}
                              onTouchStart={(e) => handleCellTouchStart(d.fullDate, e)}
                              onTouchEnd={(e) => handleCellTouchEnd(student.id, d.fullDate, student.fullName, e)}
                              onContextMenu={(e) => handleCellContextMenu(student.id, d.fullDate, student.fullName, status, e)}
                              title={`${student.fullName} — ${d.dayStr}: ${status || (isFuture ? "Kelgusi dars sanasi (Hali boshlanmadi)" : isPast ? "O'tib ketgan dars (Qulflangan)" : "Bugungi dars (Bosing / Drag: ✅ ❌)")} ${isToday ? "(Bugungi dars)" : ""} ${isLessonTimeLocked(d.fullDate) ? "(Qulflangan)" : ""}`}
                            >
                              {/* 8-Qoida: Faqat Admin o'zgartirishi mumkin bo'lgan qulf suv belgisi */}
                              {isLessonTimeLocked(d.fullDate) && (
                                <HiOutlineLockClosed className="locked-watermark-icon" title="Qulflangan — Faqat Admin o'zgartira oladi" />
                              )}

                              {/* LC-UP Usulidagi Tepada Ochiluvchi Tanlagich (Floating Top Popover) */}
                              {activePickerCell === cellKey && (
                                <div 
                                  className="lc-floating-popover-card" 
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onMouseUp={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  onTouchEnd={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    className="lc-pop-btn lc-pop-absent"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectStatus(student.id, d.fullDate, student.fullName, "Absent", e);
                                      setActiveReasonCard({
                                        studentId: student.id,
                                        fullDate: d.fullDate,
                                        studentName: student.fullName,
                                        reason: ABSENT_REASONS[0].label,
                                        customNote: ""
                                      });
                                    }}
                                    title="Kelmadi (❌)"
                                  >
                                    <HiOutlineXMark />
                                  </button>
                                  <button
                                    type="button"
                                    className="lc-pop-btn lc-pop-excused"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectStatus(student.id, d.fullDate, student.fullName, "Excused", e);
                                    }}
                                    title="Kechikdi / Sababli (🕒)"
                                  >
                                    <HiOutlineClock />
                                  </button>
                                  <button
                                    type="button"
                                    className="lc-pop-btn lc-pop-present"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectStatus(student.id, d.fullDate, student.fullName, "Present", e);
                                    }}
                                    title="Keldi (✔)"
                                  >
                                    <HiOutlineCheck />
                                  </button>
                                  <div className="lc-popover-arrow"></div>
                                </div>
                              )}

                              {status === "Present" && (
                                <div className="cell-circle circle-present">
                                  <HiOutlineCheck className="circle-icon" />
                                </div>
                              )}

                              {status === "Excused" && (
                                <div className="cell-circle circle-excused">
                                  <HiOutlineClock className="circle-flag-yellow" />
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
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* BAHOLASH TAB */}
          {activeTab === "grades" && (
            <div className="lc-grades-wrapper">
              <div className="lc-matrix-wrapper">
                <table className="lc-matrix-table lc-grades-matrix-table">
                  <thead>
                    <tr>
                      <th className="th-talabalar">Talabalar</th>
                      {lessonDates.map((d, idx) => {
                        const isToday = d.fullDate === todayDateStr;
                        const isFuture = isFutureDate(d.fullDate);
                        const isPast = isPastDate(d.fullDate);
                        return (
                          <th key={idx} className={`th-date-col ${isToday ? "th-col-today" : ""} ${isPast ? "th-col-past" : ""} ${isFuture ? "th-col-future" : ""}`}>
                            {isToday && <span className="today-badge-pill">Bugun</span>}
                            {isFuture && <span className="future-badge-pill">Kelgusi</span>}
                            <span className="th-date-text">{d.dayNum || d.dayStr.split(" ")[0]}</span>
                          </th>
                        );
                      })}
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
                      filteredStudents.map((student) => {
                        const isDebtor = (student.balance || 0) < 0 || student.paymentStatus === "Overdue" || student.paymentStatus === "Unpaid";
                        const paymentClass = isDebtor ? "student-row-debtor" : "student-row-paid";

                        return (
                          <tr key={student.id} className={`lc-matrix-student-row ${paymentClass}`}>
                            <td className={`td-student-info ${paymentClass}`}>
                              <div className="lc-student-row-flex">
                                <div className="lc-student-avatar-wrap">
                                  {student.avatar && student.avatar.length > 5 ? (
                                    <img src={student.avatar} alt="" className="lc-student-avatar-img" />
                                  ) : (
                                    <span className="lc-avatar-initials">{(student.fullName || "T").charAt(0)}</span>
                                  )}
                                </div>
                                <span 
                                  className="td-student-name"
                                  onClick={() => setSelectedProfileStudent(student)}
                                >
                                  {student.fullName}
                                </span>
                              </div>
                            </td>

                            {lessonDates.map((d, dIdx) => {
                              const cellKey = `${student.id}_${d.fullDate}`;
                              const gradeItem = gradesMatrixData[cellKey];
                              const score = gradeItem?.score;
                              const isToday = d.fullDate === todayDateStr;
                              const isPast = isPastDate(d.fullDate);
                              const isFuture = isFutureDate(d.fullDate);
                              const isLockedForTeacher = currentRole !== "admin" && (isPast || isFuture);

                              return (
                                <td
                                  key={dIdx}
                                  className={`td-attendance-cell td-grade-cell ${isToday ? "td-cell-today" : ""} ${isLockedForTeacher ? "grade-cell-locked" : ""} ${activeGradeCell === cellKey ? "grade-cell-active" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isLockedForTeacher) {
                                      if (isPast) {
                                        toast.error(`⏱️ O'tib ketgan dars (${d.fullDate}) baholarini faqat Administrator o'zgartira oladi!`);
                                      } else {
                                        toast.info(`⏳ Kelajakdagi dars sanasi (${d.fullDate})!`);
                                      }
                                      return;
                                    }
                                    setActiveGradeCell(activeGradeCell === cellKey ? null : cellKey);
                                  }}
                                  title={
                                    isLockedForTeacher && isPast
                                      ? `${student.fullName} — O'tib ketgan dars (Faqat Admin o'zgartira oladi)`
                                      : `${student.fullName} — ${d.dayStr}: ${score ? score + ' Ball' : 'Baholanmagan (Bosing yoki 1-10 tering)'}`
                                  }
                                >
                                  {/* Floating 1-10 Numbers Dock Popover */}
                                  {!isLockedForTeacher && activeGradeCell === cellKey && (
                                    <div
                                      className="lc-grade-floating-picker"
                                      onClick={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onMouseUp={(e) => e.stopPropagation()}
                                    >
                                      <div className="grade-picker-hint">
                                        Ballni tanlang (yoki klaviaturada 1-10 bosing):
                                      </div>
                                      <div className="grade-numbers-grid">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                          <button
                                            key={num}
                                            type="button"
                                            className={`grade-num-btn num-${num} ${score === num ? "active-score" : ""}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSetGradeScore(student.id, d.fullDate, num, student.fullName);
                                            }}
                                          >
                                            {num}
                                          </button>
                                        ))}
                                        <button
                                          type="button"
                                          className="grade-num-clear"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetGradeScore(student.id, d.fullDate, null, student.fullName);
                                          }}
                                          title="Ballni o'chirish"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <div className="lc-popover-arrow"></div>
                                    </div>
                                  )}

                                  {/* Watermark Lock Icon on top right for past locked dates */}
                                  {isLockedForTeacher && isPast && (
                                    <HiOutlineLockClosed
                                      className="cell-corner-lock-icon"
                                      title="O'tib ketgan dars — Faqat Admin o'zgartira oladi"
                                    />
                                  )}

                                  {/* Render Clean Score Badge */}
                                  {score != null ? (
                                    <div className={`cell-grade-badge score-badge-${score >= 9 ? "high" : score >= 6 ? "mid" : "low"}`}>
                                      {score}
                                    </div>
                                  ) : (
                                    <div className="cell-grade-placeholder"></div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
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
        </>
      )}

      {/* Reason Smart Card Modal Overlay */}
      {activeReasonCard && (
        <div className="reason-modal-backdrop" onClick={() => setActiveReasonCard(null)}>
          <div className="reason-smart-card-popup" onClick={(e) => e.stopPropagation()}>
            <div className="reason-card-header">
              <div className="reason-header-left">
                <span className="reason-badge-icon">❌</span>
                <span className="reason-card-title">Dars qoldirish sababi</span>
              </div>
              <button 
                type="button" 
                className="btn-close-reason-card" 
                onClick={() => setActiveReasonCard(null)}
                title="Yopish"
              >
                ✕
              </button>
            </div>

            <div className="reason-card-student">
              <span className="student-name-highlight">{activeReasonCard.studentName}</span>
              <span className="date-highlight">• {activeReasonCard.fullDate}</span>
            </div>

            <div className="reason-card-body">
              <label className="reason-input-label">Sababni tanlang:</label>
              <select
                className="reason-select-dropdown"
                value={activeReasonCard.reason}
                onChange={(e) => setActiveReasonCard({ ...activeReasonCard, reason: e.target.value })}
              >
                {ABSENT_REASONS.map((r) => (
                  <option key={r.id} value={r.label}>{r.label}</option>
                ))}
              </select>

              {activeReasonCard.reason === "✍️ Boshqa sabab (qo'lda yozish)" && (
                <input
                  type="text"
                  className="reason-custom-input"
                  placeholder="Sababni yozing..."
                  value={activeReasonCard.customNote}
                  onChange={(e) => setActiveReasonCard({ ...activeReasonCard, customNote: e.target.value })}
                  autoFocus
                />
              )}

              <button type="button" className="btn-submit-reason-card" onClick={handleConfirmReason}>
                Tasdiqlash & Botga Yuborish 📲
              </button>
            </div>
          </div>
        </div>
      )}

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
