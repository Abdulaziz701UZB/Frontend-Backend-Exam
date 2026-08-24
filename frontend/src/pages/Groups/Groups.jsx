import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { groupsApi, coursesApi, teachersApi, roomsApi } from "../../services/api";
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
  HiOutlineCheckCircle
} from "react-icons/hi2";
import { FaChalkboardUser, FaDoorClosed } from "react-icons/fa6";
import "./Groups.css";

const Groups = () => {
  const { canManageGroups } = useEduAuth();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [allowConflictSave, setAllowConflictSave] = useState(false);

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
      const [groupsData, coursesData, teachersData, roomsData] = await Promise.all([
        groupsApi.getAll(),
        coursesApi.getAll(),
        teachersApi.getAll(),
        roomsApi.getAll(),
      ]);
      setGroups(groupsData);
      setCourses(coursesData);
      setTeachers(teachersData);
      setRooms(roomsData);
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
          (g.room || "").trim().toLowerCase() === (formData.room || "").trim().toLowerCase()
        ) {
          conflicts.push({
            type: "room",
            message: `Xona band: "${formData.room}" ayni shu vaqtda "${g.name}" (${g.courseName}) guruhi tomonidan band qilingan!`,
            conflictedWith: g.name,
          });
        }

        if (parseInt(g.teacherId) === parseInt(formData.teacherId)) {
          const teacherObj = teachers.find(
            (t) => t.id === parseInt(formData.teacherId),
          );
          conflicts.push({
            type: "teacher",
            message: `O'qituvchi band: ${teacherObj?.name || "O'qituvchi"} ayni shu vaqtda "${g.name}" guruhida dars o'tadi!`,
            conflictedWith: g.name,
          });
        }
      }
    });

    return conflicts.length > 0 ? conflicts : null;
  };

  const activeConflicts = checkScheduleConflict();

  const openCreateModal = () => {
    setEditingGroup(null);
    setAllowConflictSave(false);
    const defaultRoom = rooms[0]?.name || "201-xona (Kompyuter zali)";
    setFormData({
      courseId: courses[0]?.id || 1,
      name: "",
      teacherId: teachers[0]?.id || 101,
      room: defaultRoom,
      scheduleDays: "Dushanba - Chorshanba - Juma",
      scheduleTime: "14:00 - 16:00",
      monthlyFee: courses[0]?.price || 850000,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setAllowConflictSave(false);
    setFormData({
      courseId: group.courseId,
      name: group.name,
      teacherId: group.teacherId,
      room: group.room,
      scheduleDays: group.scheduleDays,
      scheduleTime: group.scheduleTime,
      monthlyFee: group.monthlyFee,
      status: group.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (activeConflicts && !allowConflictSave) {
      toast.warning(
        "Diqqat! Xona yoki o'qituvchi dars jadvalida to'qnashuv aniqlandi. Iltimos, xona yoki vaqtni o'zgartiring!",
      );
      return;
    }

    const courseObj =
      courses.find((c) => c.id === parseInt(formData.courseId)) || courses[0];
    const teacherObj =
      teachers.find((t) => t.id === parseInt(formData.teacherId)) ||
      teachers[0];

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
      overrideConflict: allowConflictSave,
    };

    try {
      if (editingGroup) {
        await groupsApi.update(editingGroup.id, payload);
        toast.success(`"${formData.name}" guruhi yangilandi!`);
      } else {
        await groupsApi.create({
          id: `G-${Math.floor(100 + Math.random() * 900)}`,
          ...payload,
        });
        toast.success(`"${formData.name}" yangi guruhi yaratildi!`);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (
      window.confirm(
        `Haqiqatan ham "${groupName || groupId}" guruhini o'chirmoqchimisiz?`,
      )
    ) {
      try {
        await groupsApi.delete(groupId);
        toast.success(`"${groupName}" guruhi o'chirildi!`);
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const filteredGroups = groups.filter((g) => {
    if (filterStatus !== "All" && g.status !== filterStatus) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        (g.name || "").toLowerCase().includes(s) ||
        (g.courseName || "").toLowerCase().includes(s) ||
        (g.teacherName || "").toLowerCase().includes(s) ||
        (g.room || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount || 0) + " so'm";
  };

  const selectedRoomObj = rooms.find((r) => r.name === formData.room);

  return (
    <div className="groups-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineAcademicCap className="title-icon-indigo" />
            Kurslar va Guruhlar
          </h1>
          <p className="page-subtitle">
            O'quv markazining barcha faol va yakunlangan dars guruhlari hamda
            avtomatik to'qnashuv detektori
          </p>
        </div>
        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi Guruh Yaratish
          </button>
        )}
      </div>

      <div className="card filter-card">
        <div className="filter-row">
          <div className="search-input-wrap">
            <span className="search-icon"><HiMagnifyingGlass /></span>
            <input
              type="text"
              className="form-input search-field"
              placeholder="Guruh, kurs, o'qituvchi yoki xona bo'yicha qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-pills">
            {["All", "Active", "Finished", "Upcoming"].map((status) => (
              <button
                key={status}
                className={`pill-btn ${filterStatus === status ? "active" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status === "All"
                  ? "Barcha Guruhlar"
                  : status === "Active"
                    ? "Faol Guruhlar"
                    : status === "Finished"
                      ? "Bitirganlar"
                      : "Yaqinda Ochiladigan"}
              </button>
            ))}
          </div>
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
          filteredGroups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="group-card-header">
                <span className="group-id-badge">{group.id}</span>
                <span
                  className={`status-pill ${group.status === "Active" ? "pill-paid" : "pill-overdue"}`}
                >
                  {group.status === "Active" ? "Faol" : "Yakunlangan"}
                </span>
              </div>

              <h3 className="group-name">{group.name}</h3>
              <p className="group-course">{group.courseName}</p>

              <div className="group-details-list">
                <div className="detail-item">
                  <span className="detail-icon"><FaChalkboardUser /></span>
                  <div>
                    <label>O'qituvchi</label>
                    <p>{group.teacherName}</p>
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
                    <label>Oylik To'lov</label>
                    <p className="font-bold">{formatMoney(group.monthlyFee)}</p>
                  </div>
                </div>
              </div>

              {canManageGroups && (
                <div className="group-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(group)}
                  >
                    <HiOutlinePencilSquare /> Tahrirlash
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                  >
                    <HiOutlineTrash /> O'chirish
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingGroup ? "Guruhni Tahrirlash" : "Yangi Guruh Yaratish"}
              </h2>
              <button
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">
                  Guruh Nomi (Masalan: F-12 Guruh)
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Guruh nomini kiriting"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Tegishli Kurs</label>
                  <select
                    className="form-select"
                    value={formData.courseId}
                    onChange={(e) => {
                      const selCourse = courses.find((c) => c.id === parseInt(e.target.value));
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
                  <label className="form-label">O'qituvchi</label>
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
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Dars Kunlari</label>
                  <select
                    className="form-select"
                    value={formData.scheduleDays}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduleDays: e.target.value })
                    }
                  >
                    <option value="Dushanba - Chorshanba - Juma">
                      Dushanba - Chorshanba - Juma (Toq kunlar)
                    </option>
                    <option value="Seshanba - Payshanba - Shanba">
                      Seshanba - Payshanba - Shanba (Juft kunlar)
                    </option>
                    <option value="Har kuni">Har kuni (Intensiv)</option>
                    <option value="Shanba - Yakshanba">
                      Shanba - Yakshanba (Weekend)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dars Vaqti</label>
                  <select
                    className="form-select"
                    value={formData.scheduleTime}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduleTime: e.target.value })
                    }
                  >
                    <option value="09:00 - 11:00">09:00 - 11:00</option>
                    <option value="11:00 - 13:00">11:00 - 13:00</option>
                    <option value="14:00 - 16:00">14:00 - 16:00</option>
                    <option value="16:00 - 18:00">16:00 - 18:00</option>
                    <option value="18:00 - 20:00">18:00 - 20:00</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Dars Xonasi {selectedRoomObj ? `(Sig'imi: ${selectedRoomObj.capacity} kishi)` : ""}
                  </label>
                  <select
                    className="form-select"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                  >
                    {rooms.length > 0 ? (
                      rooms.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} — Sig'imi: {r.capacity} kishi
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="201-xona (Kompyuter zali)">201-xona (Kompyuter zali)</option>
                        <option value="202-xona (Dizayn Lab)">202-xona (Dizayn Lab)</option>
                        <option value="203-xona (Backend Lab)">203-xona (Backend Lab)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Oylik Kurs To'lovi</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.monthlyFee}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyFee: e.target.value })
                    }
                  />
                </div>
              </div>

              {activeConflicts && (
                <div className="conflict-alert-box">
                  <div className="conflict-alert-header">
                    <HiOutlineExclamationTriangle className="conflict-alert-icon" />
                    <span>Dars Jadvali To'qnashuvi Aniqlandi!</span>
                  </div>
                  <ul className="conflict-list">
                    {activeConflicts.map((c, idx) => (
                      <li key={idx}>{c.message}</li>
                    ))}
                  </ul>
                  <label className="conflict-override-checkbox">
                    <input
                      type="checkbox"
                      checked={allowConflictSave}
                      onChange={(e) => setAllowConflictSave(e.target.checked)}
                    />
                    <span>Ogohlantirishga qaramay saqlashga ruxsat berish (Admin Override)</span>
                  </label>
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGroup ? "Guruhni Yangilash" : "Guruhni Yaratish"}
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
