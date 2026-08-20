import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  getStoredData,
  setStoredData,
  INITIAL_ATTENDANCE,
  INITIAL_GROUPS,
  INITIAL_STUDENTS,
  STORAGE,
} from "../../data/eduData";
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
import { FaUserGraduate } from "react-icons/fa6";
import "./Attendance.css";

const ABSENCE_REASONS = [
  { id: "medical", label: "Salomatlik / Kasallik", tag: "Kasal" },
  { id: "family", label: "Oilaviy Sabab", tag: "Oilaviy" },
  { id: "competition", label: "Musobaqa / Olimpiada", tag: "Musobaqa" },
  { id: "technical", label: "Texnik / Yo'l / Internet", tag: "Texnik" },
  { id: "unexcused", label: "Sababsiz", tag: "Sababsiz" },
];

const Attendance = () => {
  const { canMarkAttendance } = useEduAuth();

  const [groups] = useState(() =>
    getStoredData(STORAGE.GROUPS, INITIAL_GROUPS),
  );
  const [students] = useState(() =>
    getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS),
  );
  const [attendanceRecords, setAttendanceRecords] = useState(() =>
    getStoredData(STORAGE.ATTENDANCE, INITIAL_ATTENDANCE),
  );

  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || "G-101");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

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
          (rec?.note?.includes("Kasal")
            ? "medical"
            : rec?.note?.includes("Musobaqa")
              ? "competition"
              : ""),
      };
    });
    setAttendanceMap(map);
  }, [selectedGroup, selectedDate, attendanceRecords]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        note: status === "Present" ? "" : prev[studentId]?.note || "Sababsiz",
        reasonCategory:
          status === "Present"
            ? ""
            : prev[studentId]?.reasonCategory || "unexcused",
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

  const handleSaveAttendance = () => {
    let updatedRecords = [...attendanceRecords];

    activeGroupStudents.forEach((s) => {
      const studentMap = attendanceMap[s.id];
      if (!studentMap) return;

      const idx = updatedRecords.findIndex(
        (r) =>
          r.groupId === selectedGroup &&
          r.studentId === s.id &&
          r.date === selectedDate,
      );

      if (idx >= 0) {
        updatedRecords[idx] = {
          ...updatedRecords[idx],
          status: studentMap.status,
          note: studentMap.note,
          reasonCategory: studentMap.reasonCategory,
        };
      } else {
        updatedRecords.push({
          id: Math.floor(500 + Math.random() * 9000),
          groupId: selectedGroup,
          studentId: s.id,
          date: selectedDate,
          status: studentMap.status,
          note: studentMap.note,
          reasonCategory: studentMap.reasonCategory,
        });
      }
    });

    setAttendanceRecords(updatedRecords);
    setStoredData(STORAGE.ATTENDANCE, updatedRecords);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
    const total = groupAbsences.length || 1;
    const stats = {
      medical: 0,
      family: 0,
      competition: 0,
      technical: 0,
      unexcused: 0,
    };

    groupAbsences.forEach((r) => {
      if (r.reasonCategory && stats[r.reasonCategory] !== undefined) {
        stats[r.reasonCategory]++;
      } else if (
        r.note?.toLowerCase().includes("kasal") ||
        r.note?.toLowerCase().includes("salomat")
      ) {
        stats.medical++;
      } else if (
        r.note?.toLowerCase().includes("oilaviy") ||
        r.note?.toLowerCase().includes("to'y")
      ) {
        stats.family++;
      } else if (
        r.note?.toLowerCase().includes("musobaqa") ||
        r.note?.toLowerCase().includes("olimpiada")
      ) {
        stats.competition++;
      } else if (
        r.note?.toLowerCase().includes("texnik") ||
        r.note?.toLowerCase().includes("internet")
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
                  const isMissing =
                    currentRec.status === "Absent" ||
                    currentRec.status === "Excused";

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
                        {isMissing ? (
                          <div className="reason-categorizer-box">
                            <select
                              className="form-select form-select-sm reason-select"
                              value={currentRec.reasonCategory || "unexcused"}
                              disabled={!canMarkAttendance}
                              onChange={(e) => {
                                const selectedObj = ABSENCE_REASONS.find(
                                  (r) => r.id === e.target.value,
                                );
                                if (selectedObj)
                                  handleReasonSelect(student.id, selectedObj);
                              }}
                            >
                              {ABSENCE_REASONS.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              className="form-input form-input-sm reason-custom-note"
                              placeholder="Qo'shimcha izoh..."
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
