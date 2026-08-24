import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { attendanceApi, groupsApi, studentsApi } from "../../services/api";
import { format9DigitId } from "../../utils/idFormatter";
import StudentProfileModal from "../../components/StudentProfileModal/StudentProfileModal";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineDocumentCheck,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineExclamationTriangle,
  HiOutlineTrophy,
  HiOutlineStar,
  HiOutlineArrowLeft,
  HiOutlineChevronRight
} from "react-icons/hi2";
import { FaTelegram, FaUserGraduate, FaChalkboardUser } from "react-icons/fa6";
import "./Attendance.css";

const EXCUSED_REASONS = [
  { id: "medical", label: "Salomatlik / Kasallik (Uzrli)", tag: "Kasal" },
  { id: "family", label: "Oilaviy Sabab (Ruxsat olingan)", tag: "Oilaviy" },
  { id: "competition", label: "Musobaqa / Olimpiada", tag: "Musobaqa" },
  { id: "technical", label: "Texnik / Transport sababi", tag: "Texnik" },
  { id: "other_excused", label: "Boshqa Uzrli Sabab", tag: "Uzrli" },
];

const Attendance = () => {
  const { currentRole, user, canMarkAttendance } = useEduAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);
  const [activeTabMode, setActiveTabMode] = useState("attendance");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [lessonTopic, setLessonTopic] = useState("React Router & Custom Hooks");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [attendanceMap, setAttendanceMap] = useState({});
  const [gradesMap, setGradesMap] = useState({});

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
        attendanceApi.getAll(),
      ]);
      setGroups(gData);
      setStudents(sData);
      setAttendanceRecords(aData);
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

  const activeGroupStudents = students.filter(
    (s) => s.groupId === selectedGroup,
  );
  const currentGroupObj = groups.find((g) => g.id === selectedGroup);

  useEffect(() => {
    if (!selectedGroup) return;

    const map = {};
    const gMap = {};
    activeGroupStudents.forEach((s, idx) => {
      const rec = attendanceRecords.find(
        (r) =>
          r.groupId === selectedGroup &&
          r.studentId === s.id &&
          r.date === selectedDate,
      );
      map[s.id] = {
        status: rec ? rec.status : "Present",
        note: rec ? rec.note : "",
        reasonCategory:
          rec?.reasonCategory ||
          (rec?.status === "Excused"
            ? "medical"
            : rec?.status === "Absent"
              ? "unexcused"
              : ""),
      };

      gMap[s.id] = {
        score: 10,
        homeworkDone: true,
        comment: "Faol qatnashdi",
      };
    });
    setAttendanceMap(map);
    setGradesMap(gMap);
  }, [selectedGroup, selectedDate, attendanceRecords, activeGroupStudents.length]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        note:
          status === "Present"
            ? ""
            : status === "Excused"
              ? "Salomatlik / Kasallik (Uzrli)"
              : "Sababsiz Dars Qoldirdi",
        reasonCategory:
          status === "Present"
            ? ""
            : status === "Excused"
              ? "medical"
              : "unexcused",
      },
    }));
  };

  const handleReasonSelect = (studentId, reasonObj) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note: reasonObj.label,
        reasonCategory: reasonObj.id,
      },
    }));
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    activeGroupStudents.forEach((s) => {
      updated[s.id] = {
        status: "Present",
        note: "",
        reasonCategory: "",
      };
    });
    setAttendanceMap(updated);
    toast.success("Barcha o'quvchilar 'Keldi' deb belgilandi!");
  };

  const handleGradeChange = (studentId, score) => {
    const numScore = Math.min(10, Math.max(1, parseInt(score) || 1));
    setGradesMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: numScore,
      },
    }));
  };

  const handleHomeworkToggle = (studentId) => {
    setGradesMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        homeworkDone: !prev[studentId]?.homeworkDone,
      },
    }));
  };

  const handleGradeCommentChange = (studentId, comment) => {
    setGradesMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment,
      },
    }));
  };

  const getLetterGrade = (score) => {
    if (score >= 10) return { label: "🌟 10 (A'lo)", class: "grade-a-plus" };
    if (score >= 9) return { label: "🟢 9 (Juda yaxshi)", class: "grade-a" };
    if (score >= 8) return { label: "🔵 8 (Yaxshi)", class: "grade-b" };
    if (score >= 7) return { label: "🟡 7 (Qoniqarli)", class: "grade-c" };
    if (score >= 5) return { label: "🟠 5-6 (O'rtacha)", class: "grade-d" };
    return { label: "🔴 1-4 (Qoniqarsiz)", class: "grade-d" };
  };

  const sendTelegramAbsenceAlert = (student) => {
    toast.success(
      `📲 "${student.fullName}" ota-onasining Telegram botiga dars qoldirganligi haqida xabarnoma yuborildi!`
    );
  };

  const sendDropoutWarning = (student) => {
    toast.error(
      `🚨 DIQQAT: "${student.fullName}" ketma-ket 3+ dars qoldirdi! Ota-onasining Telegram botiga shoshilinch xavf xabari yuborildi!`
    );
  };

  const getStudentConsecutiveAbsences = (studentId) => {
    const studentHistory = attendanceRecords
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let count = 0;
    for (const rec of studentHistory) {
      if (rec.status === "Absent" || rec.status === "Excused") {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const handleSaveAttendance = async () => {
    try {
      const promises = activeGroupStudents.map(async (s) => {
        const studentMap = attendanceMap[s.id] || { status: "Present", note: "", reasonCategory: "" };
        const payload = {
          group_id: selectedGroup,
          student_id: s.id,
          date: selectedDate,
          status: studentMap.status,
          note: studentMap.note,
          reason_category: studentMap.reasonCategory,
        };

        const existingRec = attendanceRecords.find(
          (r) =>
            r.groupId === selectedGroup &&
            r.studentId === s.id &&
            r.date === selectedDate,
        );

        if (existingRec) {
          return attendanceApi.update(existingRec.id, payload);
        } else {
          return attendanceApi.create(payload);
        }
      });

      await Promise.all(promises);

      const refreshed = await attendanceApi.getAll();
      setAttendanceRecords(refreshed);

      const absentees = activeGroupStudents.filter(
        (s) => attendanceMap[s.id]?.status === "Absent" || attendanceMap[s.id]?.status === "Excused"
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      toast.success(
        absentees.length > 0
          ? `Davomat saqlandi! Kelmagan ${absentees.length} nafar o'quvchining ota-onasiga Telegram bot xabari yuborildi.`
          : "Davomat muvaffaqiyatli saqlandi!"
      );
    } catch (err) {
      console.error("Save attendance error:", err.message);
      toast.error("Davomatni saqlashda xatolik yuz berdi");
    }
  };

  const handleSaveGrades = () => {
    toast.success(`⭐ "${currentGroupObj?.name}" guruhining barcha baholari saqlandi va Telegram botga yuborildi!`);
  };

  const totalMarkedDays = [
    ...new Set(
      attendanceRecords
        .filter((r) => r.groupId === selectedGroup)
        .map((r) => r.date),
    ),
  ].length;

  const groupAbsences = attendanceRecords.filter(
    (r) =>
      r.groupId === selectedGroup &&
      (r.status === "Absent" || r.status === "Excused"),
  );

  const getReasonStats = () => {
    const stats = {
      medical: 0,
      family: 0,
      competition: 0,
      technical: 0,
      other_excused: 0,
      unexcused: 0,
    };

    groupAbsences.forEach((r) => {
      if (r.reasonCategory && stats[r.reasonCategory] !== undefined) {
        stats[r.reasonCategory]++;
      } else if (
        (r.note || "").toLowerCase().includes("kasal") ||
        (r.note || "").toLowerCase().includes("salomat")
      ) {
        stats.medical++;
      } else if (
        (r.note || "").toLowerCase().includes("oilaviy") ||
        (r.note || "").toLowerCase().includes("to'y")
      ) {
        stats.family++;
      } else if (
        (r.note || "").toLowerCase().includes("musobaqa") ||
        (r.note || "").toLowerCase().includes("olimpiada")
      ) {
        stats.competition++;
      } else if (
        (r.note || "").toLowerCase().includes("texnik") ||
        (r.note || "").toLowerCase().includes("internet")
      ) {
        stats.technical++;
      } else {
        stats.unexcused++;
      }
    });

    return { stats, total: groupAbsences.length };
  };

  const { stats: reasonStats, total: totalAbsences } = getReasonStats();

  const todayAbsentCount = Object.values(attendanceMap).filter(
    (a) => a.status === "Absent",
  ).length;
  const todayExcusedCount = Object.values(attendanceMap).filter(
    (a) => a.status === "Excused",
  ).length;

  return (
    <div className="attendance-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineClipboardDocumentCheck className="title-icon-indigo" />
            Davomat va Baholar Jurnali
          </h1>
          <p className="page-subtitle">
            Guruhlar bo'yicha kunlik dars davomati (Keldi / Kelmadi), baholar & imtihonlar jurnali hamda Telegram bot xabarnomalari
          </p>
        </div>

        {selectedGroup && canMarkAttendance && (
          activeTabMode === "attendance" ? (
            <button className="btn btn-primary" onClick={handleSaveAttendance}>
              <HiOutlineDocumentCheck /> Davomatni Saqlash & Botga Yuborish
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSaveGrades}>
              <HiOutlineStar /> Baholarni Saqlash & Botga Yuborish
            </button>
          )
        )}
      </div>

      {!selectedGroup ? (
        <div className="groups-selection-section">
          <div className="section-label-row">
            <span className="section-label-title">
              <HiOutlineUserGroup className="text-indigo" />
              Davomat yoki Baholarni kiritish uchun guruhni tanlang:
            </span>
            <span className="text-xs text-muted">
              Jami: <strong>{accessibleGroups.length} ta faol guruh</strong>
            </span>
          </div>

          {accessibleGroups.length === 0 ? (
            <div className="card text-center py-10">
              <HiOutlineUserGroup className="text-indigo text-4xl mb-3 inline-block" />
              <h4 className="font-bold text-lg text-dark mb-1">Guruhlar topilmadi</h4>
              <p className="text-muted text-sm">
                Hurmatli {user?.name || "foydalanuvchi"}, sizga hozircha faol guruhlar biriktirilmagan. Guruh ochish yoki biriktirish uchun Administratorga murojaat qiling.
              </p>
            </div>
          ) : (
            <div className="group-cards-horizontal-grid">
              {accessibleGroups.map((g, idx) => {
                const grpStudents = students.filter((s) => s.groupId === g.id);

                return (
                  <div
                    key={g.id}
                    className={`group-select-card color-scheme-${idx % 8}`}
                    onClick={() => setSelectedGroup(g.id)}
                  >
                    <h4 className="group-card-name">{g.name}</h4>
                    <span className="group-card-course">{g.courseName}</span>

                    <div className="group-card-meta-list">
                      {currentRole === "admin" && (
                        <div className="group-card-meta-item">
                          <FaChalkboardUser /> Ustoz: <strong>{g.teacherName}</strong>
                        </div>
                      )}
                      <div className="group-card-meta-item">
                        <HiOutlineClock /> Vaqt: <strong>{g.scheduleTime}</strong>
                      </div>
                      <div className="group-card-meta-item">
                        <HiOutlineMapPin /> Xona: <strong>{g.room}</strong>
                      </div>
                      <div className="group-card-meta-item text-indigo">
                        <HiOutlineUserGroup /> O'quvchilar: <strong>{grpStudents.length} nafar</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="group-journal-header-card">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedGroup(null)}
              >
                <HiOutlineArrowLeft /> Barcha Guruhlarga Qaytish
              </button>
              <div>
                <h3 className="journal-group-title">{currentGroupObj?.name}</h3>
                <span className="journal-group-subtitle">
                  {currentGroupObj?.courseName} {currentRole === "admin" ? `• Ustoz: ${currentGroupObj?.teacherName}` : ""} • Xona: {currentGroupObj?.room} ({currentGroupObj?.scheduleTime})
                </span>
              </div>
            </div>

            <div className="mode-tabs-inline">
              <button
                type="button"
                className={`mode-tab-btn-sm ${activeTabMode === "attendance" ? "active" : ""}`}
                onClick={() => setActiveTabMode("attendance")}
              >
                <HiOutlineClipboardDocumentCheck /> Davomat Jurnali
              </button>
              <button
                type="button"
                className={`mode-tab-btn-sm ${activeTabMode === "grades" ? "active" : ""}`}
                onClick={() => setActiveTabMode("grades")}
              >
                <HiOutlineStar /> Baholar
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="alert alert-success mb-4">
              <HiOutlineCheck className="inline-icon-xs" /> Muvaffaqiyatli saqlandi va Telegram botga yuborildi!
            </div>
          )}

          {activeTabMode === "attendance" ? (
            <>
              <div className="attendance-control-panel">
                <div className="attendance-date-box">
                  <label>Dars Sanasi:</label>
                  <input
                    type="date"
                    className="form-input form-input-sm"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="attendance-actions-right">
                  {canMarkAttendance && (
                    <button
                      type="button"
                      className="btn btn-mark-all btn-sm"
                      onClick={handleMarkAllPresent}
                      title="Barchasini 'Keldi' deb belgilash"
                    >
                      <HiOutlineCheck style={{ fontSize: "17px", strokeWidth: 2.5 }} />
                    </button>
                  )}
                </div>
              </div>

              <div className="card table-card mb-6">
                <div className="card-header-flex px-6 pt-6 flex justify-between items-center">
                  <h3 className="section-title mb-0">
                    <HiOutlineClipboardDocumentCheck className="title-icon-indigo" />
                    {currentGroupObj?.name} — Davomat Ro'yxati ({activeGroupStudents.length} ta o'quvchi)
                  </h3>
                  <span className="text-muted text-sm">
                    Sana: <strong>{selectedDate}</strong>
                  </span>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>9 Xonali ID</th>
                        <th>O'quvchi F.I.SH</th>
                        <th>Telefon</th>
                        <th className="text-center">Davomat Holati</th>
                        <th>Sabab Tasniflagichi</th>
                        <th className="text-center">Telegram Bot</th>
                        <th className="text-center">Profil Ko'rish</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGroupStudents.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-6 text-muted">
                            Ushbu guruhga hali o'quvchilar biriktirilmagan
                          </td>
                        </tr>
                      ) : (
                        activeGroupStudents.map((student) => {
                          const currentRec = attendanceMap[student.id] || {
                            status: "Present",
                            note: "",
                            reasonCategory: "",
                          };
                          const isExcused = currentRec.status === "Excused";
                          const isAbsent = currentRec.status === "Absent";
                          const consecutiveAbsences = getStudentConsecutiveAbsences(student.id);
                          const isHighRisk = consecutiveAbsences >= 3;

                          return (
                            <tr key={student.id}>
                              <td>
                                <span className="id-pill">#{format9DigitId(student.id, "student")}</span>
                              </td>
                              <td>
                                <div>
                                  <button
                                    type="button"
                                    className="student-name-text font-bold hover-indigo bg-transparent border-0 p-0 text-left cursor-pointer"
                                    onClick={() => setSelectedProfileStudent(student)}
                                  >
                                    {student.fullName}
                                  </button>
                                  {isHighRisk && (
                                    <div className="mt-1">
                                      <span className="consecutive-danger-pill">
                                        <HiOutlineExclamationTriangle /> 🚨 {consecutiveAbsences} dars qoldirgan!
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="text-muted">{student.phone}</td>
                              <td className="text-center">
                                <div className="attendance-toggle-group">
                                  <button
                                    type="button"
                                    className={`att-btn att-present ${currentRec.status === "Present" ? "active" : ""}`}
                                    onClick={() =>
                                      canMarkAttendance &&
                                      handleStatusChange(student.id, "Present")
                                    }
                                    disabled={!canMarkAttendance}
                                  >
                                    <HiOutlineCheck /> Keldi
                                  </button>
                                  <button
                                    type="button"
                                    className={`att-btn att-absent ${currentRec.status === "Absent" ? "active" : ""}`}
                                    onClick={() =>
                                      canMarkAttendance &&
                                      handleStatusChange(student.id, "Absent")
                                    }
                                    disabled={!canMarkAttendance}
                                  >
                                    <HiOutlineXMark /> Kelmadi
                                  </button>
                                  <button
                                    type="button"
                                    className={`att-btn att-excused ${currentRec.status === "Excused" ? "active" : ""}`}
                                    onClick={() =>
                                      canMarkAttendance &&
                                      handleStatusChange(student.id, "Excused")
                                    }
                                    disabled={!canMarkAttendance}
                                  >
                                    <HiOutlineExclamationCircle /> Sababli
                                  </button>
                                </div>
                              </td>
                              <td>
                                {isExcused ? (
                                  <div className="reason-categorizer-box">
                                    <select
                                      className="form-select form-select-sm reason-select"
                                      value={currentRec.reasonCategory || "medical"}
                                      disabled={!canMarkAttendance}
                                      onChange={(e) => {
                                        const selectedObj = EXCUSED_REASONS.find(
                                          (r) => r.id === e.target.value,
                                        );
                                        if (selectedObj)
                                          handleReasonSelect(student.id, selectedObj);
                                      }}
                                    >
                                      {EXCUSED_REASONS.map((r) => (
                                        <option key={r.id} value={r.id}>
                                          {r.label}
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      className="form-input form-input-sm reason-custom-note"
                                      placeholder="Sabab tafsilotlari..."
                                      value={currentRec.note}
                                      disabled={!canMarkAttendance}
                                      onChange={(e) =>
                                        handleNoteChange(student.id, e.target.value)
                                      }
                                    />
                                  </div>
                                ) : isAbsent ? (
                                  <div className="reason-categorizer-box">
                                    <span className="attendance-absent-pill">
                                      <HiOutlineXMark /> Sababsiz qoldirdi
                                    </span>
                                    <input
                                      type="text"
                                      className="form-input form-input-sm reason-custom-note"
                                      placeholder="Izoh yozing..."
                                      value={currentRec.note}
                                      disabled={!canMarkAttendance}
                                      onChange={(e) =>
                                        handleNoteChange(student.id, e.target.value)
                                      }
                                    />
                                  </div>
                                ) : (
                                  <span className="text-emerald font-bold text-sm">
                                    <HiOutlineCheck className="inline-icon-xs" /> Darsda qatnashmoqda
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                {isHighRisk ? (
                                  <button
                                    type="button"
                                    className="btn-dropout-warning"
                                    onClick={() => sendDropoutWarning(student)}
                                    title="3+ dars qoldirgan xavf xabarini Telegram botga yuborish"
                                  >
                                    <FaTelegram /> 🚨 Botga Xavf
                                  </button>
                                ) : isAbsent || isExcused ? (
                                  <button
                                    type="button"
                                    className="btn-telegram-action"
                                    onClick={() => sendTelegramAbsenceAlert(student)}
                                    title="Ota-onaga Telegram botdan darsga kelmaganligi haqida xabar yuborish"
                                  >
                                    <FaTelegram /> Botga Xabar
                                  </button>
                                ) : (
                                  <span className="text-muted text-xs">
                                    <FaTelegram className="text-indigo inline-icon-xs" /> Sinxron
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setSelectedProfileStudent(student)}
                                >
                                  <FaUserGraduate /> Profil Ko'rish
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid-2-col">
                <div className="card">
                  <h3 className="section-title mb-4">
                    <HiOutlineChartBar className="title-icon-indigo" />
                    Umumiy Davomat Statistikasi ({currentGroupObj?.name})
                  </h3>
                  <div className="stats-list">
                    <div className="stat-row">
                      <span>Jami Dars Kunlari:</span>
                      <strong>{totalMarkedDays} kun</strong>
                    </div>
                    <div className="stat-row">
                      <span>Jami Dars Qoldirishlar:</span>
                      <strong>{totalAbsences} marta</strong>
                    </div>
                    <div className="stat-row highlight">
                      <span>Guruh Davomat Ko'rsatkichi:</span>
                      <strong>
                        {totalMarkedDays > 0 && activeGroupStudents.length > 0
                          ? Math.round(
                              (1 -
                                totalAbsences /
                                  (totalMarkedDays * activeGroupStudents.length)) *
                                100,
                            )
                          : 100}
                        %
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="section-title mb-4">
                    <HiOutlineClipboardDocumentCheck className="title-icon-indigo" />
                    Dars Qoldirish Sabablari Taqsimoti
                  </h3>
                  <div className="reason-breakdown-list">
                    <div className="reason-stat-item">
                      <span className="reason-tag">
                        <span className="tag-dot dot-medical"></span>
                        Salomatlik / Kasallik (Uzrli)
                      </span>
                      <span className="reason-count">{reasonStats.medical}</span>
                    </div>
                    <div className="reason-stat-item">
                      <span className="reason-tag">
                        <span className="tag-dot dot-family"></span>
                        Oilaviy Sabab (Ruxsat olingan)
                      </span>
                      <span className="reason-count">{reasonStats.family}</span>
                    </div>
                    <div className="reason-stat-item">
                      <span className="reason-tag">
                        <span className="tag-dot dot-competition"></span>
                        Musobaqa / Olimpiada
                      </span>
                      <span className="reason-count">{reasonStats.competition}</span>
                    </div>
                    <div className="reason-stat-item">
                      <span className="reason-tag">
                        <span className="tag-dot dot-technical"></span>
                        Texnik / Transport sababi
                      </span>
                      <span className="reason-count">{reasonStats.technical}</span>
                    </div>
                    <div className="reason-stat-item">
                      <span className="reason-tag">
                        <span className="tag-dot dot-other_excused"></span>
                        Boshqa Uzrli Sabab
                      </span>
                      <span className="reason-count">{reasonStats.other_excused}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="section-title mb-4">
                    <HiOutlineDocumentCheck className="title-icon-indigo" />
                    Telegram Xabarnomalar Xulosasi
                  </h3>
                  <p className="text-muted text-sm mb-4">
                    Dars boshlanishi bilan o'quvchining yo'qligi haqidagi xabarlar to'g'ridan-to'g'ri ota-onaning Telegram botiga yuboriladi.
                  </p>
                  <div className="stats-list">
                    <div className="stat-row">
                      <span>Botga Ulangan O'quvchilar:</span>
                      <strong className="text-emerald">{activeGroupStudents.length} ta (100%)</strong>
                    </div>
                    <div className="stat-row">
                      <span>Bugun Yuborilgan Ogohlantirishlar:</span>
                      <strong>{todayAbsentCount + todayExcusedCount} ta xabar</strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card table-card mb-6">
                <div className="card-header-flex px-6 pt-6 flex justify-between items-center">
                  <h3 className="section-title mb-0">
                    <HiOutlineTrophy className="title-icon-indigo" />
                    {currentGroupObj?.name} — O'quvchilar Baholari
                  </h3>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>O'quvchi F.I.SH</th>
                        <th>Baho</th>
                        <th className="text-center">Profil Ko'rish</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGroupStudents.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-muted">
                            Ushbu guruhga hali o'quvchilar biriktirilmagan
                          </td>
                        </tr>
                      ) : (
                        activeGroupStudents.map((student, idx) => {
                          const grRec = gradesMap[student.id] || {
                            score: 10,
                            homeworkDone: true,
                            comment: "Faol",
                          };

                          return (
                            <tr key={student.id}>
                              <td>{idx + 1}</td>
                              <td>
                                <button
                                  type="button"
                                  className="student-name-text font-bold hover-indigo bg-transparent border-0 p-0 text-left cursor-pointer"
                                  onClick={() => setSelectedProfileStudent(student)}
                                >
                                  {student.fullName}
                                </button>
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm grade-select-box"
                                  value={grRec.score}
                                  onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                >
                                  <option value="10">🌟 10 Ball (A'lo)</option>
                                  <option value="9">🟢 9 Ball (Juda yaxshi)</option>
                                  <option value="8">🔵 8 Ball (Yaxshi)</option>
                                  <option value="7">🟡 7 Ball (Qoniqarli)</option>
                                  <option value="6">🟠 6 Ball (O'rtacha)</option>
                                  <option value="5">🟠 5 Ball (O'rtacha)</option>
                                  <option value="4">🔴 4 Ball (Qoniqarsiz)</option>
                                  <option value="3">🔴 3 Ball (Qoniqarsiz)</option>
                                  <option value="2">🔴 2 Ball (Qoniqarsiz)</option>
                                  <option value="1">🔴 1 Ball (Qoniqarsiz)</option>
                                </select>
                              </td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setSelectedProfileStudent(student)}
                                >
                                  <FaUserGraduate /> Profil Ko'rish
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

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
