import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { attendanceApi, groupsApi, studentsApi } from "../../services/api";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineDocumentCheck,
  HiOutlineChartBar
} from "react-icons/hi2";
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
      const updatedList = await attendanceApi.getAll();
      setAttendanceRecords(updatedList);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert("Davomat saqlashda xatolik: " + (err.response?.data?.error || err.message));
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
            <HiOutlineClipboardDocumentCheck style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Davomat va Darslar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            Har bir dars kuni uchun guruhdagi o'quvchilarning davomati va dars
            qoldirish sabablari tasniflagichi
          </p>
        </div>
      </div>

      <div className="card filter-card">
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
              <HiOutlineMapPin style={{ verticalAlign: 'middle', marginRight: 3 }} />
              Xona: <strong>{currentGroupObj?.room}</strong>
            </span>
            <span>
              <HiOutlineClock style={{ verticalAlign: 'middle', marginRight: 3 }} />
              Vaqt: <strong>{currentGroupObj?.scheduleTime}</strong>
            </span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="alert alert-success">
          <HiOutlineCheck style={{ verticalAlign: 'middle', marginRight: 4 }} /> Davomat muvaffaqiyatli saqlandi!
        </div>
      )}

      <div className="card table-card mb-6">
        <div className="card-header-flex px-6 pt-6">
          <h3 className="section-title">
            <HiOutlineUserGroup style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {currentGroupObj?.name} O'quvchilari ({activeGroupStudents.length} ta)
          </h3>
          <span className="text-muted text-sm">
            Sana: <strong>{selectedDate}</strong>
          </span>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>O'quvchi F.I.SH</th>
                <th>Telefon</th>
                <th className="text-center">Davomat Holati</th>
                <th>Sabab Tasniflagichi (Kategoriya)</th>
              </tr>
            </thead>
            <tbody>
              {activeGroupStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-muted">
                    Ushbu guruhga hali o'quvchilar biriktirilmagan
                  </td>
                </tr>
              ) : (
                activeGroupStudents.map((student, idx) => {
                  const currentRec = attendanceMap[student.id] || {
                    status: "Present",
                    note: "",
                    reasonCategory: "",
                  };
                  const isExcused = currentRec.status === "Excused";
                  const isAbsent = currentRec.status === "Absent";

                  return (
                    <tr key={student.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong className="student-name-text">
                          {student.fullName}
                        </strong>
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
                            <span className="status-pill pill-overdue flex items-center gap-1">
                              <HiOutlineXMark /> Sababsiz qoldirdi
                            </span>
                            <input
                              type="text"
                              className="form-input form-input-sm reason-custom-note"
                              placeholder="Sababsiz qoldirish izohi..."
                              value={currentRec.note}
                              disabled={!canMarkAttendance}
                              onChange={(e) =>
                                handleNoteChange(student.id, e.target.value)
                              }
                            />
                          </div>
                        ) : (
                          <span className="text-success font-semibold flex items-center gap-1">
                            <HiOutlineCheck style={{ color: '#16a34a' }} /> Darsda qatnashmoqda
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {canMarkAttendance && (
          <div className="p-6 border-t flex justify-end">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSaveAttendance}
            >
              <HiOutlineDocumentCheck /> Davomatni Saqlash
            </button>
          </div>
        )}
      </div>

      <div className="grid-2-col">
        <div className="card">
          <h3 className="section-title">
            <HiOutlineChartBar style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Guruh bo'yicha Oylik Davomat Statistikasi
          </h3>
          <p className="text-muted text-sm mb-4">
            Jami o'tkazilgan darslar soni:{" "}
            <strong>{totalMarkedDays || 1} ta dars</strong>
          </p>

          <div className="stats-list">
            {activeGroupStudents.map((s) => {
              const studentRecs = attendanceRecords.filter(
                (r) => r.groupId === selectedGroup && r.studentId === s.id,
              );
              const presentCount = studentRecs.filter(
                (r) => r.status === "Present",
              ).length;
              const absentCount = studentRecs.filter(
                (r) => r.status === "Absent",
              ).length;
              const excusedCount = studentRecs.filter(
                (r) => r.status === "Excused",
              ).length;

              const total = studentRecs.length || 1;
              const rate = Math.round((presentCount / total) * 100);

              return (
                <div key={s.id} className="student-stat-item">
                  <div className="stat-student-info">
                    <strong>{s.fullName}</strong>
                    <span>
                      {presentCount} keldi | {absentCount} kelmadi |{" "}
                      {excusedCount} sababli
                    </span>
                  </div>
                  <div className="stat-progress-wrap">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                    <span className="rate-text">{rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header-flex mb-4">
            <div>
              <h3 className="section-title mb-0">
                <HiOutlineChartBar style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Dars Qoldirish Sabablari Tahlili
              </h3>
              <p className="text-muted text-sm">
                Guruh o'quvchilari nima sababdan dars qoldirmoqda? (
                {totalAbsences} ta holat)
              </p>
            </div>
          </div>

          <div className="absence-breakdown-list">
            <div className="absence-item">
              <div className="absence-header">
                <span>Salomatlik / Kasallik</span>
                <strong>
                  {reasonStats.medical} ta (
                  {totalAbsences
                    ? Math.round((reasonStats.medical / totalAbsences) * 100)
                    : 0}
                  %)
                </strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill fill-medical"
                  style={{
                    width: `${totalAbsences ? (reasonStats.medical / totalAbsences) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="absence-item">
              <div className="absence-header">
                <span>Oilaviy Sabab</span>
                <strong>
                  {reasonStats.family} ta (
                  {totalAbsences
                    ? Math.round((reasonStats.family / totalAbsences) * 100)
                    : 0}
                  %)
                </strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill fill-family"
                  style={{
                    width: `${totalAbsences ? (reasonStats.family / totalAbsences) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="absence-item">
              <div className="absence-header">
                <span>Musobaqa / Olimpiada</span>
                <strong>
                  {reasonStats.competition} ta (
                  {totalAbsences
                    ? Math.round(
                        (reasonStats.competition / totalAbsences) * 100,
                      )
                    : 0}
                  %)
                </strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill fill-competition"
                  style={{
                    width: `${totalAbsences ? (reasonStats.competition / totalAbsences) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="absence-item">
              <div className="absence-header">
                <span>Texnik / Yo'l / Internet</span>
                <strong>
                  {reasonStats.technical} ta (
                  {totalAbsences
                    ? Math.round((reasonStats.technical / totalAbsences) * 100)
                    : 0}
                  %)
                </strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill fill-technical"
                  style={{
                    width: `${totalAbsences ? (reasonStats.technical / totalAbsences) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="absence-item">
              <div className="absence-header">
                <span>Sababsiz Dars Qoldirish</span>
                <strong>
                  {reasonStats.unexcused} ta (
                  {totalAbsences
                    ? Math.round((reasonStats.unexcused / totalAbsences) * 100)
                    : 0}
                  %)
                </strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill fill-unexcused"
                  style={{
                    width: `${totalAbsences ? (reasonStats.unexcused / totalAbsences) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
