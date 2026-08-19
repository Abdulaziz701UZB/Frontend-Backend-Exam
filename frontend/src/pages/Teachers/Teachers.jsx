import { useState } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  getStoredData,
  setStoredData,
  INITIAL_TEACHERS,
  STORAGE,
} from "../../data/eduData";

const Teachers = () => {
  const { canManageGroups } = useEduAuth();
  const [teachers, setTeachers] = useState(() =>
    getStoredData(STORAGE.TEACHERS, INITIAL_TEACHERS),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "+998 90 599 06 00",
    subject: "Frontend ReactJS",
    salary: 10000000,
    experience: "3 yil",
    avatar: "👨‍🏫",
  });

  const saveToStorage = (updated) => {
    setTeachers(updated);
    setStoredData(STORAGE.TEACHERS, updated);
  };

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      phone: "+998 90 599 06 00",
      subject: "Frontend ReactJS",
      salary: 10000000,
      experience: "3 yil",
      avatar: "👨‍🏫",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      phone: t.phone,
      subject: t.subject,
      salary: t.salary,
      experience: t.experience,
      avatar: t.avatar,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      const updated = teachers.map((t) =>
        t.id === editingTeacher.id
          ? { ...t, ...formData, salary: parseFloat(formData.salary) }
          : t,
      );
      saveToStorage(updated);
    } else {
      const newTeacher = {
        id: Math.floor(100 + Math.random() * 900),
        ...formData,
        salary: parseFloat(formData.salary),
      };
      saveToStorage([newTeacher, ...teachers]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("O'qituvchini o'chirmoqchisiz?")) {
      saveToStorage(teachers.filter((t) => t.id !== id));
    }
  };

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMoney = (val) =>
    new Intl.NumberFormat("uz-UZ").format(val) + " so'm";

  return (
    <div className="teachers-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            👨‍🏫 5. O'qituvchilar va Xodimlar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            O'quv markazining barcha o'qituvchilari, mutaxassisliklari va maosh
            stavkalari
          </p>
        </div>
        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            ➕ Yangi O'qituvchi Qo'shish
          </button>
        )}
      </div>

      <div className="card filter-card mb-6">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input search-field"
            placeholder="O'qituvchi ismi yoki fani bo'yicha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>O'qituvchi F.I.SH</th>
                <th>Mutaxassisligi / Fani</th>
                <th>Telefon</th>
                <th>Tajribasi</th>
                <th>Oylik Maosh Stavkasi</th>
                {canManageGroups && <th className="text-center">Harakatlar</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="id-pill">#{t.id}</span>
                  </td>
                  <td>
                    <div className="student-name-cell">
                      <span className="avatar-circle">{t.avatar}</span>
                      <strong className="student-name-text">{t.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="group-tag-pill">{t.subject}</span>
                  </td>
                  <td>📞 {t.phone}</td>
                  <td>{t.experience}</td>
                  <td>
                    <strong className="text-emerald">
                      {formatMoney(t.salary)}
                    </strong>
                  </td>
                  {canManageGroups && (
                    <td className="text-center">
                      <div className="action-buttons-flex">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(t)}
                        >
                          ✏️ Tahrirlash
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(t.id)}
                        >
                          🗑️ O'chirish
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>
                {editingTeacher
                  ? "O'qituvchini Tahrirlash"
                  : "Yangi O'qituvchi Qo'shish"}
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
                <label className="form-label">O'qituvchi F.I.SH</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Telefon Raqami</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mutaxassisligi / Fani</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Oylik Maosh Stavkasi (so'm)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tajribasi</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTeacher ? "Saqlash" : "O'qituvchini Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
