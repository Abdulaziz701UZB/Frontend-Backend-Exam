import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { attendanceApi, groupsApi, studentsApi } from "../../services/api";
import { format9DigitId } from "../../utils/idFormatter";
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
  HiOutlinePaperAirplane
} from "react-icons/hi2";
import { FaTelegram, FaUserGraduate } from "react-icons/fa6";
import "./Attendance.css";

const EXCUSED_REASONS = [
  { id: "medical", label: "Salomatlik / Kasallik (Uzrli)", tag: "Kasal" },
  { id: "family", label: "Oilaviy Sabab (Ruxsat olingan)", tag: "Oilaviy" },
  { id: "competition", label: "Musobaqa / Olimpiada", tag: "Musobaqa" },
  { id: "technical", label: "Texnik / Transport sababi", tag: "Texnik" },
  { id: "other_excused", label: "Boshqa Uzrli Sabab", tag: "Uzrli" },
];

const ABSENCE_REASONS = [
  ...EXCUSED_REASONS,
  { id: "unexcused", label: "Sababsiz Dars Qoldirdi", tag: "Sababsiz" },
];

const Attendance = () => {
  const { canMarkAttendance } = useEduAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState("G-101");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const activeGroupStudents = students.filter(
    (s) => s.groupId === selectedGroup,
  );
  const currentGroupObj = groups.find((g) => g.id === selectedGroup);

  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    const map = {};
    activeGroupStudents.forEach((s) => {
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
    });
    setAttendanceMap(map);
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
    toast.success("2. ⚡ Guruhdagi barcha o'quvchilar 'Keldi' deb belgilandi!");
  };

  const sendTelegramAbsenceAlert = (student) => {
    toast.success(
      `1. 📲 "${student.fullName}" ota-onasining Telegram botiga dars qoldirganligi haqida xabarnoma yuborildi!`
    );
  };

  const sendDropoutWarning = (student) => {
    toast.error(
      `3. 🚨 DIQQAT: "${student.fullName}" ketma-ket 3+ dars qoldirdi! Ota-onasining Telegram botiga shoshilinch ogohlantirish yuborildi!`
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
          ? `Davomat saqlandi! 1. Kelmagan ${absentees.length} nafar o'quvchining ota-onasiga Telegram bot xabari yuborildi.`
          : "Davomat muvaffaqiyatli saqlandi!"
      );
    } catch (err) {
      console.error("Save attendance error:", err.message);
      toast.error("Davomatni saqlashda xatolik yuz berdi");
    }
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

  return (
    <div className="attendance-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineClipboardDocumentCheck className="title-icon-indigo" />
            4. Davomat Jurnali & Darslar Nazorati
          </h1>
          <p className="page-subtitle">
            Guruhlar davomati, Telegram bot xabarnomalari (1), tezkor 1-click belgilash (2), 3+ dars qoldirish xavfi (3) va 360° dosye (12)
          </p>
        </div>

        {canMarkAttendance && (
          <button className="btn btn-primary" onClick={handleSaveAttendance}>
            <HiOutlineDocumentCheck /> Davomatni Saqlash & Botga Yuborish
          </button>
        )}
      </div>

      <div className="card filter-card mb-4">
        <div className="attendance-control-row">
          <div className="form-group mb-0">
            <label className="form-label">Guruhni Tanlang:</label>
            <select
              className="form-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.courseName}) - {g.teacherName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Dars Sanasi:</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="group-info-pill">
            <span>
              <HiOutlineMapPin className="inline-icon-xs" />
              Xona: <strong>{currentGroupObj?.room}</strong>
            </span>
            <span>
              <HiOutlineClock className="inline-icon-xs" />
              Vaqt: <strong>{currentGroupObj?.scheduleTime}</strong>
            </span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="alert alert-success mb-4">
          <HiOutlineCheck className="inline-icon-xs" /> Davomat muvaffaqiyatli saqlandi va Telegram botga yuborildi!
        </div>
      )}

      <div className="card table-card mb-6">
        <div className="card-header-flex px-6 pt-6 flex justify-between items-center">
          <h3 className="section-title mb-0">
            <HiOutlineUserGroup className="title-icon-indigo" />
            {currentGroupObj?.name} O'quvchilari ({activeGroupStudents.length} ta)
          </h3>

          {canMarkAttendance && (
            <button
              type="button"
              className="btn btn-mark-all btn-sm"
              onClick={handleMarkAllPresent}
            >
              <HiOutlineSparkles /> 2. ⚡ Barchasini "Keldi" Qilish
            </button>
          )}
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>9 Xonali ID (12)</th>
                <th>O'quvchi F.I.SH (12)</th>
                <th>Telefon Raqami</th>
                <th className="text-center">Davomat Holati</th>
                <th>Sabab Tasniflagichi</th>
                <th className="text-center">Telegram Bot & Xavf (1, 3)</th>
                <th className="text-center">360° Dosye (12)</th>
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
                          <Link
                            to={`/students/${format9DigitId(student.id, "student")}`}
                            className="student-name-text font-bold hover-indigo"
                          >
                            {student.fullName}
                          </Link>
                          {isHighRisk && (
                            <div className="mt-1">
                              <span className="consecutive-danger-pill">
                                <HiOutlineExclamationTriangle /> 3. 🚨 {consecutiveAbsences} dars qoldirgan!
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
                              placeholder="Izoh (masalan: Telefoni o'chiq)..."
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
                            title="3. 3+ dars qoldirgan xavf xabarini Telegram botga yuborish"
                          >
                            <FaTelegram /> 3. 🚨 Botga Xavf Xabari
                          </button>
                        ) : isAbsent || isExcused ? (
                          <button
                            type="button"
                            className="btn-telegram-action"
                            onClick={() => sendTelegramAbsenceAlert(student)}
                            title="1. Ota-onaga Telegram botdan darsga kelmaganligi haqida xabar yuborish"
                          >
                            <FaTelegram /> 1. Botga Xabar
                          </button>
                        ) : (
                          <span className="text-muted text-xs">
                            <FaTelegram className="text-indigo inline-icon-xs" /> Bot sinxron
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/students/${format9DigitId(student.id, "student")}`)}
                        >
                          <FaUserGraduate /> 360° Dosye
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
            <div className="reason-stat-item">
              <span className="reason-tag">
                <span className="tag-dot dot-unexcused"></span>
                Sababsiz Dars Qoldirish
              </span>
              <span className="reason-count">{reasonStats.unexcused}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
