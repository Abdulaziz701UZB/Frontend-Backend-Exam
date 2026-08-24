import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { teachersApi } from "../../services/api";
import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineBanknotes
} from "react-icons/hi2";
import { FaChalkboardUser } from "react-icons/fa6";

const Teachers = () => {
  const { canManageGroups } = useEduAuth();
  const toast = useToast();

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

  const subjectOptions = [
    "Frontend ReactJS",
    "Backend NodeJS / Express",
    "Python Backend (Django)",
    "Grafik Dizayn & UI/UX",
    "Ingliz tili (IELTS / CEFR)",
    "Matematika va SAT",
    "Mobil Dasturlash (Flutter)",
    "Cyber Security (Kiberxavfsizlik)",
    "Buxgalteriya va 1C",
    "Robototexnika va IT Kids",
    "Rus tili (So'zlashuv)",
    "Arab tili va Tajvid",
  ];

  const experienceOptions = [
    "1 yilgacha (Boshlang'ich)",
    "1 - 2 yil",
    "2 - 3 yil",
    "3 yil",
    "4 - 5 yil (Tajribali)",
    "5 - 7 yil",
    "7+ yil (Katta o'qituvchi / Lead)",
  ];

  const salaryOptions = [
    { value: 4000000, label: "4,000,000 so'm (Boshlang'ich)" },
    { value: 5000000, label: "5,000,000 so'm" },
    { value: 6000000, label: "6,000,000 so'm" },
    { value: 8000000, label: "8,000,000 so'm" },
    { value: 10000000, label: "10,000,000 so'm (Standart stavka)" },
    { value: 12000000, label: "12,000,000 so'm" },
    { value: 15000000, label: "15,000,000 so'm (Katta o'qituvchi)" },
    { value: 18000000, label: "18,000,000 so'm" },
    { value: 20000000, label: "20,000,000 so'm (Lead / Top ustoz)" },
    { value: 25000000, label: "25,000,000 so'm (Kafedra mudiri)" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await teachersApi.getAll();
      setTeachers(data);
    } catch (err) {
      console.error("Teachers load error:", err.message);
      toast.error("O'qituvchilar ro'yxatini yuklashda xatolik");
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
        toast.success(`"${formData.name}" ma'lumotlari yangilandi!`);
      } else {
        await teachersApi.create(payload);
        toast.success(`Yangi o'qituvchi "${formData.name}" qo'shildi!`);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Haqiqatan ham "${name}" o'qituvchisini o'chirmoqchisiz?`)) {
      try {
        await teachersApi.delete(id);
        toast.success(`"${name}" muvaffaqiyatli o'chirildi!`);
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
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
            placeholder="O'qituvchi ismi yoki fani bo'yicha qidiruv..."
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
                          onClick={() => handleDelete(t.id, t.name)}
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
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
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
                  placeholder="masalan: Sardor Rahimov"
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
                    placeholder="+998 90 123 45 67"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mutaxassisligi / Fani</label>
                  <select
                    className="form-select"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  >
                    {subjectOptions.map((subj, idx) => (
                      <option key={idx} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Oylik Maosh Stavkasi (so'm)
                  </label>
                  <select
                    className="form-select"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: parseFloat(e.target.value) })
                    }
                  >
                    {salaryOptions.map((sal, idx) => (
                      <option key={idx} value={sal.value}>
                        {sal.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tajribasi</label>
                  <select
                    className="form-select"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  >
                    {experienceOptions.map((exp, idx) => (
                      <option key={idx} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
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
