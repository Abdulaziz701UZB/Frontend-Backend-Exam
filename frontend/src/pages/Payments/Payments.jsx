import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { paymentsApi, studentsApi, groupsApi } from "../../services/api";
import {
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentText,
  HiMagnifyingGlass,
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
import { FaMoneyBillWave } from "react-icons/fa6";
import "./Payments.css";

const Payments = () => {
  const { canManagePayments, isStudent, user } = useEduAuth();
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("history");
  const [searchTerm, setSearchTerm] = useState("");
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
    const studentObj =
      students.find((s) => s.id === parseInt(formData.studentId)) ||
      students[0];
    const amountVal = parseFloat(formData.amount);

    const payload = {
      student_id: studentObj?.id,
      student_name: studentObj?.fullName || "",
      group_name: studentObj?.groupName || "",
      amount: amountVal,
      month: formData.month,
      payment_method: formData.paymentMethod,
      date: formData.date,
      recorded_by: user.name,
    };

    try {
      if (editingPayment) {
        await paymentsApi.update(editingPayment.id, payload);
        toast.success("To'lov kvitansiyasi yangilandi!");
      } else {
        await paymentsApi.create({
          id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
          ...payload,
        });

        if (studentObj) {
          const newBal = (studentObj.balance || 0) + amountVal;
          await studentsApi.update(studentObj.id, {
            balance: newBal >= 0 ? 0 : newBal,
            payment_status: newBal >= 0 ? "Paid" : "Overdue",
          });
        }
        toast.success(`${studentObj?.fullName} uchun ${formatMoney(amountVal)} to'lov qabul qilindi!`);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm("Haqiqatan ham ushbu to'lov kvitansiyasini o'chirmoqchisiz?")) {
      try {
        await paymentsApi.delete(paymentId);
        toast.success("To'lov kvitansiyasi o'chirildi!");
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const displayPayments = payments.filter((p) => {
    if (isStudent && p.studentId !== user.studentId) return false;

    if (filterMethod !== "all") {
      const pMethod = (p.paymentMethod || "").toLowerCase();
      const fMethod = filterMethod.toLowerCase();
      if (!pMethod.includes(fMethod)) return false;
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        (p.studentName || "").toLowerCase().includes(s) ||
        (p.id || "").toLowerCase().includes(s) ||
        (p.paymentMethod || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  const debtorsList = students.filter((s) => s.paymentStatus === "Overdue");
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDebts = debtorsList.reduce(
    (sum, s) => sum + Math.abs(s.balance || 0),
    0,
  );

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount || 0) + " so'm";
  };

  return (
    <div className="payments-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineCreditCard style={{ verticalAlign: 'middle', marginRight: 6 }} />
            To'lovlar va Moliya Boshqaruvi
          </h1>
          <p className="page-subtitle">
            O'quv markazining oylik to'lovlari, to'lov usullari filtri (#12) va tushum hisoboti
          </p>
        </div>
        {canManagePayments && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> To'lov Qabul Qilish
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
              onClick={() => setActiveTab("history")}
            >
              <HiOutlineDocumentText /> To'lovlar Tarixi ({payments.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "debtors" ? "active" : ""}`}
              onClick={() => setActiveTab("debtors")}
            >
              <HiOutlineExclamationTriangle /> Qarzdorlar Ro'yxati ({debtorsList.length})
            </button>
          </div>

          {activeTab === "history" && (
            <div className="flex items-center gap-3">
              <div className="search-box">
                <HiMagnifyingGlass className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="F.I.SH yoki kvitansiya ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                style={{ width: 200 }}
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
          <div style={{ padding: 20 }}>
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
          </div>
        ) : activeTab === "history" ? (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Kvitansiya ID</th>
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
                {displayPayments.length === 0 ? (
                  <tr>
                    <td colSpan={canManagePayments ? 8 : 7} className="text-center py-6 text-muted">
                      Mos keluvchi to'lovlar topilmadi
                    </td>
                  </tr>
                ) : (
                  displayPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="code-pill">{p.id}</span>
                      </td>
                      <td>
                        <strong>{p.studentName}</strong>
                      </td>
                      <td>{p.groupName}</td>
                      <td>
                        <strong className="text-success">
                          {formatMoney(p.amount)}
                        </strong>
                      </td>
                      <td>{p.month}</td>
                      <td>
                        <span className="payment-method-badge">
                          {p.paymentMethod}
                        </span>
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
                              onClick={() => handleDeletePayment(p.id)}
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
                  <th>O'quvchi F.I.SH</th>
                  <th>Telefon</th>
                  <th>Guruh</th>
                  <th>Qarzdorlik Summasi</th>
                  <th>Holati</th>
                  <th>Eslatma Yuborish</th>
                </tr>
              </thead>
              <tbody>
                {debtorsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-muted">
                      Ajoyib! Hozirda barcha o'quvchilar to'lovlarni o'z vaqtida amalga oshirgan
                    </td>
                  </tr>
                ) : (
                  debtorsList.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <strong>{d.fullName}</strong>
                      </td>
                      <td>
                        <a href={`tel:${d.phone}`} className="phone-link">
                          <HiOutlinePhone style={{ verticalAlign: 'middle', marginRight: 2 }} /> {d.phone}
                        </a>
                      </td>
                      <td>{d.groupName}</td>
                      <td>
                        <strong className="text-danger">
                          {formatMoney(Math.abs(d.balance))}
                        </strong>
                      </td>
                      <td>
                        <span className="status-pill pill-overdue">
                          Qarzdor
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            toast.success(
                              `${d.fullName} ning ota-onasiga (${d.phone}) SMS va Telegram to'lov eslatmasi yuborildi!`,
                            )
                          }
                        >
                          <HiOutlineChatBubbleLeftRight /> Eslatma Yuborish
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <HiOutlineCreditCard style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {editingPayment ? "To'lovni Tahrirlash" : "Yangi To'lov Qabul Qilish"}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">O'quvchi:</label>
                  <select
                    className="form-select"
                    value={formData.studentId}
                    onChange={(e) => {
                      const sid = e.target.value;
                      const s = students.find((item) => item.id === parseInt(sid));
                      const g = groups.find((item) => item.id === s?.groupId);
                      setFormData({
                        ...formData,
                        studentId: sid,
                        amount: g?.monthlyFee || 850000,
                      });
                    }}
                    disabled={Boolean(editingPayment)}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.groupName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Summasi (so'm):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Qaysi Oy Uchun:</label>
                  <select
                    className="form-select"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                  >
                    <option value="Iyul 2026">Iyul 2026</option>
                    <option value="Avgust 2026">Avgust 2026</option>
                    <option value="Sentyabr 2026">Sentyabr 2026</option>
                    <option value="Oktyabr 2026">Oktyabr 2026</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Usuli:</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                  >
                    <option value="Card (Click)">Click (Plastik Karta)</option>
                    <option value="Card (Payme)">Payme (Plastik Karta)</option>
                    <option value="Cash (Naqd)">Naqd Pul (Kassa)</option>
                    <option value="Bank Transfer">Bank O'tkazmasi</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">To'lov Sanasi:</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
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
                  <HiOutlineCheckCircle /> Kvitansiyani Saqlash
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
