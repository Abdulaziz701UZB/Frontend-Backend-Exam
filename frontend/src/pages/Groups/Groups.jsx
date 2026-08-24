import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { groupsApi, coursesApi, teachersApi, roomsApi, studentsApi } from "../../services/api";
import { format9DigitId, formatSpaced9DigitId } from "../../utils/idFormatter";
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineSparkles
} from "react-icons/hi2";
import { FaChalkboardUser, FaUserGraduate } from "react-icons/fa6";
import "./Groups.css";

const Groups = () => {
  const { canManageGroups } = useEduAuth();
  const toast = useToast();
  const { id: urlParamId } = useParams();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [allowConflictSave, setAllowConflictSave] = useState(false);
  const [highlightConflictShake, setHighlightConflictShake] = useState(false);

  const [selectedGroupDetail, setSelectedGroupDetail] = useState(null);

  const [formData, setFormData] = useState({
    courseId: 1,
    name: "",
    teacherId: 101,
    room: "201-xona (Kompyuter zali)",
    scheduleDays: "Dushanba - Chorshanba - Juma",
    scheduleTime: "14:00 - 16:00",
    monthlyFee: 850000,
    status: "Active",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsData, coursesData, teachersData, roomsData, studentsData] = await Promise.all([
        groupsApi.getAll(),
        coursesApi.getAll(),
        teachersApi.getAll(),
        roomsApi.getAll(),
        studentsApi.getAll(),
      ]);
      setGroups(groupsData);
      setCourses(coursesData);
      setTeachers(teachersData);
      setRooms(roomsData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Groups load error:", err.message);
      toast.error("Guruhlar ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (urlParamId && groups.length > 0) {
      const match = groups.find(
        (g) =>
          String(g.id) === String(urlParamId) ||
          format9DigitId(g.id, "group") === String(urlParamId)
      );
      if (match) {
        setSelectedGroupDetail(match);
      }
    }
  }, [urlParamId, groups]);

  const checkScheduleConflict = () => {
    if (formData.status !== "Active") return null;

    const conflicts = [];
    const currentGroupId = editingGroup?.id;

    groups.forEach((g) => {
      if (g.id === currentGroupId || g.status !== "Active") return;

      const sameDays =
        (g.scheduleDays || "").trim().toLowerCase() ===
        (formData.scheduleDays || "").trim().toLowerCase();
      const sameTime =
        (g.scheduleTime || "").trim().toLowerCase() ===
        (formData.scheduleTime || "").trim().toLowerCase();

      if (sameDays && sameTime) {
        if (
          parseInt(g.teacherId) === parseInt(formData.teacherId) &&
          formData.teacherId
        ) {
          const teacherObj = teachers.find(
            (t) => t.id === parseInt(formData.teacherId)
          );
          conflicts.push({
            type: "teacher",
            message: `O'qituvchi (${teacherObj?.name || "Tanlangan ustoz"}) bu vaqtda boshqa guruhda ("${g.name}") dars o'tadi!`,
          });
        }

        if (
          (g.room || "").trim().toLowerCase() ===
            (formData.room || "").trim().toLowerCase() &&
          formData.room
        ) {
          conflicts.push({
            type: "room",
            message: `"${formData.room}" xonasi bu vaqtda boshqa guruh ("${g.name}") tomonidan band qilingan!`,
          });
        }
      }
    });

    return conflicts.length > 0 ? conflicts : null;
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setAllowConflictSave(false);
    setHighlightConflictShake(false);
    const firstCourse = courses[0];
    const firstTeacher = teachers[0];
    const firstRoom = rooms[0];

    setFormData({
      courseId: firstCourse?.id || 1,
      name: `G-${100 + groups.length + 1} Guruh`,
      teacherId: firstTeacher?.id || 101,
      room: firstRoom?.name || "201-xona (Kompyuter zali)",
      scheduleDays: "Dushanba - Chorshanba - Juma",
      scheduleTime: "14:00 - 16:00",
      monthlyFee: firstCourse?.price || 850000,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (group, e) => {
    if (e) e.stopPropagation();
    setEditingGroup(group);
    setAllowConflictSave(false);
    setHighlightConflictShake(false);
    setFormData({
      courseId: group.courseId || 1,
      name: group.name,
      teacherId: group.teacherId || 101,
      room: group.room,
      scheduleDays: group.scheduleDays,
      scheduleTime: group.scheduleTime,
      monthlyFee: group.monthlyFee,
      status: group.status || "Active",
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (group, e) => {
    if (e) e.stopPropagation();
    setSelectedGroupDetail(group);
    navigate(`/groups/${format9DigitId(group.id, "group")}`);
  };

  const closeDetailModal = () => {
    setSelectedGroupDetail(null);
    if (urlParamId) {
      navigate("/groups");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const conflicts = checkScheduleConflict();
    if (conflicts && conflicts.length > 0 && !allowConflictSave) {
      setHighlightConflictShake(true);
      setTimeout(() => setHighlightConflictShake(false), 1500);
      toast.error(
        "DIQQAT: Jadval to'qnashuvi mavjud! Saqlash uchun 'Ogohlantirishga qaramay saqlash' katakchasini belgilang."
      );
      return;
    }

    const courseObj = courses.find((c) => c.id === parseInt(formData.courseId));
    const teacherObj = teachers.find(
      (t) => t.id === parseInt(formData.teacherId)
    );

    const payload = {
      course_id: parseInt(formData.courseId),
      course_name: courseObj?.name || "",
      name: formData.name,
      teacher_id: parseInt(formData.teacherId),
      teacher_name: teacherObj?.name || "",
      room: formData.room,
      schedule_days: formData.scheduleDays,
      schedule_time: formData.scheduleTime,
      monthly_fee: parseFloat(formData.monthlyFee),
      status: formData.status,
    };

    try {
      if (editingGroup) {
        await groupsApi.update(editingGroup.id, payload);
        toast.success(`"${formData.name}" guruhi yangilandi!`);
      } else {
        await groupsApi.create({
          id: `G-${Math.floor(100000000 + Math.random() * 900000000)}`,
          ...payload,
        });
        toast.success(`"${formData.name}" yangi guruhi yaratildi!`);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteGroup = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Haqiqatan ham "${name}" guruhini o'chirmoqchimisiz?`)) {
      try {
        await groupsApi.delete(id);
        toast.success(`"${name}" guruhi o'chirildi!`);
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount || 0) + " so'm";
  };

  const filteredGroups = groups.filter((g) => {
    const statusMatch =
      filterStatus === "All" ||
      g.status.toLowerCase() === filterStatus.toLowerCase();
    const searchMatch =
      (g.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.courseName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.teacherName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const conflictsList = isModalOpen ? checkScheduleConflict() : null;

  const getGroupFinancials = (group) => {
    if (!group) return null;
    const groupStudents = students.filter((s) => s.groupId === group.id);
    const activeCount = groupStudents.length;
    const monthlyRevenue = activeCount * (group.monthlyFee || 850000);

    const teacherObj = teachers.find((t) => t.id === group.teacherId);
    const teacherSalaryTotal = parseInt(
      String(teacherObj?.salary || "").replace(/\D/g, "") || "8500000"
    );

    const teacherGroups = groups.filter(
      (g) => g.teacherId === group.teacherId && g.status === "Active"
    );
    const teacherGroupsCount = Math.max(1, teacherGroups.length);
    const allocatedTeacherSalary = Math.round(
      teacherSalaryTotal / teacherGroupsCount
    );

    const netProfit = monthlyRevenue - allocatedTeacherSalary;
    const profitMargin =
      monthlyRevenue > 0
        ? Math.round((netProfit / monthlyRevenue) * 100)
        : 0;

    const paidStudents = groupStudents.filter((s) => s.paymentStatus === "Paid");
    const debtorStudents = groupStudents.filter((s) => s.paymentStatus === "Overdue");
    const paidPct = activeCount > 0 ? Math.round((paidStudents.length / activeCount) * 100) : 100;
    const debtPct = 100 - paidPct;
    const totalDebts = debtorStudents.reduce(
      (sum, s) => sum + (s.balance < 0 ? Math.abs(s.balance) : group.monthlyFee || 850000),
      0
    );

    const roomObj = rooms.find(
      (r) => (r.name || "").trim().toLowerCase() === (group.room || "").trim().toLowerCase()
    );
    const maxRoomCapacity = roomObj?.capacity || 18;
    const availableSeats = Math.max(0, maxRoomCapacity - activeCount);

    return {
      activeCount,
      monthlyRevenue,
      allocatedTeacherSalary,
      netProfit,
      profitMargin,
      teacherGroupsCount,
      paidStudents,
      debtorStudents,
      paidPct,
      debtPct,
      totalDebts,
      groupStudents,
      maxRoomCapacity,
      availableSeats,
      lessonsDone: 48,
      lessonsTotal: 72,
      lessonsLeft: 24,
      endDate: "15-noyabr, 2026",
    };
  };

  const groupFin = selectedGroupDetail ? getGroupFinancials(selectedGroupDetail) : null;

  return (
    <div className="groups-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineAcademicCap className="title-icon-indigo" />
            3. Kurslar va Guruhlar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            O'quv guruhlari, to'lov salomatligi (1), tugash sanasi (2), bo'sh o'rinlar (4) va daromadlar tahlili
          </p>
        </div>

        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi Guruh Yaratish
          </button>
        )}
      </div>

      <div className="filter-row">
        <div className="search-input-wrap">
          <HiMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button
            type="button"
            className={`pill-btn ${filterStatus === "All" ? "active" : ""}`}
            onClick={() => setFilterStatus("All")}
          >
            Barchasi ({groups.length})
          </button>
          <button
            type="button"
            className={`pill-btn ${filterStatus === "Active" ? "active" : ""}`}
            onClick={() => setFilterStatus("Active")}
          >
            Faol Guruhlar ({groups.filter((g) => g.status === "Active").length})
          </button>
          <button
            type="button"
            className={`pill-btn ${filterStatus === "Finished" ? "active" : ""}`}
            onClick={() => setFilterStatus("Finished")}
          >
            Yakunlangan ({groups.filter((g) => g.status === "Finished").length})
          </button>
        </div>
      </div>

      <div className="groups-grid">
        {loading ? (
          <div className="skeleton-card skeleton-card-lg"></div>
        ) : filteredGroups.length === 0 ? (
          <div className="card empty-state-card">
            <p className="text-muted">Guruhlar topilmadi</p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const grpStudents = students.filter((s) => s.groupId === group.id);
            const debtors = grpStudents.filter((s) => s.paymentStatus === "Overdue");
            const paidPct = grpStudents.length > 0 ? Math.round(((grpStudents.length - debtors.length) / grpStudents.length) * 100) : 100;
            const roomObj = rooms.find((r) => (r.name || "").trim().toLowerCase() === (group.room || "").trim().toLowerCase());
            const maxCap = roomObj?.capacity || 18;
            const freeSeats = Math.max(0, maxCap - grpStudents.length);

            return (
              <div
                key={group.id}
                className="group-card"
                onClick={(e) => openDetailModal(group, e)}
              >
                <div className="group-card-header">
                  <span className="group-id-badge">#{format9DigitId(group.id, "group")}</span>
                  <span
                    className={`status-pill ${group.status === "Active" ? "pill-paid" : "pill-overdue"}`}
                  >
                    {group.status === "Active" ? "Faol" : "Yakunlangan"}
                  </span>
                </div>

                <h3 className="group-name">{group.name}</h3>
                <p className="group-course">{group.courseName}</p>

                <div className="group-meta-badges">
                  <span className="group-meta-pill pill-health" title="1. To'lov Salomatligi">
                    <HiOutlineShieldCheck /> 1. To'lov: {paidPct}% {debtors.length > 0 ? `(${debtors.length} qarzdor)` : "A'lo"}
                  </span>
                  <span className="group-meta-pill pill-countdown" title="2. Darslar & Tugash Sanasi">
                    <HiOutlineCalendarDays /> 2. 48/72 dars (15-noyabr)
                  </span>
                  <span className={`group-meta-pill ${freeSeats > 0 ? "pill-seats-free" : "pill-seats-full"}`} title="4. Bo'sh O'rinlar">
                    <HiOutlineUserGroup /> 4. {freeSeats > 0 ? `${freeSeats} ta bo'sh o'rin` : "Guruh to'lgan"}
                  </span>
                </div>

                <div className="group-details-list">
                  <div className="detail-item">
                    <span className="detail-icon"><FaChalkboardUser /></span>
                    <div>
                      <label>O'qituvchi</label>
                      <p>{group.teacherName}</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon"><HiOutlineUserGroup /></span>
                    <div>
                      <label>O'quvchilar Soni</label>
                      <p className="text-indigo font-bold">{grpStudents.length} nafar o'quvchi</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon"><HiOutlineCalendarDays /></span>
                    <div>
                      <label>Kunlar</label>
                      <p>{group.scheduleDays}</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon"><HiOutlineClock /></span>
                    <div>
                      <label>Vaqt</label>
                      <p className="text-indigo font-bold">{group.scheduleTime}</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon"><HiOutlineMapPin /></span>
                    <div>
                      <label>Dars Xonasi</label>
                      <p>{group.room}</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon"><HiOutlineBanknotes /></span>
                    <div>
                      <label>Oylik Kurs To'lovi</label>
                      <p className="font-bold">{formatMoney(group.monthlyFee)}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-detail-trigger btn-sm"
                  onClick={(e) => openDetailModal(group, e)}
                >
                  <HiOutlineChartBar /> Tahlil & O'quvchilar ({grpStudents.length})
                </button>

                {canManageGroups && (
                  <div className="group-card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => openEditModal(group, e)}
                    >
                      <HiOutlinePencilSquare /> Tahrirlash
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => handleDeleteGroup(group.id, group.name, e)}
                    >
                      <HiOutlineTrash /> O'chirish
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedGroupDetail && groupFin && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div
            className="modal-content card group-detail-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  <HiOutlineAcademicCap className="title-icon-indigo" />
                  {selectedGroupDetail.name} — Tahlil va O'quvchilar
                </h2>
                <p className="text-muted text-sm m-0 mt-1">
                  Guruh 9 Xonali ID: <strong>#{format9DigitId(selectedGroupDetail.id, "group")}</strong> | Ustoz: <strong>{selectedGroupDetail.teacherName}</strong> ({groupFin.teacherGroupsCount} ta guruhi bor)
                </p>
              </div>
              <button
                className="close-modal-btn"
                onClick={closeDetailModal}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <div className="group-kpi-grid-4">
              <div className="group-kpi-card">
                <div className="kpi-icon-wrap kpi-green">
                  <HiOutlineBanknotes />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Oylik Tushum</span>
                  <strong className="kpi-value">{formatMoney(groupFin.monthlyRevenue)}</strong>
                  <span className="kpi-subtext">{groupFin.activeCount} o'quvchi x {formatMoney(selectedGroupDetail.monthlyFee)}</span>
                </div>
              </div>

              <div className="group-kpi-card">
                <div className="kpi-icon-wrap kpi-purple">
                  <FaChalkboardUser />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">O'qituvchi Ulushi</span>
                  <strong className="kpi-value">{formatMoney(groupFin.allocatedTeacherSalary)}</strong>
                  <span className="kpi-subtext">Ustozning {groupFin.teacherGroupsCount} ta guruhiga taqsimlangan</span>
                </div>
              </div>

              <div className="group-kpi-card">
                <div className="kpi-icon-wrap kpi-indigo">
                  <HiOutlineArrowTrendingUp />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Guruh Sof Foydasi</span>
                  <strong className={`kpi-value ${groupFin.netProfit >= 0 ? "text-indigo" : "text-danger"}`}>
                    {formatMoney(groupFin.netProfit)}
                  </strong>
                  <span className="kpi-subtext">{groupFin.profitMargin}% Rentabellik marjasi</span>
                </div>
              </div>

              <div className="group-kpi-card">
                <div className="kpi-icon-wrap kpi-amber">
                  <HiOutlineUserGroup />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">To'lov Intizomi (1)</span>
                  <strong className="kpi-value">{groupFin.paidStudents.length} / {groupFin.activeCount} to'lagan</strong>
                  <span className="kpi-subtext">{groupFin.debtorStudents.length} ta qarzdor</span>
                </div>
              </div>
            </div>

            <div className="group-intelligence-grid-2">
              <div className="intel-box">
                <span className="intel-box-title">
                  <HiOutlineCalendarDays className="text-indigo" />
                  2. Kurs Tugash Sanasi & Darslar Hisoblagichi
                </span>
                <div className="lessons-progress-bar-wrap">
                  <div
                    className="lessons-progress-fill"
                    style={{ width: `${Math.round((groupFin.lessonsDone / groupFin.lessonsTotal) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="intel-sub-text">
                    <strong>{groupFin.lessonsDone} / {groupFin.lessonsTotal} dars o'tildi</strong> ({groupFin.lessonsLeft} ta dars qoldi)
                  </span>
                  <span className="group-meta-pill pill-countdown">
                    Tugash: {groupFin.endDate}
                  </span>
                </div>
              </div>

              <div className="intel-box">
                <span className="intel-box-title">
                  <HiOutlineUserGroup className="text-indigo" />
                  4. Xona Sig'imi & Bo'sh O'rinlar Nazorati
                </span>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <div className="text-xs text-muted">Xona: <strong>{selectedGroupDetail.room}</strong></div>
                    <div className="text-xs text-muted mt-0.5">Sig'im: <strong>{groupFin.maxRoomCapacity} o'rin</strong> | Qatnashuvchi: <strong>{groupFin.activeCount} o'quvchi</strong></div>
                  </div>
                  <span className={`group-meta-pill ${groupFin.availableSeats > 0 ? "pill-seats-free" : "pill-seats-full"}`}>
                    {groupFin.availableSeats > 0 ? `🟢 ${groupFin.availableSeats} ta bo'sh o'rin mavjud` : "🔴 Guruh to'lgan"}
                  </span>
                </div>
              </div>
            </div>

            <div className="payment-health-box">
              <div className="health-header-row">
                <span className="health-title">
                  <HiOutlineShieldCheck className="inline-icon-xs text-indigo" />
                  1. To'lov Salomatligi & Intizomi Holati
                </span>
                <span className="health-summary-badge">
                  Jami Qarzdorlik: <strong className="text-danger">{formatMoney(groupFin.totalDebts)}</strong>
                </span>
              </div>
              <div className="dual-progress-bar">
                <div
                  className="progress-paid-fill"
                  style={{ width: `${groupFin.paidPct}%` }}
                ></div>
                <div
                  className="progress-debt-fill"
                  style={{ width: `${groupFin.debtPct}%` }}
                ></div>
              </div>
              <div className="health-legend-row">
                <span className="legend-paid">
                  <HiOutlineCheckCircle /> {groupFin.paidStudents.length} nafar o'quvchi to'lagan ({groupFin.paidPct}%)
                </span>
                <span className="legend-debt">
                  <HiOutlineExclamationTriangle /> {groupFin.debtorStudents.length} nafar qarzdor ({groupFin.debtPct}%)
                </span>
              </div>
            </div>

            <div className="roster-section">
              <div className="roster-header-row">
                <span className="roster-title">
                  <FaUserGraduate className="inline-icon-xs text-indigo" />
                  Guruh O'quvchilari Ro'yxati ({groupFin.activeCount} nafar)
                </span>
              </div>

              <div className="group-students-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>9 Xonali ID</th>
                      <th>O'quvchi F.I.SH</th>
                      <th>Telefon Raqami</th>
                      <th>Davomat Foizi</th>
                      <th>Oxirgi Bahosi</th>
                      <th>To'lov Holati</th>
                      <th>Balans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupFin.groupStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          Ushbu guruhda hozircha o'quvchilar yo'q
                        </td>
                      </tr>
                    ) : (
                      groupFin.groupStudents.map((s, idx) => (
                        <tr key={s.id}>
                          <td><span className="id-pill">#{format9DigitId(s.id, "student")}</span></td>
                          <td>
                            <strong className="student-name-text">{s.fullName}</strong>
                          </td>
                          <td>
                            <HiOutlinePhone className="inline-icon-xs" /> {s.phone}
                          </td>
                          <td>
                            <strong className="text-emerald">9{2 + (idx % 7)}%</strong>
                          </td>
                          <td>
                            <span className="group-tag-pill">8{5 + (idx % 12)} ball</span>
                          </td>
                          <td>
                            <span className={`status-pill pill-${(s.paymentStatus || "paid").toLowerCase()}`}>
                              {s.paymentStatus === "Paid" ? "To'langan" : "Qarzdor"}
                            </span>
                          </td>
                          <td>
                            <span className={`balance-tag ${s.balance < 0 ? "balance-neg" : "balance-pos"}`}>
                              {formatMoney(s.balance)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDetailModal}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {editingGroup ? "Guruhni Tahrirlash" : "Yangi Guruh Yaratish"}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {conflictsList && (
                <div
                  className={`conflict-alert-box ${
                    highlightConflictShake ? "conflict-alert-highlight" : ""
                  }`}
                >
                  <div className="conflict-alert-title">
                    <HiOutlineExclamationTriangle />
                    Jadvalda To'qnashuv Aniqlangan!
                  </div>
                  <p className="conflict-alert-desc">
                    Ushbu dars vaqtida o'qituvchi yoki xona boshqa guruh tomonidan band qilingan:
                  </p>
                  <div className="conflict-list">
                    {conflictsList.map((c, idx) => (
                      <div key={idx} className="conflict-item">
                        <span>•</span>
                        <span>{c.message}</span>
                      </div>
                    ))}
                  </div>
                  <label className="override-checkbox-label">
                    <input
                      type="checkbox"
                      checked={allowConflictSave}
                      onChange={(e) => setAllowConflictSave(e.target.checked)}
                    />
                    <span>Ogohlantirishga qaramay saqlashga ruxsat berish (Admin Override)</span>
                  </label>
                </div>
              )}

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Kurs Yo'nalishi:</label>
                  <select
                    className="form-select"
                    value={formData.courseId}
                    onChange={(e) => {
                      const selCourse = courses.find(
                        (c) => c.id === parseInt(e.target.value)
                      );
                      setFormData({
                        ...formData,
                        courseId: e.target.value,
                        monthlyFee: selCourse?.price || formData.monthlyFee,
                      });
                    }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({formatMoney(c.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Guruh Nomi:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder=""
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">O'qituvchi:</label>
                  <select
                    className="form-select"
                    value={formData.teacherId}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherId: e.target.value })
                    }
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dars Xonasi:</label>
                  <select
                    className="form-select"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} (Sig'im: {r.capacity} kishi)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Dars Kunlari:</label>
                  <select
                    className="form-select"
                    value={formData.scheduleDays}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduleDays: e.target.value })
                    }
                  >
                    <option value="Dushanba - Chorshanba - Juma">
                      Dushanba - Chorshanba - Juma
                    </option>
                    <option value="Seshanba - Payshanba - Shanba">
                      Seshanba - Payshanba - Shanba
                    </option>
                    <option value="Har Kuni">
                      Har Kuni (Intensiv)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dars Vaqti:</label>
                  <select
                    className="form-select"
                    value={formData.scheduleTime}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduleTime: e.target.value })
                    }
                  >
                    <option value="06:00 - 08:00">06:00 - 08:00</option>
                    <option value="08:00 - 10:00">08:00 - 10:00</option>
                    <option value="10:00 - 12:00">10:00 - 12:00</option>
                    <option value="14:00 - 16:00">14:00 - 16:00</option>
                    <option value="16:00 - 18:00">16:00 - 18:00</option>
                    <option value="18:00 - 20:00">18:00 - 20:00</option>
                    <option value="20:00 - 22:00">20:00 - 22:00</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Oylik Kurs To'lovi (so'm):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.monthlyFee}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyFee: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guruh Holati:</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Active">Faol (Darslar davom etmoqda)</option>
                    <option value="Finished">Yakunlangan (Bitirgan)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  className={`btn ${conflictsList && conflictsList.length > 0 ? "btn-danger-conflict" : "btn-primary"}`}
                >
                  {editingGroup ? "Guruhni Saqlash" : "Guruh Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
