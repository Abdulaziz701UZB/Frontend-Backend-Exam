import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { paymentsApi, studentsApi, groupsApi } from "../../services/api";
import { format9DigitId } from "../../utils/idFormatter";
import {
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentText,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineDevicePhoneMobile,
  HiOutlineBuildingLibrary
} from "react-icons/hi2";
import { FaMoneyBillWave, FaUserGraduate } from "react-icons/fa6";
import "./Payments.css";

const Payments = () => {
  const { canManagePayments, isStudent, user } = useEduAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "debtors" ? "debtors" : "history");
  const [filterMethod, setFilterMethod] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [formData, setFormData] = useState({
    studentId: 1,
    amount: 850000,
    month: "Avgust 2026",
    paymentMethod: "Card (Click)",
    date: new Date().toISOString().split("T")[0],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, sData, gData] = await Promise.all([
        paymentsApi.getAll(),
        studentsApi.getAll(),
        groupsApi.getAll(),
      ]);
      setPayments(pData);
      setStudents(sData);
      setGroups(gData);
    } catch (err) {
      toast.error("To'lovlar ma'lumotlarini yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get("tab") === "debtors") {
      setActiveTab("debtors");
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setEditingPayment(null);
    const firstStudent = students[0];
    const firstGroup = groups.find((g) => g.id === firstStudent?.groupId);

    setFormData({
      studentId: firstStudent?.id || 1,
      amount: firstGroup?.monthlyFee || 850000,
      month: "Avgust 2026",
      paymentMethod: "Card (Click)",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setFormData({
      studentId: payment.studentId,
      amount: payment.amount,
      month: payment.month,
      paymentMethod: payment.paymentMethod,
      date: payment.date,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const studentObj = students.find((s) => s.id === parseInt(formData.studentId)) || students[0];
    const groupObj = groups.find((g) => g.id === studentObj?.groupId);

    const payload = {
      student_id: parseInt(formData.studentId),
      student_name: studentObj?.fullName || "",
      group_name: groupObj ? `${groupObj.name} (${groupObj.courseName})` : studentObj?.groupName || "",
      amount: parseFloat(formData.amount),
      month: formData.month,
      payment_method: formData.paymentMethod,
      date: formData.date,
    };

    try {
      if (editingPayment) {
        await paymentsApi.update(editingPayment.id, payload);
        toast.success("To'lov kvitansiyasi yangilandi!");
      } else {
        await paymentsApi.create({
          id: `PAY-${Math.floor(100000000 + Math.random() * 900000000)}`,
          ...payload,
        });
        toast.success("Yangi to'lov qabul qilindi!");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham ushbu to'lov yozuvini o'chirmoqchimisiz?")) {
      try {
        await paymentsApi.delete(id);
        toast.success("To'lov yozuvi o'chirildi!");
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount || 0) + " so'm";
  };

  const debtorsList = students.filter(
    (s) => s.paymentStatus === "Overdue" || s.balance < 0
  );

  const filteredPayments = payments.filter((p) => {
    if (filterMethod !== "all") {
      const pm = (p.paymentMethod || "").toLowerCase();
      if (filterMethod === "click" && !pm.includes("click")) return false;
      if (filterMethod === "payme" && !pm.includes("payme")) return false;
      if (filterMethod === "naqd" && !pm.includes("naqd") && !pm.includes("cash")) return false;
      if (filterMethod === "bank" && !pm.includes("bank") && !pm.includes("o'tkazma")) return false;
    }
    return true;
  });

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDebts = debtorsList.reduce((sum, s) => sum + (s.balance < 0 ? Math.abs(s.balance) : 850000), 0);

  return (
    <div className="payments-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineCreditCard className="title-icon-indigo" />
            4. To'lovlar va Kassa Boshqaruvi
          </h1>
          <p className="page-subtitle">
            O'quv markazining barcha to'lov kvitansiyalari, kassa hisoboti va qarzdorlar ro'yxati
          </p>
        </div>

        {canManagePayments && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi To'lov Qabul Qilish
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-success">
          <div className="stat-icon-wrap">
            <HiOutlineBanknotes />
          </div>
          <div className="stat-content">
            <span className="stat-label">Jami Tushum</span>
            <div className="stat-value">{formatMoney(totalRevenue)}</div>
            <span className="stat-trend positive">
              Jami {payments.length} ta kvitansiya
            </span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon-wrap">
            <HiOutlineExclamationTriangle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Qarzdorlik</span>
            <div className="stat-value">{formatMoney(totalDebts)}</div>
            <span className="stat-trend negative">
              {debtorsList.length} ta o'quvchi
            </span>
          </div>
        </div>
      </div>

      <div className="card filter-card">
        <div className="filter-controls-row">
          <div className="tabs-nav">
            <button
              type="button"
              className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("history");
                setSearchParams({});
              }}
            >
              <HiOutlineDocumentText /> To'lovlar Tarixi ({payments.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "debtors" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("debtors");
                setSearchParams({ tab: "debtors" });
              }}
            >
              <HiOutlineExclamationTriangle /> Qarzdorlar Ro'yxati ({debtorsList.length})
            </button>
          </div>

          {activeTab === "history" && (
            <div className="flex items-center gap-3">
              <select
                className="form-select filter-select-fixed"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
              >
                <option value="all">Barcha To'lov Usullari</option>
                <option value="click">Click</option>
                <option value="payme">Payme</option>
                <option value="naqd">Naqd Pul (Kassa)</option>
                <option value="bank">Bank O'tkazmasi</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="card table-card">
        {loading ? (
          <div className="skeleton-wrap">
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
          </div>
        ) : activeTab === "history" ? (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Kvitansiya 9 Xonali ID</th>
                  <th>O'quvchi F.I.SH</th>
                  <th>Guruh</th>
                  <th>Summa</th>
                  <th>Oy</th>
                  <th>To'lov Usuli</th>
                  <th>Sana</th>
                  {canManagePayments && <th className="text-center">Amallar</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-6">
                      To'lovlar tarixi bo'sh
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="id-pill">#PAY-{format9DigitId(p.id, "payment")}</span>
                      </td>
                      <td>
                        <Link
                          to={`/students/${format9DigitId(p.studentId, "student")}`}
                          className="font-bold text-dark hover-indigo"
                        >
                          {p.studentName}
                        </Link>
                      </td>
                      <td>
                        <span className="group-tag-pill">{p.groupName}</span>
                      </td>
                      <td>
                        <strong className="text-emerald">{formatMoney(p.amount)}</strong>
                      </td>
                      <td>{p.month}</td>
                      <td>
                        <span className="group-tag-pill">{p.paymentMethod}</span>
                      </td>
                      <td>{p.date}</td>
                      {canManagePayments && (
                        <td className="text-center">
                          <div className="action-buttons-flex">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditModal(p)}
                              title="Tahrirlash"
                            >
                              <HiOutlinePencilSquare />
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(p.id)}
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
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>O'quvchi 9 Xonali ID</th>
                  <th>O'quvchi F.I.SH</th>
                  <th>Telefon Raqami</th>
                  <th>Guruhi</th>
                  <th>Qarz Miqdori</th>
                  <th>Holati</th>
                  <th>Dosyeni Ochish</th>
                </tr>
              </thead>
              <tbody>
                {debtorsList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-6">
                      Barcha o'quvchilar to'lovlarini to'liq amalga oshirgan, qarzdorlar yo'q!
                    </td>
                  </tr>
                ) : (
                  debtorsList.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="id-pill">#{format9DigitId(s.id, "student")}</span>
                      </td>
                      <td>
                        <strong className="student-name-text">{s.fullName}</strong>
                      </td>
                      <td>
                        <HiOutlinePhone className="inline-icon-xs" /> {s.phone}
                      </td>
                      <td>
                        <span className="group-tag-pill">{s.groupName}</span>
                      </td>
                      <td>
                        <strong className="text-danger">
                          {formatMoney(s.balance < 0 ? Math.abs(s.balance) : 850000)}
                        </strong>
                      </td>
                      <td>
                        <span className="status-pill pill-overdue">
                          <HiOutlineExclamationTriangle className="inline-icon-xs" /> Qarzdor
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/students/${format9DigitId(s.id, "student")}`)}
                        >
                          <FaUserGraduate /> 360° Dosye
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingPayment ? "To'lovni Tahrirlash" : "Yangi To'lov Qabul Qilish"}
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
              <div className="form-group">
                <label className="form-label">O'quvchini Tanlang:</label>
                <select
                  className="form-select"
                  value={formData.studentId}
                  onChange={(e) => {
                    const selStudent = students.find((s) => s.id === parseInt(e.target.value));
                    const selGroup = groups.find((g) => g.id === selStudent?.groupId);
                    setFormData({
                      ...formData,
                      studentId: e.target.value,
                      amount: selGroup?.monthlyFee || formData.amount,
                    });
                  }}
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{format9DigitId(s.id, "student")} — {s.fullName} ({s.groupName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">To'lov Summasi (so'm):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Oyi:</label>
                  <select
                    className="form-select"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  >
                    <option value="Avgust 2026">Avgust 2026</option>
                    <option value="Sentabr 2026">Sentabr 2026</option>
                    <option value="Oktabr 2026">Oktabr 2026</option>
                    <option value="Noyabr 2026">Noyabr 2026</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">To'lov Usuli:</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="Card (Click)">Card (Click)</option>
                    <option value="Card (Payme)">Card (Payme)</option>
                    <option value="Naqd Pul (Kassa)">Naqd Pul (Kassa)</option>
                    <option value="Bank O'tkazmasi">Bank O'tkazmasi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Sanasi:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
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
                  {editingPayment ? "Saqlash" : "To'lovni Qabul Qilish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
