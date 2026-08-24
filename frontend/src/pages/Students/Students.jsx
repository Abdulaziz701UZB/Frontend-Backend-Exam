import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { studentsApi, groupsApi } from "../../services/api";
import {
  HiOutlinePlus,
  HiMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineUser,
  HiOutlineArrowsRightLeft,
  HiOutlineAcademicCap,
  HiOutlineSparkles
} from "react-icons/hi2";
import { FaUserGraduate } from "react-icons/fa6";
import "./Students.css";

const Students = () => {
  const { canManageStudents } = useEduAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("All");

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
      const [studentsData, groupsData] = await Promise.all([
        studentsApi.getAll(),
        groupsApi.getAll(),
      ]);
      setStudents(studentsData);
      setGroups(groupsData);
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
        await studentsApi.create(payload);
        toast.success("Yangi o'quvchi muvaffaqiyatli qo'shildi!");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik: " + (err.response?.data?.error || err.message));
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferringStudent || !targetGroupId) return;

    const targetGroupObj = groups.find((g) => g.id === targetGroupId);
    const targetGroupName = targetGroupObj
      ? `${targetGroupObj.name} (${targetGroupObj.courseName})`
      : targetGroupId;

    try {
      await studentsApi.transfer(transferringStudent.id, {
        newGroupId: targetGroupId,
        newGroupName: targetGroupName,
        transferReason: transferReason,
      });
      toast.success(`${transferringStudent.fullName} yangi guruhga (${targetGroupName}) muvaffaqiyatli o'tkazildi!`);
      setIsTransferModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error("Guruhni o'zgartirishda xatolik: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (
      window.confirm(
        "Haqiqatan ham ushbu o'quvchini guruhdan chiqarmoqchisiz/arxivlamoqchisiz?",
      )
    ) {
      try {
        await studentsApi.delete(studentId);
        toast.success("O'quvchi muvaffaqiyatli o'chirildi!");
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const filteredStudents = students.filter((s) => {
    if (selectedGroupFilter !== "All" && s.groupId !== selectedGroupFilter)
      return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        (s.fullName || "").toLowerCase().includes(q) ||
        (s.phone || "").includes(q) ||
        (s.groupName || "").toLowerCase().includes(q)
      );
    }
    return true;
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
            O'quvchilar Boshqaruvi
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

      <div className="card filter-card">
        <div className="filter-controls-row">
          <div className="search-box">
            <HiMagnifyingGlass className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="O'quvchi ismi, telefon yoki guruh bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="group-filter-wrap">
            <label className="filter-label">Guruh:</label>
            <select
              className="form-select"
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
            >
              <option value="All">Barcha Guruhlar</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
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
                    <td colSpan="7" className="text-center text-muted">
                      Hech qanday o'quvchi topilmadi
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
                              title="Guruhni O'zgartirish (Transfer #18)"
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
                    value={formData.parentPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, parentPhone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Biriktirilgan Guruh:</label>
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
                      setFormData({ ...formData, paymentStatus: e.target.value })
                    }
                  >
                    <option value="Paid">To'langan (Paid)</option>
                    <option value="Overdue">Qarzdorlik bor (Overdue)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Balans (so'm):</label>
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

              <div className="form-group">
                <label className="form-label">O'qish Holati (Status):</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Active">Faol O'qimoqda</option>
                  <option value="Inactive">Muzlatilgan / Bitirgan</option>
                </select>
              </div>

              <div className="modal-actions-flex">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor Qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  <HiOutlineCheckCircle /> Saqlash
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
