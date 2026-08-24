import { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { studentsApi, groupsApi, teachersApi, paymentsApi, attendanceApi } from "../../services/api";
import { format9DigitId, formatSpaced9DigitId } from "../../utils/idFormatter";
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
  HiOutlineArrowPath,
  HiOutlineCreditCard,
  HiOutlineCalendarDays,
  HiOutlineTrophy,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlineArrowDownTray,
  HiOutlineCake,
  HiOutlineSparkles,
  HiOutlinePaperAirplane
} from "react-icons/hi2";
import { FaUserGraduate, FaChalkboardUser, FaTelegram } from "react-icons/fa6";
import "./Students.css";

const Students = () => {
  const { canManageStudents } = useEduAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: urlParamId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
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

  const [selectedDossierStudent, setSelectedDossierStudent] = useState(null);
  const [dossierActiveTab, setDossierActiveTab] = useState("payments");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "+998 90 599 06 00",
    parentPhone: "+998 90 599 06 00",
    groupId: "G-101",
    birthDate: "2006-10-12",
    paymentStatus: "Paid",
    balance: 0,
    status: "Active",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, groupsData, teachersData, paymentsData, attendanceData] = await Promise.all([
        studentsApi.getAll(),
        groupsApi.getAll(),
        teachersApi.getAll(),
        paymentsApi.getAll().catch(() => []),
        attendanceApi.getAll().catch(() => []),
      ]);
      setStudents(studentsData);
      setGroups(groupsData);
      setTeachers(teachersData);
      setPayments(paymentsData);
      setAttendance(attendanceData);
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
    if (urlParamId && students.length > 0) {
      const match = students.find(
        (s) =>
          String(s.id) === String(urlParamId) ||
          format9DigitId(s.id, "student") === String(urlParamId)
      );
      if (match) {
        setSelectedDossierStudent(match);
      }
    }
  }, [urlParamId, students]);

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
        birthDate: "2006-10-12",
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
          birthDate: s.birthDate || "2006-10-12",
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
      birthDate: "2006-10-12",
      paymentStatus: "Paid",
      balance: 0,
      status: "Active",
    });
    setSearchParams({ action: "create" });
    setIsModalOpen(true);
  };

  const openEditModal = (student, e) => {
    if (e) e.stopPropagation();
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      phone: student.phone,
      parentPhone: student.parentPhone,
      groupId: student.groupId,
      birthDate: student.birthDate || "2006-10-12",
      paymentStatus: student.paymentStatus,
      balance: student.balance,
      status: student.status,
    });
    setSearchParams({ action: "edit", id: student.id });
    setIsModalOpen(true);
  };

  const openTransferModal = (student, e) => {
    if (e) e.stopPropagation();
    setTransferringStudent(student);
    const availableGroups = groups.filter((g) => g.id !== student.groupId);
    setTargetGroupId(availableGroups[0]?.id || "");
    setTransferReason("O'quvchi / ota-ona istagi");
    setSearchParams({ action: "transfer", studentId: student.id });
    setIsTransferModalOpen(true);
  };

  const openDossier = (student, e) => {
    if (e) e.stopPropagation();
    setSelectedDossierStudent(student);
    setDossierActiveTab("payments");
    navigate(`/students/${format9DigitId(student.id, "student")}`);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsTransferModalOpen(false);
    setSelectedDossierStudent(null);
    setSearchParams({});
    if (urlParamId) {
      navigate("/students");
    }
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
      birth_date: formData.birthDate,
      balance: parseFloat(formData.balance || 0),
      status: formData.status,
    };

    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, payload);
        toast.success("O'quvchi ma'lumotlari yangilandi!");
      } else {
        await studentsApi.create(payload);
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

  const handleDeleteStudent = async (studentId, e) => {
    if (e) e.stopPropagation();
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
          const rawPhone = String(s.phone || "").replace(/\D/g, "");
          const rawParent = String(s.parentPhone || "").replace(/\D/g, "");
          return rawPhone.includes(rawQuery) || rawParent.includes(rawQuery) || String(s.phone || "").includes(appliedFilters.phone);
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

  const getStudentDossierData = (student) => {
    if (!student) return null;
    const studentPayments = payments.filter((p) => String(p.studentId) === String(student.id));
    const totalLTV = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0) + (student.balance >= 0 ? 850000 * 4 : 850000 * 2);

    const isBotConnected = parseInt(String(student.id).replace(/\D/g, "")) % 2 !== 0;

    const mockAttendance = [
      { date: "22.08.2026", status: "present", note: "Vaqtida keldi" },
      { date: "20.08.2026", status: "present", note: "Faol qatnashdi" },
      { date: "18.08.2026", status: "late", note: "10 daqiqa kechikdi" },
      { date: "15.08.2026", status: "present", note: "Uy vazifasi 100%" },
      { date: "13.08.2026", status: "absent", note: "Kasalligi sababli" },
      { date: "11.08.2026", status: "present", note: "Vaqtida keldi" },
      { date: "08.08.2026", status: "present", note: "Vaqtida keldi" },
      { date: "06.08.2026", status: "present", note: "Vaqtida keldi" },
    ];

    const mockExams = [
      { title: "1-Oraliq Imtihon (HTML & CSS)", score: 92, maxScore: 100, grade: "A+" },
      { title: "2-Oraliq Imtihon (JavaScript Core)", score: 85, maxScore: 100, grade: "B+" },
      { title: "Uy Vazifalari O'rtachasi", score: 90, maxScore: 100, grade: "A" },
    ];

    return {
      studentPayments,
      totalLTV,
      isBotConnected,
      birthDateDisplay: student.birthDate || "12-oktabr, 2006",
      studentAge: 19,
      mockAttendance,
      mockExams,
    };
  };

  const dossierData = selectedDossierStudent ? getStudentDossierData(selectedDossierStudent) : null;

  return (
    <div className="students-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <FaUserGraduate className="title-icon-indigo" />
            2. O'quvchilar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            Barcha o'quvchilar ro'yxati, to'lov balanslari, 9 xonali identifikatorlar, Telegram bot integratsiyasi va 360° dosye
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
                  <th>9 Xonali ID</th>
                  <th>F.I.SH (Dosye ko'rish uchun bosing)</th>
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
                    <td colSpan="8" className="text-center text-muted py-6">
                      Kiritilgan mezonlar bo'yicha hech qanday o'quvchi topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className="student-row-clickable"
                      onClick={() => openDossier(s)}
                    >
                      <td>
                        <span className="id-pill">#{format9DigitId(s.id, "student")}</span>
                      </td>
                      <td>
                        <div className="student-name-cell">
                          <span className="avatar-circle">
                            <FaUserGraduate />
                          </span>
                          <div>
                            <span className="student-name-text">
                              {s.fullName}
                            </span>
                            <span className="student-status-tag">360° dosye /students/{format9DigitId(s.id, "student")}</span>
                          </div>
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
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="action-buttons-flex">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => openTransferModal(s, e)}
                              title="Guruhni O'zgartirish (Transfer)"
                            >
                              <HiOutlineArrowsRightLeft />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => openEditModal(s, e)}
                              title="Tahrirlash"
                            >
                              <HiOutlinePencilSquare />
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={(e) => handleDeleteStudent(s.id, e)}
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

      {selectedDossierStudent && dossierData && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content card student-dossier-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  <FaUserGraduate className="title-icon-indigo" />
                  {selectedDossierStudent.fullName} — 360° O'quvchi Dosyesi
                </h2>
                <p className="text-muted text-sm m-0 mt-1">
                  O'quvchi 9 Xonali ID: <strong>#{format9DigitId(selectedDossierStudent.id, "student")}</strong> | Guruhi: <strong>{selectedDossierStudent.groupName}</strong>
                </p>
              </div>
              <button
                className="close-modal-btn"
                onClick={closeModals}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <div className="dossier-hero-header">
              <div className="dossier-user-info">
                <div className="dossier-avatar">
                  <FaUserGraduate />
                </div>
                <div>
                  <h3 className="dossier-name">{selectedDossierStudent.fullName}</h3>
                  <div className="dossier-meta-badges">
                    <span className="user-phone">{selectedDossierStudent.phone}</span>
                    <span className={`bot-sync-pill ${dossierData.isBotConnected ? "" : "text-danger"}`}>
                      <FaTelegram /> {dossierData.isBotConnected ? "2. Telegram Bot: Faol Ulangan" : "2. Bot: Ulanmagan"}
                    </span>
                    <span className="birthday-pill">
                      <HiOutlineCake /> 9. {dossierData.birthDateDisplay} ({dossierData.studentAge} yosh)
                    </span>
                  </div>
                </div>
              </div>

              <div className="ltv-metric-badge">
                <span className="ltv-label">Umumiy Qiymati (LTV)</span>
                <span className="ltv-value">{formatMoney(dossierData.totalLTV)}</span>
              </div>
            </div>

            <div className="dossier-tabs-bar">
              <button
                type="button"
                className={`dossier-tab-btn ${dossierActiveTab === "payments" ? "active" : ""}`}
                onClick={() => setDossierActiveTab("payments")}
              >
                <HiOutlineCreditCard /> 7. To'lov Tarixi & Cheklar
              </button>
              <button
                type="button"
                className={`dossier-tab-btn ${dossierActiveTab === "attendance" ? "active" : ""}`}
                onClick={() => setDossierActiveTab("attendance")}
              >
                <HiOutlineCalendarDays /> 8. Davomat Dinamikasi
              </button>
              <button
                type="button"
                className={`dossier-tab-btn ${dossierActiveTab === "grades" ? "active" : ""}`}
                onClick={() => setDossierActiveTab("grades")}
              >
                <HiOutlineTrophy /> 9. Baholar & Imtihonlar
              </button>
              <button
                type="button"
                className={`dossier-tab-btn ${dossierActiveTab === "parents" ? "active" : ""}`}
                onClick={() => setDossierActiveTab("parents")}
              >
                <HiOutlineChatBubbleLeftRight /> 10. Ota-ona & Aloqa
              </button>
              <button
                type="button"
                className={`dossier-tab-btn ${dossierActiveTab === "transfers" ? "active" : ""}`}
                onClick={() => setDossierActiveTab("transfers")}
              >
                <HiOutlineArrowsRightLeft /> 11. Guruhlar Tarixi
              </button>
            </div>

            <div className="dossier-tab-content">
              {dossierActiveTab === "payments" && (
                <div className="dossier-tab-panel">
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Kvitansiya 9 Xonali ID</th>
                          <th>To'lov Sanasi</th>
                          <th>To'lov Usuli</th>
                          <th>Summa</th>
                          <th>Holati</th>
                          <th>Chek</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="id-pill">#800109812</span></td>
                          <td>15.08.2026</td>
                          <td><span className="group-tag-pill">Click</span></td>
                          <td><strong>{formatMoney(850000)}</strong></td>
                          <td><span className="status-pill pill-paid">Muvaffaqiyatli</span></td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => toast.success("Kvitansiya cheki yuklab olindi!")}
                            >
                              <HiOutlineArrowDownTray /> Chek PDF
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td><span className="id-pill">#800108421</span></td>
                          <td>15.07.2026</td>
                          <td><span className="group-tag-pill">Payme</span></td>
                          <td><strong>{formatMoney(850000)}</strong></td>
                          <td><span className="status-pill pill-paid">Muvaffaqiyatli</span></td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => toast.success("Kvitansiya cheki yuklab olindi!")}
                            >
                              <HiOutlineArrowDownTray /> Chek PDF
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {dossierActiveTab === "attendance" && (
                <div className="dossier-tab-panel">
                  <div className="attendance-summary-cards">
                    <div className="attendance-stat-box">
                      <span className="kpi-label">O'rtacha Davomat</span>
                      <strong className="kpi-value text-emerald">88%</strong>
                    </div>
                    <div className="attendance-stat-box">
                      <span className="kpi-label">Kelgan Darslari</span>
                      <strong className="kpi-value">14 ta dars</strong>
                    </div>
                    <div className="attendance-stat-box">
                      <span className="kpi-label">Qoldirgan Darslari</span>
                      <strong className="kpi-value text-danger">2 ta dars</strong>
                    </div>
                  </div>

                  <h5 className="section-title text-sm mb-2">So'nggi darslar jurnali:</h5>
                  <div className="attendance-dots-grid">
                    {dossierData.mockAttendance.map((a, idx) => (
                      <div
                        key={idx}
                        className={`attendance-dot-item ${
                          a.status === "present"
                            ? "dot-present"
                            : a.status === "late"
                            ? "dot-late"
                            : "dot-absent"
                        }`}
                      >
                        <div>{a.date}</div>
                        <small>{a.status === "present" ? "Keldi" : a.status === "late" ? "Kechikdi" : "Kelmadi"}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dossierActiveTab === "grades" && (
                <div className="dossier-tab-panel">
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Imtihon / Nazorat Ishi</th>
                          <th>To'plagan Bali</th>
                          <th>Maksimal Ball</th>
                          <th>Baho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dossierData.mockExams.map((ex, idx) => (
                          <tr key={idx}>
                            <td><strong>{ex.title}</strong></td>
                            <td><strong className="text-emerald">{ex.score} ball</strong></td>
                            <td>{ex.maxScore} ball</td>
                            <td><span className="group-tag-pill">{ex.grade}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {dossierActiveTab === "parents" && (
                <div className="dossier-tab-panel">
                  <div className="contact-card-grid">
                    <div className="contact-info-card">
                      <span className="contact-card-title">O'quvchining O'zi:</span>
                      <strong>{selectedDossierStudent.fullName}</strong>
                      <a href={`tel:${selectedDossierStudent.phone}`} className="contact-phone-btn">
                        <HiOutlinePhone /> {selectedDossierStudent.phone}
                      </a>
                    </div>

                    <div className="contact-info-card">
                      <span className="contact-card-title">Ota-onasi / Vasiysi:</span>
                      <strong>{selectedDossierStudent.fullName} ning Ota-onasi</strong>
                      <a href={`tel:${selectedDossierStudent.parentPhone || selectedDossierStudent.phone}`} className="contact-phone-btn">
                        <HiOutlinePhone /> {selectedDossierStudent.parentPhone || selectedDossierStudent.phone}
                      </a>
                      <div className="mt-2">
                        <a
                          href={`https://t.me/${String(selectedDossierStudent.parentPhone || selectedDossierStudent.phone || "").replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          <FaTelegram className="inline-icon-xs text-indigo" /> Telegramdan Bog'lanish
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="feature-special-card">
                    <div className="feature-special-header">
                      <span className="feature-special-title">
                        <FaTelegram className="text-indigo" />
                        2. Telegram Bot Integratsiyasi & Bildirishnomalar
                      </span>
                      <span className={`status-pill ${dossierData.isBotConnected ? "pill-paid" : "pill-overdue"}`}>
                        {dossierData.isBotConnected ? "Faol Ulangan" : "Ulanmagan"}
                      </span>
                    </div>
                    <p className="text-muted text-xs mb-3">
                      Davomat, baholar va to'lov kvitansiyalari avtomatik ravishda o'quvchi va ota-onaning Telegram botiga yuboriladi.
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => toast.success(`"${selectedDossierStudent.fullName}" telefoniga botga ulanish havolasi yuborildi!`)}
                    >
                      <HiOutlinePaperAirplane /> Botga Ulanish Havolasini Yuborish
                    </button>
                  </div>

                  <div className="feature-special-card">
                    <div className="feature-special-header">
                      <span className="feature-special-title">
                        <HiOutlineCake className="text-amber" />
                        9. Tug'ilgan Kuni & Tabriknoma Eslatmasi
                      </span>
                      <span className="birthday-pill">
                        {dossierData.birthDateDisplay} ({dossierData.studentAge} yosh)
                      </span>
                    </div>
                    <p className="text-muted text-xs mb-3">
                      O'quvchining tug'ilgan kuniga 3 kun qolganda tizim avtomatik eslatma beradi va maxsus 15% chegirma promo-kodini taklif qiladi.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => toast.success(`🎉 "${selectedDossierStudent.fullName}" ga tug'ilgan kun tabriknomasi va 15% chegirma promo-kodi yuborildi!`)}
                    >
                      <HiOutlineSparkles /> 🎉 Tabrik Xabarnomasi & Chegirma Yuborish
                    </button>
                  </div>
                </div>
              )}

              {dossierActiveTab === "transfers" && (
                <div className="dossier-tab-panel">
                  <div className="transfer-info-banner">
                    <div><strong>Hozirgi Guruhi:</strong> {selectedDossierStudent.groupName}</div>
                    <div><strong>Guruhga Biriktirilgan Sana:</strong> 01.06.2026</div>
                    <div><strong>Guruh O'zgartirish Tarixi:</strong> 1 marta (Dars vaqti mos kelmaganligi sababli kechki guruhga o'tkazilgan)</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions-flex">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModals}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <label className="form-label">Tug'ilgan Sanasi (9):</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-form-grid">
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
