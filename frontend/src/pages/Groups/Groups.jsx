import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  getStoredData,
  setStoredData,
  INITIAL_GROUPS,
  INITIAL_COURSES,
  INITIAL_TEACHERS,
  STORAGE,
} from "../../data/eduData";
import "./Groups.css";

const Groups = () => {
  const { canManageGroups } = useEduAuth();

  const [groups, setGroups] = useState(() =>
    getStoredData(STORAGE.GROUPS, INITIAL_GROUPS),
  );
  const [courses] = useState(() =>
    getStoredData(STORAGE.COURSES, INITIAL_COURSES),
  );
  const [teachers] = useState(() => INITIAL_TEACHERS);

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

  const checkScheduleConflict = () => {
    if (formData.status !== "Active") return null;

    const conflicts = [];
    const currentGroupId = editingGroup?.id;

    groups.forEach((g) => {
      if (g.id === currentGroupId || g.status !== "Active") return;

      const sameDays =
        g.scheduleDays.trim().toLowerCase() ===
        formData.scheduleDays.trim().toLowerCase();
      const sameTime =
        g.scheduleTime.trim().toLowerCase() ===
        formData.scheduleTime.trim().toLowerCase();

      if (sameDays && sameTime) {
        if (
          g.room.trim().toLowerCase() === formData.room.trim().toLowerCase()
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

  const saveGroupsToStorage = (updated) => {
    setGroups(updated);
    setStoredData(STORAGE.GROUPS, updated);
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setAllowConflictSave(false);
    setFormData({
      courseId: courses[0]?.id || 1,
      name: "",
      teacherId: teachers[0]?.id || 101,
      room: "201-xona (Kompyuter zali)",
      scheduleDays: "Dushanba - Chorshanba - Juma",
      scheduleTime: "14:00 - 16:00",
      monthlyFee: 850000,
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

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (activeConflicts && !allowConflictSave) {
      alert(
        "⚠️ Diqqat! Xona yoki o'qituvchi dars jadvalida to'qnashuv aniqlandi. Iltimos, xona yoki vaqtni o'zgartiring, yoki 'Ogohlantirishga qaramay saqlash' katakchasini belgilang.",
      );
      return;
    }

    const courseObj =
      courses.find((c) => c.id === parseInt(formData.courseId)) || courses[0];
    const teacherObj =
      teachers.find((t) => t.id === parseInt(formData.teacherId)) ||
      teachers[0];

    if (editingGroup) {
      const updated = groups.map((g) => {
        if (g.id === editingGroup.id) {
          return {
            ...g,
            ...formData,
            courseName: courseObj?.name,
            teacherName: teacherObj?.name || "Abdulaziz Abdulhayev",
            monthlyFee: parseFloat(formData.monthlyFee),
          };
        }
        return g;
      });
      saveGroupsToStorage(updated);
    } else {
      const newGroup = {
        id: `G-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        courseName: courseObj?.name,
        teacherName: teacherObj?.name,
        monthlyFee: parseFloat(formData.monthlyFee),
        startDate: new Date().toISOString().split("T")[0],
      };
      saveGroupsToStorage([newGroup, ...groups]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteGroup = (groupId) => {
    if (
      window.confirm(
        "Haqiqatan ham ushbu guruhni yopmoqchisiz/o'chirmoqchisiz?",
      )
    ) {
      const updated = groups.filter((g) => g.id !== groupId);
      saveGroupsToStorage(updated);
    }
  };

  const filteredGroups = groups.filter((g) => {
    if (filterStatus !== "All" && g.status !== filterStatus) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        g.name.toLowerCase().includes(s) ||
        g.courseName.toLowerCase().includes(s) ||
        g.teacherName.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  return (
    <div className="groups-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">📚 Kurslar va Guruhlar</h1>
          <p className="page-subtitle">
            O'quv markazining barcha faol va yakunlangan dars guruhlari hamda
            avtomatik to'qnashuv detektori
          </p>
        </div>
        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            ➕ Yangi Guruh Yaratish
          </button>
        )}
      </div>

      <div className="card filter-card">
        <div className="filter-row">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input search-field"
              placeholder="Guruh, kurs yoki o'qituvchi bo'yicha qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-pills">
            <button
              className={`pill-btn ${filterStatus === "All" ? "active" : ""}`}
              onClick={() => setFilterStatus("All")}
            >
              Barchasi ({groups.length})
            </button>
            <button
              className={`pill-btn ${filterStatus === "Active" ? "active" : ""}`}
              onClick={() => setFilterStatus("Active")}
            >
              Faol Guruhlar (
              {groups.filter((g) => g.status === "Active").length})
            </button>
            <button
              className={`pill-btn ${filterStatus === "Finished" ? "active" : ""}`}
              onClick={() => setFilterStatus("Finished")}
            >
              Yakunlanganlar (
              {groups.filter((g) => g.status === "Finished").length})
            </button>
          </div>
        </div>
      </div>

      <div className="groups-grid">
        {filteredGroups.length === 0 ? (
          <div className="card empty-card">
            <h3>Guruhlar topilmadi</h3>
            <p>Qidiruv so'rovini yoki filtrni o'zgartiring</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="group-card-header">
                <span className="group-id-badge">{group.id}</span>
                <span
                  className={`status-badge badge-${group.status.toLowerCase()}`}
                >
                  {group.status === "Active" ? "🟢 Faol" : "⚪ Yakunlangan"}
                </span>
              </div>

              <h3 className="group-name">{group.name}</h3>
              <p className="group-course">🎓 {group.courseName}</p>

              <div className="group-details-list">
                <div className="detail-item">
                  <span className="detail-icon">👨‍🏫</span>
                  <div>
                    <label>O'qituvchi</label>
                    <p>{group.teacherName}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">🗓️</span>
                  <div>
                    <label>Dars Kunlari</label>
                    <p>{group.scheduleDays}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">⏰</span>
                  <div>
                    <label>Dars Vaqti</label>
                    <p>{group.scheduleTime}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <div>
                    <label>Xona</label>
                    <p>{group.room}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <div>
                    <label>Oylik To'lov</label>
                    <p className="font-bold text-indigo">
                      {formatMoney(group.monthlyFee)}
                    </p>
                  </div>
                </div>
              </div>

              {canManageGroups && (
                <div className="group-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(group)}
                  >
                    ✏️ Tahrirlash
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    🗑️ O'chirish
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>
                {editingGroup ? "Guruhni Tahrirlash" : "Yangi Guruh Yaratish"}
              </h2>
              <button
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
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
                    onChange={(e) =>
                      setFormData({ ...formData, courseId: e.target.value })
                    }
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
                    <option value="10:00 - 12:00">10:00 - 12:00</option>
                    <option value="14:00 - 16:00">14:00 - 16:00</option>
                    <option value="16:30 - 18:30">16:30 - 18:30</option>
                    <option value="18:30 - 20:30">18:30 - 20:30</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Dars Xonasi</label>
                  <select
                    className="form-select"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                  >
                    <option value="201-xona (Kompyuter zali)">
                      201-xona (Kompyuter zali)
                    </option>
                    <option value="202-xona (Dizayn Lab)">
                      202-xona (Dizayn Lab)
                    </option>
                    <option value="203-xona (Backend Lab)">
                      203-xona (Backend Lab)
                    </option>
                    <option value="102-xona (Media xona)">
                      102-xona (Media xona)
                    </option>
                    <option value="301-xona (Yangi Lab)">
                      301-xona (Yangi Lab)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Oylik To'lov Miqdori (so'm)
                  </label>
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

              <div className="form-group">
                <label className="form-label">Guruh Holati</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Active">Active (Darslar davom etmoqda)</option>
                  <option value="Finished">Finished (Guruh yakunlangan)</option>
                </select>
              </div>

              {activeConflicts && (
                <div className="conflict-alert-box">
                  <div className="conflict-alert-header">
                    <span className="conflict-alert-icon">⚠️</span>
                    <strong>Jadvalda To'qnashuv (Conflict) Aniqlandi!</strong>
                  </div>
                  <ul className="conflict-list">
                    {activeConflicts.map((c, i) => (
                      <li key={i}>
                        {c.type === "room" ? "🚪 " : "👨‍🏫 "} {c.message}
                      </li>
                    ))}
                  </ul>
                  <label className="conflict-override-checkbox">
                    <input
                      type="checkbox"
                      checked={allowConflictSave}
                      onChange={(e) => setAllowConflictSave(e.target.checked)}
                    />
                    <span>
                      Ogohlantirishga qaramay baribir saqlash (Force Override)
                    </span>
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
                <button
                  type="submit"
                  className={`btn ${activeConflicts && !allowConflictSave ? "btn-danger" : "btn-primary"}`}
                >
                  {editingGroup ? "Guruhni Saqlash" : "Guruhni Yaratish"}
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
