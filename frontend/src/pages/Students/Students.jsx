import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { studentsApi, groupsApi, teachersApi } from "../../services/api";
import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone,
  HiOutlineArrowsRightLeft,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineAcademicCap,
  HiOutlineUser,
  HiOutlineArrowPath
} from "react-icons/hi2";
import { FaUserGraduate, FaChalkboardUser } from "react-icons/fa6";
import "./Students.css";

const Students = () => {
  const { canManageStudents } = useEduAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInputs, setSearchInputs] = useState({
    name: "",
    group: "All",
    phone: "",
    teacher: "All",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    group: "All",
    phone: "",
    teacher: "All",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferringStudent, setTransferringStudent] = useState(null);
  const [targetGroupId, setTargetGroupId] = useState("");
  const [transferReason, setTransferReason] = useState("O'quvchi / ota-ona istagi");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "+998 90 599 06 00",
    parentPhone: "+998 90 599 06 00",
    groupId: "G-101",
    paymentStatus: "Paid",
    balance: 0,
    status: "Active",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, groupsData, teachersData] = await Promise.all([
        studentsApi.getAll(),
        groupsApi.getAll(),
        teachersApi.getAll(),
      ]);
      setStudents(studentsData);
      setGroups(groupsData);
      setTeachers(teachersData);
    } catch (err) {
      toast.error("O'quvchilar ro'yxatini yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const action = searchParams.get("action");
    const studentId = searchParams.get("studentId") || searchParams.get("id");

    if ((action === "create" || action === "add") && !isModalOpen) {
      setEditingStudent(null);
      setFormData({
        fullName: "",
        phone: "+998 90 599 06 00",
        parentPhone: "+998 90 599 06 00",
        groupId: groups[0]?.id || "G-101",
        paymentStatus: "Paid",
        balance: 0,
        status: "Active",
      });
      setIsModalOpen(true);
    } else if (action === "transfer" && studentId && students.length > 0 && !isTransferModalOpen) {
      const s = students.find((item) => String(item.id) === String(studentId));
      if (s) {
        setTransferringStudent(s);
        const availableGroups = groups.filter((g) => g.id !== s.groupId);
        setTargetGroupId(availableGroups[0]?.id || "");
        setTransferReason("O'quvchi / ota-ona istagi");
        setIsTransferModalOpen(true);
      }
    } else if (action === "edit" && studentId && students.length > 0 && !isModalOpen) {
      const s = students.find((item) => String(item.id) === String(studentId));
      if (s) {
        setEditingStudent(s);
        setFormData({
          fullName: s.fullName,
          phone: s.phone,
          parentPhone: s.parentPhone,
          groupId: s.groupId,
          paymentStatus: s.paymentStatus,
          balance: s.balance,
          status: s.status,
        });
        setIsModalOpen(true);
      }
    }
  }, [searchParams, students, groups]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: "",
      phone: "+998 90 599 06 00",
      parentPhone: "+998 90 599 06 00",
      groupId: groups[0]?.id || "G-101",
      paymentStatus: "Paid",
      balance: 0,
      status: "Active",
    });
    setSearchParams({ action: "create" });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      phone: student.phone,
      parentPhone: student.parentPhone,
      groupId: student.groupId,
      paymentStatus: student.paymentStatus,
      balance: student.balance,
      status: student.status,
    });
    setSearchParams({ action: "edit", id: student.id });
    setIsModalOpen(true);
  };

  const openTransferModal = (student) => {
    setTransferringStudent(student);
    const availableGroups = groups.filter((g) => g.id !== student.groupId);
    setTargetGroupId(availableGroups[0]?.id || "");
    setTransferReason("O'quvchi / ota-ona istagi");
    setSearchParams({ action: "transfer", studentId: student.id });
    setIsTransferModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsTransferModalOpen(false);
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedFilters({ ...searchInputs });
    toast.success("Qidiruv natijalari yangilandi");
  };

  const handleResetFilters = () => {
    const emptyState = {
      name: "",
      group: "All",
      phone: "",
      teacher: "All",
    };
    setSearchInputs(emptyState);
    setAppliedFilters(emptyState);
    toast.success("Barcha qidiruv filtrlari tozalandi");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const groupObj = groups.find((g) => g.id === formData.groupId) || groups[0];
    const groupNameText = groupObj ? `${groupObj.name} (${groupObj.courseName})` : "";

    const payload = {
      full_name: formData.fullName,
      phone: formData.phone,
      parent_phone: formData.parentPhone,
      group_id: formData.groupId,
      group_name: groupNameText,
      payment_status: formData.paymentStatus,
      balance: parseFloat(formData.balance || 0),
      status: formData.status,
    };

    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, payload);
        toast.success("O'quvchi ma'lumotlari yangilandi!");
      } else {
        await studentsApi.create({
          id: `S-${Math.floor(100 + Math.random() * 900)}`,
          ...payload,
        });
        toast.success("Yangi o'quvchi ro'yxatdan o'tkazildi!");
      }
      await loadData();
      closeModals();
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferringStudent || !targetGroupId) return;

    const oldGroupId = transferringStudent.groupId;
    const oldGroupName = transferringStudent.groupName;
    const targetGroup = groups.find((g) => g.id === targetGroupId);

    try {
      await studentsApi.transferGroup(
        transferringStudent.id,
        targetGroupId,
        transferReason,
        oldGroupId,
        oldGroupName,
      );

      toast.success(
        `${transferringStudent.fullName} muvaffaqiyatli "${targetGroup?.name || targetGroupId}" guruhiga o'tkazildi!`,
      );
      await loadData();
      closeModals();
    } catch (err) {
      toast.error("O'tkazishda xatolik: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Haqiqatan ham ushbu o'quvchini o'chirmoqchisiz?")) {
      try {
        await studentsApi.delete(studentId);
        toast.success("O'quvchi tizimdan o'chirildi!");
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const filteredStudents = students.filter((s) => {
    const groupObj = groups.find((g) => g.id === s.groupId);
    const teacherObj = teachers.find((t) => t.id === groupObj?.teacherId) || { name: groupObj?.teacherName || "" };

    const nameMatch = appliedFilters.name.trim()
      ? (s.fullName || "").toLowerCase().includes(appliedFilters.name.toLowerCase().trim())
      : true;

    const groupMatch = appliedFilters.group && appliedFilters.group !== "All"
      ? (s.groupId === appliedFilters.group || (s.groupName || "").toLowerCase().includes(appliedFilters.group.toLowerCase().trim()))
      : true;

    const phoneMatch = appliedFilters.phone.trim()
      ? (() => {
          const rawQuery = appliedFilters.phone.replace(/\D/g, "");
          const rawPhone = (s.phone || "").replace(/\D/g, "");
          const rawParent = (s.parentPhone || "").replace(/\D/g, "");
          return rawPhone.includes(rawQuery) || rawParent.includes(rawQuery) || (s.phone || "").includes(appliedFilters.phone);
        })()
      : true;

    const teacherMatch = appliedFilters.teacher && appliedFilters.teacher !== "All"
      ? (teacherObj.name || "").toLowerCase().includes(appliedFilters.teacher.toLowerCase().trim()) || (groupObj?.teacherName || "").toLowerCase().includes(appliedFilters.teacher.toLowerCase().trim())
      : true;

    return nameMatch && groupMatch && phoneMatch && teacherMatch;
  });

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount || 0) + " so'm";
  };

  return (
    <div className="students-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <FaUserGraduate className="title-icon-indigo" />
            2. O'quvchilar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            Barcha o'quvchilar ro'yxati, to'lov balanslari va guruhlar o'rtasida o'tkazish (Transfer)
          </p>
        </div>

        {canManageStudents && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi O'quvchi Qo'shish
          </button>
        )}
      </div>

      <div className="student-search-card">
        <form onSubmit={handleSearchSubmit} className="student-filter-toolbar">
          <div className="filter-input-wrap">
            <HiOutlineUser className="filter-input-icon" />
            <input
              type="text"
              className="filter-input-field"
              placeholder="1. Ism bo'yicha qidirish..."
              value={searchInputs.name}
              onChange={(e) =>
                setSearchInputs({ ...searchInputs, name: e.target.value })
              }
            />
          </div>

          <div className="filter-input-wrap">
            <HiOutlineAcademicCap className="filter-input-icon" />
            <select
              className="filter-select-field"
              value={searchInputs.group}
              onChange={(e) =>
                setSearchInputs({ ...searchInputs, group: e.target.value })
              }
            >
              <option value="All">2. Barcha Guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.courseName})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-input-wrap">
            <HiOutlinePhone className="filter-input-icon" />
            <input
              type="text"
              className="filter-input-field"
              placeholder="3. Oxirgi 4 ta raqam / Tel..."
              value={searchInputs.phone}
              onChange={(e) =>
                setSearchInputs({ ...searchInputs, phone: e.target.value })
              }
            />
          </div>

          <div className="filter-input-wrap">
            <FaChalkboardUser className="filter-input-icon" />
            <select
              className="filter-select-field"
              value={searchInputs.teacher}
              onChange={(e) =>
                setSearchInputs({ ...searchInputs, teacher: e.target.value })
              }
            >
              <option value="All">4. Barcha O'qituvchilar</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.subject})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-search-trigger">
            <HiMagnifyingGlass /> Qidirish
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-reset-trigger"
            onClick={handleResetFilters}
            title="Filtrlarni tozalash"
          >
            <HiOutlineArrowPath /> Tozalash
          </button>
        </form>
      </div>

      <div className="card table-card">
        {loading ? (
          <div className="skeleton-wrap">
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>F.I.SH</th>
                  <th>Telefon Raqami</th>
                  <th>Guruhi</th>
                  <th>To'lov Holati</th>
                  <th>Balans</th>
                  <th>Holati</th>
                  {canManageStudents && (
                    <th className="text-center">Harakatlar</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-6">
                      Kiritilgan mezonlar bo'yicha hech qanday o'quvchi topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="student-name-cell">
                          <span className="avatar-circle">
                            <FaUserGraduate />
                          </span>
                          <span className="student-name-text">
                            {s.fullName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="phone-cell">
                          <span className="user-phone">
                            <HiOutlinePhone className="inline-icon-xs" /> {s.phone}
                          </span>
                          {s.parentPhone && (
                            <span className="parent-phone">
                              Ota-onasi: {s.parentPhone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="group-tag-pill">{s.groupName}</span>
                      </td>
                      <td>
                        <span
                          className={`status-pill pill-${(s.paymentStatus || "paid").toLowerCase()}`}
                        >
                          {s.paymentStatus === "Paid" ? (
                            <><HiOutlineCheckCircle className="inline-icon-xs" /> To'langan</>
                          ) : (
                            <><HiOutlineExclamationTriangle className="inline-icon-xs" /> Qarzdor</>
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`balance-tag ${
                            s.balance < 0 ? "balance-neg" : "balance-pos"
                          }`}
                        >
                          {formatMoney(s.balance)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            s.status === "Active"
                              ? "badge-active"
                              : "badge-finished"
                          }`}
                        >
                          {s.status === "Active" ? "Faol" : "Muzlatilgan"}
                        </span>
                      </td>

                      {canManageStudents && (
                        <td className="text-center">
                          <div className="action-buttons-flex">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openTransferModal(s)}
                              title="Guruhni O'zgartirish (Transfer)"
                            >
                              <HiOutlineArrowsRightLeft />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditModal(s)}
                              title="Tahrirlash"
                            >
                              <HiOutlinePencilSquare />
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteStudent(s.id)}
                              title="O'chirish"
                            >
                              <HiOutlineTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isTransferModalOpen && transferringStudent && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <HiOutlineArrowsRightLeft className="text-indigo" />
                Guruhlar O'rtasida O'tkazish (Transfer)
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModals}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit}>
              <div className="transfer-info-banner">
                <div><strong>O'quvchi:</strong> {transferringStudent.fullName}</div>
                <div><strong>Hozirgi Guruhi:</strong> {transferringStudent.groupName}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Qaysi Yangi Guruhga O'tkazilsin:</label>
                <select
                  className="form-select"
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  required
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.courseName}) • Ustoz: {g.teacherName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">O'tkazish Sababi / Izoh:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="masalan: Dars vaqti to'g'ri kelmaganligi sababli kechki guruhga o'tkazildi"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-flex">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Bekor Qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  <HiOutlineCheckCircle /> Guruhni O'zgartirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FaUserGraduate className="title-icon-indigo" />
                {editingStudent
                  ? "O'quvchi Ma'lumotlarini Tahrirlash"
                  : "Yangi O'quvchi Ro'yxatdan O'tkazish"}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModals}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">O'quvchi F.I.SH:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="masalan: Abdulaziz Abdulhayev"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefon Raqami:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+998 90 123 45 67"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Ota-onasi Telefoni:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+998 90 987 65 43"
                    value={formData.parentPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, parentPhone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tegishli Guruh:</label>
                  <select
                    className="form-select"
                    value={formData.groupId}
                    onChange={(e) =>
                      setFormData({ ...formData, groupId: e.target.value })
                    }
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.courseName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">To'lov Holati:</label>
                  <select
                    className="form-select"
                    value={formData.paymentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentStatus: e.target.value,
                      })
                    }
                  >
                    <option value="Paid">To'langan (Qarzsiz)</option>
                    <option value="Overdue">Qarzdorlik Mavjud</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Balans / Qarz (so'm):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Bekor Qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? "Saqlash" : "Ro'yxatdan O'tkazish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
