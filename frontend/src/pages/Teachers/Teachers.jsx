import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { teachersApi } from "../../services/api";
import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone
} from "react-icons/hi2";
import { FaChalkboardUser } from "react-icons/fa6";

const Teachers = () => {
  const { canManageGroups } = useEduAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "+998 90 599 06 00",
    subject: "Frontend ReactJS",
    salary: 10000000,
    experience: "3 yil",
    avatar: "teacher",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await teachersApi.getAll();
      setTeachers(data);
    } catch (err) {
      console.error("Teachers load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      phone: "+998 90 599 06 00",
      subject: "Frontend ReactJS",
      salary: 10000000,
      experience: "3 yil",
      avatar: "teacher",
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
      avatar: t.avatar || "teacher",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      phone: formData.phone,
      subject: formData.subject,
      salary: parseFloat(formData.salary || 0),
      experience: formData.experience,
      avatar: formData.avatar,
    };

    try {
      if (editingTeacher) {
        await teachersApi.update(editingTeacher.id, payload);
      } else {
        await teachersApi.create(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("O'qituvchini o'chirmoqchisiz?")) {
      try {
        await teachersApi.delete(id);
        await loadData();
      } catch (err) {
        alert("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const filtered = teachers.filter(
    (t) =>
      (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMoney = (val) =>
    new Intl.NumberFormat("uz-UZ").format(val || 0) + " so'm";

  return (
    <div className="teachers-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <FaChalkboardUser style={{ verticalAlign: 'middle', marginRight: 6 }} />
            5. O'qituvchilar va Xodimlar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            O'quv markazining barcha o'qituvchilari, mutaxassisliklari va maosh
            stavkalari
          </p>
        </div>
        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi O'qituvchi Qo'shish
          </button>
        )}
      </div>

      <div className="card filter-card mb-6">
        <div className="search-input-wrap">
          <span className="search-icon"><HiMagnifyingGlass /></span>
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
                      <span className="avatar-circle"><FaChalkboardUser /></span>
                      <strong className="student-name-text">{t.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="group-tag-pill">{t.subject}</span>
                  </td>
                  <td>
                    <HiOutlinePhone style={{ verticalAlign: 'middle', marginRight: 2 }} />
                    {t.phone}
                  </td>
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
                          <HiOutlinePencilSquare /> Tahrirlash
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(t.id)}
                        >
                          <HiOutlineTrash /> O'chirish
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
                aria-label="Yopish"
              >
                <HiXMark />
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
